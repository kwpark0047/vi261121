import assert from 'node:assert/strict';
import test from 'node:test';
import {
  computeLeaderboardSummary,
  extractLeaderboardLanguages,
  filterGitHubRankedRepos,
  findCatalogProjectByRepo,
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
