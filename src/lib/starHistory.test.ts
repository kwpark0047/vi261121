import test from 'node:test';
import assert from 'node:assert/strict';
import type { CatalogProject } from '../types/vibeatlas.ts';
import {
  buildHistoricalGrowthSeries,
  loadStarSnapshots,
  recordStarSnapshot,
} from './starHistory.ts';

function makeMemoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear() {
      map.clear();
    },
    getItem(key: string) {
      return map.has(key) ? (map.get(key) ?? null) : null;
    },
    key(index: number) {
      return Array.from(map.keys())[index] ?? null;
    },
    removeItem(key: string) {
      map.delete(key);
    },
    setItem(key: string, value: string) {
      map.set(key, value);
    },
  };
}

function makeProject(overrides: Partial<CatalogProject> = {}): CatalogProject {
  return {
    id: 'proj-1',
    slug: 'proj-1',
    name: 'Test Project',
    tagline: 'Test project tagline',
    taglineKo: '테스트 소개',
    description: 'Detailed project description for Recharts historical growth tests.',
    descriptionKo: '',
    contentType: 'mcp_server',
    categories: ['MCP'],
    techStack: ['TypeScript'],
    developmentPlatform: 'claude_code',
    hostingProvider: 'vercel',
    backendTech: 'nodejs',
    country: 'KR',
    language: 'bilingual',
    license: 'MIT',
    pricingModel: 'open_source',
    verificationStatus: 'verified',
    provenanceSource: 'github_sync',
    liveDemoUrl: '',
    websiteUrl: '',
    githubRepo: 'example/repo',
    githubUrl: 'https://github.com/example/repo',
    thumbnailUrl: '',
    makerName: 'Maker',
    makerHandle: '@maker',
    ownerUid: 'u1',
    githubStars: 0,
    githubForks: 0,
    likesCount: 15,
    bookmarksCount: 30,
    lastSyncedAt: '',
    createdAtIso: '2026-11-01T00:00:00.000Z',
    updatedAtIso: '2026-11-20T00:00:00.000Z',
    ...overrides,
  };
}

test('buildHistoricalGrowthSeries reconstructs cumulative GitHub star counts from daily deltas', () => {
  const project = makeProject({
    githubStars: 150,
    historicalSignals: [
      { date: '2026-11-17', githubStarsDelta: 5, internalLikes: 10, internalBookmarks: 20 },
      { date: '2026-11-18', githubStarsDelta: 10, internalLikes: 12, internalBookmarks: 24 },
      { date: '2026-11-19', githubStarsDelta: 20, internalLikes: 14, internalBookmarks: 27 },
      { date: '2026-11-20', githubStarsDelta: 15, internalLikes: 15, internalBookmarks: 30 },
    ],
  });

  const series = buildHistoricalGrowthSeries(project, {});
  assert.equal(series.hasStarHistoryDeltas, true);
  assert.equal(series.isBaselineSnapshot, false);
  assert.equal(series.totalDelta14d, 50);
  assert.deepEqual(
    series.points.map((pt) => pt.githubStars),
    [105, 115, 135, 150]
  );
  assert.equal(series.points[0]?.shortDate, '11-17');
});

test('buildHistoricalGrowthSeries handles unsynced and single-snapshot projects honestly without fake cliffs', () => {
  const unsynced = makeProject({ githubStars: 0, historicalSignals: undefined });
  const unsyncedSeries = buildHistoricalGrowthSeries(unsynced, {});
  assert.equal(unsyncedSeries.points.length, 14);
  assert.equal(unsyncedSeries.hasStarHistoryDeltas, false);
  assert.equal(unsyncedSeries.isBaselineSnapshot, false);
  assert.equal(unsyncedSeries.points[13]?.githubStars, 0);
  assert.equal(unsyncedSeries.points[13]?.internalLikes, 15);

  const syncedSingleSnapshot = makeProject({
    githubStars: 1200,
    lastSyncedAt: '2026-11-21T03:00:00.000Z',
    historicalSignals: undefined,
  });
  const syncedSeries = buildHistoricalGrowthSeries(syncedSingleSnapshot, {
    '2026-11-21': 1200,
  });
  assert.equal(syncedSeries.points.length, 14);
  assert.equal(syncedSeries.hasStarHistoryDeltas, false);
  assert.equal(syncedSeries.isBaselineSnapshot, true);
  assert.equal(syncedSeries.points[0]?.githubStars, 1200);
  assert.equal(syncedSeries.points[13]?.githubStars, 1200);
  assert.equal(syncedSeries.points[13]?.date, '2026-11-21');
});

test('recordStarSnapshot and loadStarSnapshots derive multi-day deltas cleanly', () => {
  const storage = makeMemoryStorage();
  recordStarSnapshot('example/repo', '2026-11-18T10:00:00.000Z', 1000, storage);
  recordStarSnapshot('example/repo', '2026-11-20T10:00:00.000Z', 1045, storage);

  const loaded = loadStarSnapshots('example/repo', storage);
  assert.deepEqual(loaded, {
    '2026-11-18': 1000,
    '2026-11-20': 1045,
  });

  const project = makeProject({
    githubStars: 1045,
    lastSyncedAt: '2026-11-20T10:00:00.000Z',
    historicalSignals: undefined,
  });
  const series = buildHistoricalGrowthSeries(project, loaded);
  assert.equal(series.hasStarHistoryDeltas, true);
  assert.equal(series.isBaselineSnapshot, false);
  assert.equal(series.totalDelta14d, 45);
  assert.equal(series.points[11]?.githubStars, 1000);
  assert.equal(series.points[13]?.githubStars, 1045);
});
