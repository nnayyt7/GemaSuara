import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, readFile, unlink, rmdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { once } from 'node:events';

const dir = await mkdtemp(path.join(tmpdir(), 'gema-test-'));
const child = spawn(process.execPath, ['server/start.js'], { env: { ...process.env, PORT: '5198', DATA_DIR: dir }, stdio: ['ignore', 'pipe', 'inherit'] });
const base = 'http://127.0.0.1:5198';
const call = async (url, cookie = '', body) => {
  const response = await fetch(base + '/api' + url, { headers: { Cookie: cookie, 'Content-Type': 'application/json', 'X-Gema-Request': '1' }, ...(body !== undefined ? { method: 'POST', body: JSON.stringify(body) } : {}) });
  return { response, data: await response.json(), cookie: response.headers.get('set-cookie')?.split(';')[0] };
};
try {
  await Promise.race([once(child.stdout, 'data'), new Promise((_, reject) => setTimeout(() => reject(new Error('Server timeout')), 10000).unref())]);
  assert.equal((await call('/rooms')).response.status, 401);
  const teacher = await call('/login', '', { name: 'Dosen Uji' });
  const student = await call('/login', '', { name: 'Mahasiswa Uji' });
  assert.equal(teacher.data.name, 'Dosen Uji');
  const room = (await call('/rooms', teacher.cookie, { title: 'Kelas uji' })).data;
  assert.equal((await call(`/rooms/${room.id}`, student.cookie)).response.status, 404);
  await call('/join', student.cookie, { code: room.code });
  const controller = new AbortController();
  const stream = await fetch(`${base}/api/rooms/${room.id}/events`, { headers: { Cookie: student.cookie }, signal: controller.signal });
  const reader = stream.body.getReader();
  const history = new TextDecoder().decode((await reader.read()).value);
  assert.match(history, /history/);
  await call(`/rooms/${room.id}/messages`, teacher.cookie, { text: 'Caption nyata', kind: 'caption' });
  const event = new TextDecoder().decode((await reader.read()).value);
  assert.match(event, /Caption nyata/);
  const message = await call(`/rooms/${room.id}/messages`, student.cookie, { text: 'Pertanyaan', kind: 'caption' });
  assert.equal(message.data.kind, 'message');
  controller.abort();
  const stored = JSON.parse(await readFile(path.join(dir, 'database.json'), 'utf8'));
  assert.equal(stored.rooms[room.id].messages.length, 2);
  await call('/me', student.cookie, { name: 'Nama Baru' });
  assert.equal((await call('/me', student.cookie)).data.name, 'Nama Baru');
  await call('/logout', student.cookie, {});
  assert.equal((await call('/me', student.cookie)).response.status, 401);
  console.log('PASS: guest sessions, room membership, live SSE, caption permissions, persistence, profile, logout');
} finally {
  const exited = once(child, 'exit'); child.kill(); await exited;
  await unlink(path.join(dir, 'database.json')).catch(() => {});
  await rmdir(dir);
}
