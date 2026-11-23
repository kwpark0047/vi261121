import assert from 'node:assert/strict';
import test from 'node:test';
import type { Request as ExpressRequest } from 'express';
import searchImages from './search';

const originalFetch = globalThis.fetch;
const originalKey = process.env.PIXABAY_API_KEY;

function restore(key: string | undefined, fetchFn: typeof fetch): void {
  if (key === undefined) delete process.env.PIXABAY_API_KEY;
  else process.env.PIXABAY_API_KEY = key;
  globalThis.fetch = fetchFn;
}

function fakeReq(query: Record<string, unknown>): ExpressRequest {
  return { query } as unknown as ExpressRequest;
}

test('missing query → 400 JSON error', async () => {
  const resp = await searchImages(fakeReq({}));
  assert.equal(resp.status, 400);
  assert.deepEqual(await resp.json(), { error: 'Search query is required.' });
});

test('no PIXABAY_API_KEY → 200 stub result, no upstream call', async () => {
  delete process.env.PIXABAY_API_KEY;
  let called = false;
  globalThis.fetch = (async () => {
    called = true;
    return new Response('', { status: 200 });
  }) as typeof fetch;
  try {
    const resp = await searchImages(fakeReq({ q: 'cats' }));
    assert.equal(resp.status, 200);
    const body = (await resp.json()) as { hits: unknown[]; message?: string };
    assert.deepEqual(body.hits, []);
    assert.equal(body.message, 'Pixabay API key not configured.');
    assert.equal(called, false);
  } finally {
    restore(originalKey, originalFetch);
  }
});

test('non-OK upstream → 502 with status in the message', async () => {
  process.env.PIXABAY_API_KEY = 'test-key';
  globalThis.fetch = (async () => new Response('nope', { status: 500 })) as typeof fetch;
  try {
    const out = await searchImages(fakeReq({ q: 'dogs' }));
    assert.equal(out.status, 502);
    const body = (await out.json()) as { error: string };
    assert.equal(body.error, 'Pixabay API returned 500.');
  } finally {
    restore(originalKey, originalFetch);
  }
});

test('2xx non-JSON upstream body → 502 readable error, not a throw', async () => {
  process.env.PIXABAY_API_KEY = 'test-key';
  globalThis.fetch = (async () => new Response('<html>gateway error</html>', { status: 200 })) as typeof fetch;
  try {
    const resp = await searchImages(fakeReq({ q: 'birds' }));
    assert.equal(resp.status, 502);
    const body = (await resp.json()) as { error: string };
    assert.match(body.error, /unreadable response body \(HTTP 200\)/);
  } finally {
    restore(originalKey, originalFetch);
  }
});

test('2xx JSON upstream → 200 passthrough with hits', async () => {
  process.env.PIXABAY_API_KEY = 'test-key';
  globalThis.fetch = (async () =>
    new Response(JSON.stringify({ hits: [{ id: 1, pageURL: 'https://x' }], total: 1, totalHits: 1 }), {
      status: 200,
    })) as typeof fetch;
  try {
    const resp = await searchImages(fakeReq({ q: 'birds', page: '2' }));
    assert.equal(resp.status, 200);
    const body = (await resp.json()) as { total: number; hits: unknown[] };
    assert.equal(body.total, 1);
    assert.equal(body.hits.length, 1);
  } finally {
    restore(originalKey, originalFetch);
  }
});
