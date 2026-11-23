import assert from 'node:assert/strict';
import test from 'node:test';
import {
  computeLeaderboardSummary,
  extractLeaderboardLanguages,
  filterGitHubRankedRepos,
  findCatalogProjectByRepo,
  parseTopStarredPayload,
} from './githubLeaderboard';
import type { CatalogProject, GitHubRankedRepo } from '../types/vibeatlas';

function repo(overrides: Partial<GitHubRankedRepo>): GitHubRankedRepo {
  return {
    id: 1,
    rank: 1,
    fullName: 'owner/repo',
    ownerLogin: 'owner',
    ownerAvatarUrl: '',
    description: 'desc',
    htmlUrl: 'https://github.com/owner/repo',
    stars: 10,
    forks: 1,
    language: 'TypeScript',
    license: 'MIT',
    ...overrides,
  };
}

const project = (overrides: Partial<CatalogProject>): CatalogProject =>
  ({
    id: 'p1',
    slug: 'owner-repo',
    name: 'Repo',
    tagline: '',
    taglineKo: '',
    description: '',
    descriptionKo: '',
    contentType: 'open_source',
    categories: [],
    techStack: [],
    developmentPlatform: 'cursor',
    hostingProvider: 'github_pages',
    backendTech: 'none',
    country: 'US',
    language: 'en',
    license: 'MIT',
    pricingModel: 'open_source',
    verificationStatus: 'unverified',
    provenanceSource: 'github_sync',
    liveDemoUrl: '',
    websiteUrl: '',
    githubRepo: 'owner/repo',
    githubUrl: '',
    thumbnailUrl: '',
    makerName: '',
    makerHandle: '',
    ownerUid: '',
    githubStars: 10,
    githubForks: 1,
    likesCount: 0,
    bookmarksCount: 0,
    lastSyncedAt: '',
    createdAtIso: '',
    updatedAtIso: '',
    ...overrides,
  }) as CatalogProject;

test('computeLeaderboardSummary: empty list yields zeros', () => {
  assert.deepEqual(computeLeaderboardSummary([]), {
    totalRepos: 0,
    topStars: 0,
    topRepoName: '',
    medianStars: 0,
  });
});

test('computeLeaderboardSummary: total/top/median (even count averages the two middles)', () => {
  const summary = computeLeaderboardSummary([
    repo({ id: 1, stars: 100, fullName: 'a/a' }),
    repo({ id: 2, stars: 50 }),
    repo({ id: 3, stars: 10 }),
    repo({ id: 4, stars: 5 }),
  ].map((r) => ({ ...r, fullName: r.fullName || `r/r${r.id}` })));
  assert.equal(summary.totalRepos, 4);
  assert.equal(summary.topStars, 100);
  assert.equal(summary.topRepoName, 'a/a');
  assert.equal(summary.medianStars, 30);
});

test('computeLeaderboardSummary: odd count median is the middle value; negatives clamp to 0', () => {
  const summary = computeLeaderboardSummary([
    repo({ id: 1, stars: 30 }),
    repo({ id: 2, stars: -5 }),
  ]);
  assert.equal(summary.medianStars, 15);
  assert.equal(summary.topStars, 30);
});

test('extractLeaderboardLanguages: unique, non-empty, case-insensitive dedupe, sorted', () => {
  const langs = extractLeaderboardLanguages([
    repo({ id: 1, language: 'TypeScript' }),
    repo({ id: 2, language: 'typescript' }),
    repo({ id: 3, language: '' }),
    repo({ id: 4, language: 'Go' }),
    repo({ id: 5, language: 'Rust' }),
  ]);
  assert.deepEqual(langs, ['Go', 'Rust', 'TypeScript']);
});

test('filterGitHubRankedRepos: query hits full name/original/translation; language facet; empty query', () => {
  const items = [
    repo({ id: 1, fullName: 'acme/kit', description: 'A toolkit', language: 'Go' }),
    repo({ id: 2, fullName: 'beta/site', description: '웹 빌더', language: 'TypeScript' }),
  ];
  assert.deepEqual(filterGitHubRankedRepos(items, '', 'all'), items);
  assert.deepEqual(filterGitHubRankedRepos(items, 'acme', 'all').map((i) => i.id), [1]);
  assert.deepEqual(filterGitHubRankedRepos(items, 'toolkit', 'all').map((i) => i.id), [1]);
  assert.deepEqual(filterGitHubRankedRepos(items, '웹 빌', 'all', { 2: 'web builder' }).map((i) => i.id), [2]);
  assert.deepEqual(filterGitHubRankedRepos(items, '', 'go').map((i) => i.id), [1]);
  assert.deepEqual(filterGitHubRankedRepos(items, '', 'All'), items);
});

test('findCatalogProjectByRepo: case-insensitive slug match, trims, returns undefined when absent', () => {
  const projects = [project({ id: 'p1', githubRepo: 'Owner/Repo' }), project({ id: 'p2', githubRepo: 'other/thing' })];
  assert.equal(findCatalogProjectByRepo(projects, 'owner/repo')?.id, 'p1');
  assert.equal(findCatalogProjectByRepo(projects, '  OWNER/REPO ')?.id, 'p1');
  assert.equal(findCatalogProjectByRepo(projects, 'nope/nope'), undefined);
});

test('findCatalogProjectByRepo: blank name never matches', () => {
  assert.equal(findCatalogProjectByRepo([project({})], ''), undefined);
  assert.equal(findCatalogProjectByRepo([project({})], '   '), undefined);
});

test('parseTopStarredPayload: ok payload maps items and flags', () => {
  const result = parseTopStarredPayload(
    { items: [repo({ id: 1 }), repo({ id: 2 })], fetchedAt: '2026-01-01T00:00:00.000Z', staleCache: true },
    { ok: true, status: 200 },
    'json'
  );
  assert.equal(result.kind, 'items');
  if (result.kind === 'items') {
    assert.equal(result.items.length, 2);
    assert.equal(result.items[0].id, 1);
    assert.equal(result.fetchedAt, '2026-01-01T00:00:00.000Z');
    assert.equal(result.staleCache, true);
  }
});

test('parseTopStarredPayload: ok payload without optional flags yields empty defaults', () => {
  const result = parseTopStarredPayload({ items: [repo({ id: 1 })] }, { ok: true, status: 200 }, 'json');
  assert.equal(result.kind, 'items');
  if (result.kind === 'items') {
    assert.equal(result.fetchedAt, '');
    assert.equal(result.staleCache, false);
  }
});

test('parseTopStarredPayload: ok but unreadable/non-object payload → failure wording', () => {
  const empty = parseTopStarredPayload(null, { ok: true, status: 200 }, 'empty');
  assert.equal(empty.kind, 'failure');
  if (empty.kind === 'failure') {
    assert.equal(empty.message, 'Ranking response was not usable (HTTP 200) — the body was empty.');
  }

  const invalid = parseTopStarredPayload(null, { ok: true, status: 200 }, 'invalid');
  assert.equal(invalid.kind, 'failure');
  if (invalid.kind === 'failure') {
    assert.equal(invalid.message, 'Ranking response was not usable (HTTP 200) — the body was not JSON.');
  }

  const array = parseTopStarredPayload([], { ok: true, status: 200 }, 'json');
  assert.equal(array.kind, 'failure');
  if (array.kind === 'failure') {
    assert.equal(array.message, 'Ranking response was not usable (HTTP 200).');
  }
});

test('parseTopStarredPayload: ok object without an items array → failure', () => {
  const result = parseTopStarredPayload({ fetchedAt: 'x' }, { ok: true, status: 200 }, 'json');
  assert.equal(result.kind, 'failure');
  if (result.kind === 'failure') {
    assert.equal(result.message, 'Ranking response did not contain an items list (HTTP 200).');
  }
});

test('parseTopStarredPayload: HTTP failure prefers the server error field and resetAtIso', () => {
  const result = parseTopStarredPayload(
    { error: 'GitHub API rate limit reached.', resetAtIso: '2026-01-01T00:00:00.000Z' },
    { ok: false, status: 429 },
    'json'
  );
  assert.equal(result.kind, 'failure');
  if (result.kind === 'failure') {
    assert.equal(result.message, 'GitHub API rate limit reached.');
    assert.equal(result.resetAtIso, '2026-01-01T00:00:00.000Z');
  }
});

test('parseTopStarredPayload: HTTP failure words empty/invalid bodies from status', () => {
  const empty = parseTopStarredPayload(null, { ok: false, status: 502 }, 'empty');
  assert.equal(empty.kind, 'failure');
  if (empty.kind === 'failure') {
    assert.equal(empty.message, 'Ranking request failed (HTTP 502) with an empty response body.');
    assert.equal(empty.resetAtIso, null);
  }

  const invalid = parseTopStarredPayload(null, { ok: false, status: 500 }, 'invalid');
  assert.equal(invalid.kind, 'failure');
  if (invalid.kind === 'failure') {
    assert.equal(invalid.message, 'Ranking request failed (HTTP 500) with an unreadable (non-JSON) response body.');
  }

  const plain = parseTopStarredPayload(null, { ok: false, status: 503 }, 'json');
  assert.equal(plain.kind, 'failure');
  if (plain.kind === 'failure') {
    assert.equal(plain.message, 'Ranking request failed (HTTP 503).');
  }
});

test('parseTopStarredPayload: non-string error field never leaks into the message', () => {
  const result = parseTopStarredPayload({ error: 42 }, { ok: false, status: 500 }, 'json');
  assert.equal(result.kind, 'failure');
  if (result.kind === 'failure') {
    assert.equal(result.message, 'Ranking request failed (HTTP 500).');
  }
});
