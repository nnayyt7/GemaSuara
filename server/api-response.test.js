import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readApiResponse } from '../src/lib/api.js';

test('Vercel text 404 produces a helpful backend error, not JSON SyntaxError', async () => {
  await assert.rejects(readApiResponse(new Response('The page could not be found', { status: 404, headers: { 'Content-Type': 'text/plain' } })), /Backend perlu diaktifkan/);
});
test('SPA HTML fallback is rejected', async () => {
  await assert.rejects(readApiResponse(new Response('<html></html>', { headers: { 'Content-Type': 'text/html' } })), /Layanan GemaSuara belum terhubung/);
});
test('valid JSON and structured authentication errors are preserved', async () => {
  assert.deepEqual(await readApiResponse(Response.json({ ok: true })), { ok: true });
  await assert.rejects(readApiResponse(Response.json({ error: 'Masuk dahulu' }, { status: 401 })), (error) => error.status === 401 && error.message === 'Masuk dahulu');
});
test('malformed JSON is handled', async () => {
  await assert.rejects(readApiResponse(new Response('{', { headers: { 'Content-Type': 'application/json' } })), /Respons server tidak lengkap/);
});
