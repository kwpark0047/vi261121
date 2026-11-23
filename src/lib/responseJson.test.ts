import assert from 'node:assert/strict';
import test from 'node:test';
import { readJsonBody } from './responseJson';

test('readJsonBody: parses a JSON object body', async () => {
  const resp = new Response(JSON.stringify({ a: 1 }), { status: 200 });
  assert.deepEqual(await readJsonBody(resp), { ok: true, value: { a: 1 } });
});

test('readJsonBody: empty body → kind "empty", no value fabricated', async () => {
  const resp = new Response('', { status: 200 });
  assert.deepEqual(await readJsonBody(resp), { ok: false, kind: 'empty', status: 200 });
});

test('readJsonBody: non-JSON body → kind "invalid" (no SyntaxError escapes)', async () => {
  const resp = new Response('<html>not json</html>', { status: 502 });
  assert.deepEqual(await readJsonBody(resp), { ok: false, kind: 'invalid', status: 502 });
});

test('readJsonBody: valid non-object JSON (array) still parses as value', async () => {
  const resp = new Response('[1,2]', { status: 200 });
  assert.deepEqual(await readJsonBody(resp), { ok: true, value: [1, 2] });
});

test('readJsonBody: body read failure → kind "invalid", never throws', async () => {
  const failing = {
    status: 500,
    text: async (): Promise<string> => {
      throw new Error('socket destroyed');
    },
  } as unknown as Response;
  assert.deepEqual(await readJsonBody(failing), { ok: false, kind: 'invalid', status: 500 });
});
