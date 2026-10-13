import { test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { listen } from './listen.js';

test('development uses another port when the requested port is occupied', async () => {
  const occupied = http.createServer();
  const app = http.createServer((req, res) => res.end('ok'));
  try {
    const port = await listen(occupied, { port: 0, host: '127.0.0.1' });
    const selected = await listen(app, { port, host: '127.0.0.1', retry: true });
    assert.ok(selected > port);
  } finally { occupied.close(); app.close(); }
});
test('production reports a busy port instead of changing the deployment port', async () => {
  const occupied = http.createServer();
  const app = http.createServer();
  try {
    const port = await listen(occupied, { port: 0, host: '127.0.0.1' });
    await assert.rejects(listen(app, { port, host: '127.0.0.1' }), { code: 'EADDRINUSE' });
  } finally { occupied.close(); app.close(); }
});
