import assert from 'node:assert/strict';
import test from 'node:test';
import { fetchGitHubRepoFromApi } from './githubRepo';

const originalFetch = globalThis.fetch;

test('fetchGitHubRepoFromApi: unreadable 2xx body → 502 result, never a throw', async () => {
  globalThis.fetch = (async () => new Response('', { status: 200 })) as typeof fetch;
  try {
    const result = await fetchGitHubRepoFromApi('unreadable-body/repo');
    assert.deepEqual(result, {
      ok: false,
      status: 502,
      error: 'GitHub API returned an unreadable response body.',
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('fetchGitHubRepoFromApi: network throw → 502 result', async () => {
  globalThis.fetch = (async () => {
    throw new Error('connect ECONNRESET');
  }) as typeof fetch;
  try {
    const result = await fetchGitHubRepoFromApi('throwing-fetch/repo');
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.status, 502);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('fetchGitHubRepoFromApi: happy path maps fields', async () => {
  globalThis.fetch = (async () =>
    new Response(
      JSON.stringify({
        full_name: 'Happy/Path',
        name: 'Path',
        description: 'A happy path',
        homepage: 'https://example.com',
        html_url: 'https://github.com/Happy/Path',
        stargazers_count: 42,
        forks_count: 3,
        language: 'Rust',
        license: { spdx_id: 'MIT' },
        topics: ['demo'],
        owner: { login: 'Happy', avatar_url: '' },
        pushed_at: '2026-01-01T00:00:00Z',
      }),
      { status: 200 },
    )) as typeof fetch;
  try {
    const result = await fetchGitHubRepoFromApi('happy-path/repo');
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.data.fullName, 'Happy/Path');
      assert.equal(result.data.stars, 42);
      assert.equal(result.data.forks, 3);
      assert.equal(result.data.license, 'MIT');
      assert.equal(result.data.language, 'Rust');
      assert.deepEqual(result.data.topics, ['demo']);
      assert.equal(result.data.ownerLogin, 'Happy');
      assert.equal(typeof result.data.fetchedAt, 'string');
    }
  } finally {
    globalThis.fetch = originalFetch;
  }
});
