import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeFreshnessState,
  computeRelevanceScore,
  detectMissingFields,
  filterProjects,
  paginateProjects,
  sortProjects,
} from './catalogEngine';
import { DEFAULT_SEARCH_FILTERS } from './urlSync';
import type { CatalogProject } from '../types/vibeatlas';

function makeProject(overrides: Partial<CatalogProject> = {}): CatalogProject {
  return {
    id: 'p1',
    slug: 'sample-mcp',
    name: 'Sample MCP Bridge',
    tagline: 'Bridge local tools with Claude Code',
    taglineKo: '로컬 도구를 Claude Code와 연결하는 MCP 브리지',
    description: 'Detailed English description for sample MCP server integration.',
    descriptionKo: '샘플 MCP 서버 연동에 대한 한국어 설명입니다.',
    contentType: 'mcp_server',
    categories: ['Developer Tools', 'MCP'],
    techStack: ['TypeScript', 'MCP SDK'],
    developmentPlatform: 'claude_code',
    hostingProvider: 'vercel',
    backendTech: 'supabase',
    country: 'KR',
    language: 'bilingual',
    license: 'MIT',
    pricingModel: 'open_source',
    verificationStatus: 'verified',
    provenanceSource: 'github_sync',
    liveDemoUrl: 'https://example.com/demo',
    websiteUrl: 'https://example.com',
    githubRepo: 'org/sample-mcp',
    githubUrl: 'https://github.com/org/sample-mcp',
    thumbnailUrl: '',
    makerName: 'Minho Park',
    makerHandle: '@minho',
    ownerUid: 'u1',
    githubStars: 1200,
    githubForks: 140,
    likesCount: 35,
    bookmarksCount: 82,
    lastSyncedAt: '2026-11-18T10:00:00.000Z',
    createdAtIso: '2026-11-01T00:00:00.000Z',
    updatedAtIso: '2026-11-18T10:00:00.000Z',
    ...overrides,
  };
}

test('Korean bilingual alias search matches English stack metadata', () => {
  const proj = makeProject({
    name: 'Vercel AI Bridge',
    tagline: 'Agent router for workflows',
    taglineKo: '',
    descriptionKo: '',
    contentType: 'ai_agent',
    hostingProvider: 'vercel',
  });
  assert.ok(computeRelevanceScore(proj, '버셀 에이전트') > 0);
  assert.equal(computeRelevanceScore(proj, 'nonexistent-xyz-token'), 0);
});

test('filterProjects evaluates faceted filters accurately', () => {
  const p1 = makeProject({ id: '1', country: 'KR', backendTech: 'supabase', githubStars: 100 });
  const p2 = makeProject({ id: '2', country: 'US', backendTech: 'firebase', githubStars: 900 });

  const filtered = filterProjects([p1, p2], {
    ...DEFAULT_SEARCH_FILTERS,
    country: 'KR',
    backend: 'supabase',
  });

  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].id, '1');
});

test('sortProjects strictly separates githubStars, likesCount, and bookmarksCount', () => {
  const highStars = makeProject({ id: 'stars', githubStars: 5000, likesCount: 2, bookmarksCount: 5 });
  const highLikes = makeProject({ id: 'likes', githubStars: 10, likesCount: 400, bookmarksCount: 1 });
  const highMarks = makeProject({ id: 'marks', githubStars: 50, likesCount: 3, bookmarksCount: 900 });

  assert.equal(sortProjects([highLikes, highStars, highMarks], 'most_starred', '')[0].id, 'stars');
  assert.equal(sortProjects([highStars, highMarks, highLikes], 'most_liked', '')[0].id, 'likes');
  assert.equal(sortProjects([highStars, highLikes, highMarks], 'most_bookmarked', '')[0].id, 'marks');
});

test('computeFreshnessState and detectMissingFields flag stale and incomplete records', () => {
  const nowMs = Date.parse('2026-11-20T00:00:00.000Z');
  assert.equal(computeFreshnessState('2026-11-15T00:00:00.000Z', nowMs), 'fresh');
  assert.equal(computeFreshnessState('2026-10-01T00:00:00.000Z', nowMs), 'stale');
  assert.equal(computeFreshnessState('', nowMs), 'unknown');

  const incomplete = makeProject({
    liveDemoUrl: '',
    license: 'Unknown',
    lastSyncedAt: '',
  });
  const missing = detectMissingFields(incomplete);
  assert.deepEqual(missing, ['liveDemoUrl', 'license', 'lastSyncedAt']);
});

test('paginateProjects clamps out-of-range pages cleanly', () => {
  const items = Array.from({ length: 12 }, (_, idx) => makeProject({ id: `p-${idx}` }));
  const page2 = paginateProjects(items, 2, 9);
  assert.equal(page2.totalCount, 12);
  assert.equal(page2.totalPages, 2);
  assert.equal(page2.items.length, 3);
});
