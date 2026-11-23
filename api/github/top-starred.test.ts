import assert from 'node:assert/strict';
import test from 'node:test';
import topStarred from './top-starred';

const originalFetch = globalThis.fetch;
const originalToken = process.env.GITHUB_TOKEN;

function restore(token: string | undefined, fetchFn: typeof fetch): void {
  if (token === undefined) delete process.env.GITHUB_TOKEN;
  else process.env.GITHUB_TOKEN = token;
  globalThis.fetch = fetchFn;
}

test('rejects prototype-chain preset names instead of treating them as known', async () => {
  const resp = await topStarred(new Request('http://localhost/api/github/top-starred?preset=toString'));
  assert.equal(resp.status, 400);
  const body = (await resp.json()) as { errorCode?: string };
  assert.equal(body.errorCode, 'INVALID_PRESET');
});

test('missing GITHUB_TOKEN → 401 MISSING_API_KEY with empty items', async () => {
  delete process.env.GITHUB_TOKEN;
  try {
    const resp = await topStarred(new Request('http://localhost/api/github/top-starred?preset=typescript'));
    assert.equal(resp.status, 401);
    const body = (await resp.json()) as { errorCode?: string; items?: unknown[] };
    assert.equal(body.errorCode, 'MISSING_API_KEY');
    assert.deepEqual(body.items, []);
  } finally {
    restore(originalToken, originalFetch);
  }
});

test('"all" preset maps to a real search query and parses items', async () => {
  process.env.GITHUB_TOKEN = 'test-token';
  let requestedUrl = '';
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    requestedUrl = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    return new Response(JSON.stringify({ total_count: 0, items: [] }), { status: 200 });
  }) as typeof fetch;
  try {
    const resp = await topStarred(new Request('http://localhost/api/github/top-starred?preset=all'));
    assert.equal(resp.status, 200);
    const body = (await resp.json()) as { preset: string; items: unknown[] };
    assert.equal(body.preset, 'all');
    assert.deepEqual(body.items, []);
    const url = new URL(requestedUrl);
    assert.equal(url.searchParams.get('q'), 'stars:>0');
    assert.equal(url.searchParams.get('sort'), 'stars');
    assert.equal(url.searchParams.get('order'), 'desc');
  } finally {
    restore(originalToken, originalFetch);
  }
});

test('2xx items are mapped into ranked entries', async () => {
  process.env.GITHUB_TOKEN = 'test-token';
  globalThis.fetch = (async () =>
    new Response(
      JSON.stringify({
        total_count: 1,
        items: [
          {
            id: 7,
            full_name: 'acme/widget',
            description: 'Widgets',
            html_url: 'https://github.com/acme/widget',
            stargazers_count: 12,
            forks_count: 2,
            language: 'Rust',
            license: { spdx_id: 'MIT' },
            owner: { login: 'acme', avatar_url: 'https://img' },
          },
        ],
      }),
      { status: 200 },
    )) as typeof fetch;
  try {
    const resp = await topStarred(new Request('http://localhost/api/github/top-starred?preset=rust'));
    assert.equal(resp.status, 200);
    const body = (await resp.json()) as { staleCache?: boolean; items: Array<Record<string, unknown>> };
    assert.equal(body.staleCache, false);
    assert.deepEqual(body.items, [
      {
        id: 7,
        rank: 1,
        fullName: 'acme/widget',
        ownerLogin: 'acme',
        ownerAvatarUrl: 'https://img',
        description: 'Widgets',
        htmlUrl: 'https://github.com/acme/widget',
        stars: 12,
        forks: 2,
        language: 'Rust',
        license: 'MIT',
      },
    ]);
  } finally {
    restore(originalToken, originalFetch);
  }
});
