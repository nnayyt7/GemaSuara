import http from 'node:http';
import { randomBytes } from 'node:crypto';
import { readFile, mkdir, writeFile, rename } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = path.resolve(process.env.DATA_DIR || path.join(root, '.data'));
await mkdir(dataDir, { recursive: true });
const dbPath = path.join(dataDir, 'database.json');
let db;
try { db = JSON.parse(await readFile(dbPath, 'utf8')); }
catch (error) { if (error.code !== 'ENOENT') throw error; db = { users: {}, rooms: {} }; }
let saving = Promise.resolve();
function save() {
  const snapshot = JSON.stringify(db);
  saving = saving.catch(() => {}).then(async () => { await writeFile(`${dbPath}.tmp`, snapshot); await rename(`${dbPath}.tmp`, dbPath); });
  return saving;
}
const subscribers = new Map();
const rate = new Map();
const id = () => randomBytes(18).toString('hex');
const json = (res, status, body) => { res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(body)); };
const userFor = (req) => db.users[(req.headers.cookie || '').match(/(?:^|;\s*)gema_session=([a-f0-9]+)/)?.[1]];
const publicRoom = (room) => ({ id: room.id, code: room.code, title: room.title, owner: room.owner, members: room.members.length });
async function body(req) {
  let text = '';
  for await (const chunk of req) { text += chunk; if (text.length > 12000) throw new Error('Permintaan terlalu besar.'); }
  return JSON.parse(text || '{}');
}
const production = process.env.NODE_ENV === 'production';
const allowedOrigins = new Set((process.env.ALLOWED_ORIGINS || '').split(',').map((value) => value.trim()).filter(Boolean));
const crossSite = process.env.COOKIE_SAME_SITE === 'none';
if (crossSite && process.env.COOKIE_SECURE !== 'true') throw new Error('COOKIE_SAME_SITE=none requires COOKIE_SECURE=true');
const cookieFlags = `HttpOnly; SameSite=${crossSite ? 'None' : 'Lax'}; Path=/${process.env.COOKIE_SECURE === 'true' ? '; Secure' : ''}`;
const vite = production ? null : await (await import('vite')).createServer({ root, server: { middlewareMode: true }, appType: 'spa' });
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (!url.pathname.startsWith('/api/')) {
    if (vite) return vite.middlewares(req, res);
    try {
      const pathname = decodeURIComponent(url.pathname);
      const relative = pathname.startsWith('/assets/') ? pathname.slice(1) : 'index.html';
      const target = path.resolve(root, 'dist', relative);
      if (!target.startsWith(path.join(root, 'dist') + path.sep)) return json(res, 403, { error: 'Akses ditolak.' });
      const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff' };
      res.setHeader('Content-Type', types[path.extname(target)] || 'application/octet-stream');
      res.end(await readFile(target));
    } catch { json(res, 404, { error: 'Halaman tidak ditemukan.' }); }
    return;
  }
  try {
    const origin = req.headers.origin;
    const sameOrigin = !origin || new URL(origin).host === req.headers.host;
    if (origin && !sameOrigin && !allowedOrigins.has(origin)) return json(res, 403, { error: 'Origin tidak diizinkan.' });
    if (origin && allowedOrigins.has(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Vary', 'Origin');
    }
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Gema-Request');
      res.writeHead(204); res.end(); return;
    }
    if (req.method === 'POST') {
      if (req.headers['x-gema-request'] !== '1') return json(res, 403, { error: 'Permintaan tidak valid.' });
      const key = req.socket.remoteAddress;
      const now = Date.now();
      const item = rate.get(key);
      if (!item || now - item.time > 60000) rate.set(key, { time: now, count: 1 });
      else if (++item.count > 180) return json(res, 429, { error: 'Terlalu banyak permintaan. Coba sebentar lagi.' });
    }
    if (url.pathname === '/api/health') return json(res, 200, { ok: true });
    if (url.pathname === '/api/login' && req.method === 'POST') {
      const input = await body(req); const name = String(input.name || '').trim().slice(0, 40);
      if (!name) return json(res, 400, { error: 'Masukkan nama.' });
      const token = id(); const user = { id: id(), name }; db.users[token] = user; await save();
      res.setHeader('Set-Cookie', `gema_session=${token}; ${cookieFlags}; Max-Age=2592000`);
      return json(res, 200, user);
    }
    const user = userFor(req);
    if (!user) return json(res, 401, { error: 'Silakan masuk terlebih dahulu.' });
    if (url.pathname === '/api/me') {
      if (req.method === 'POST') { const input = await body(req); const name = String(input.name || '').trim().slice(0, 40); if (!name) return json(res, 400, { error: 'Nama wajib diisi.' }); user.name = name; await save(); }
      return json(res, 200, user);
    }
    if (url.pathname === '/api/logout' && req.method === 'POST') {
      for (const [token, value] of Object.entries(db.users)) if (value.id === user.id) delete db.users[token];
      for (const group of subscribers.values()) for (const client of group) if (client.userId === user.id) { client.res.end(); group.delete(client); }
      await save(); res.setHeader('Set-Cookie', `gema_session=; ${cookieFlags}; Max-Age=0`); return json(res, 200, { ok: true });
    }
    if (url.pathname === '/api/rooms') {
      if (req.method === 'POST') {
        const input = await body(req); const title = String(input.title || '').trim().slice(0, 80);
        if (!title) return json(res, 400, { error: 'Nama kelas wajib diisi.' });
        let code; do { code = randomBytes(3).toString('hex').toUpperCase(); } while (Object.values(db.rooms).some((r) => r.code === code));
        const room = { id: id(), code, title, owner: user.id, members: [user.id], messages: [] }; db.rooms[room.id] = room; await save(); return json(res, 201, publicRoom(room));
      }
      return json(res, 200, Object.values(db.rooms).filter((r) => r.members.includes(user.id)).map(publicRoom));
    }
    if (url.pathname === '/api/join' && req.method === 'POST') {
      const input = await body(req); const room = Object.values(db.rooms).find((r) => r.code === String(input.code || '').trim().toUpperCase());
      if (!room) return json(res, 404, { error: 'Kode kelas tidak ditemukan.' });
      if (!room.members.includes(user.id)) room.members.push(user.id);
      await save(); return json(res, 200, publicRoom(room));
    }
    const match = url.pathname.match(/^\/api\/rooms\/([a-f0-9]+)(?:\/(events|messages))?$/);
    const room = match && db.rooms[match[1]];
    if (!room || !room.members.includes(user.id)) return json(res, 404, { error: 'Kelas tidak ditemukan atau belum bergabung.' });
    if (match[2] === 'events' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive', 'X-Accel-Buffering': 'no' });
      res.write(`data: ${JSON.stringify({ type: 'history', messages: room.messages })}\n\n`);
      const clients = subscribers.get(room.id) || new Set(); subscribers.set(room.id, clients);
      const client = { res, userId: user.id }; clients.add(client);
      const timer = setInterval(() => res.write(': heartbeat\n\n'), 20000);
      res.on('close', () => { clearInterval(timer); clients.delete(client); if (!clients.size) subscribers.delete(room.id); });
      return;
    }
    if (match[2] === 'messages' && req.method === 'POST') {
      const input = await body(req); const text = String(input.text || '').trim().slice(0, 2000);
      if (!text) return json(res, 400, { error: 'Pesan kosong.' });
      const message = { id: id(), text, userId: user.id, name: user.name, kind: input.kind === 'caption' && room.owner === user.id ? 'caption' : 'message', createdAt: Date.now() };
      room.messages.push(message); room.messages = room.messages.slice(-500); await save();
      for (const client of subscribers.get(room.id) || []) client.res.write(`data: ${JSON.stringify({ type: 'message', message })}\n\n`);
      return json(res, 201, message);
    }
    return json(res, 200, publicRoom(room));
  } catch (error) { console.error(error); if (!res.headersSent) json(res, 400, { error: 'Permintaan gagal. Silakan coba lagi.' }); else res.end(); }
});
const port = Number(process.env.PORT || 5173);
server.listen(port, process.env.HOST || '127.0.0.1', () => console.log(`GemaSuara siap: http://localhost:${port}`));
