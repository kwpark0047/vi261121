import test from 'node:test';
import assert from 'node:assert/strict';
import type { CatalogProject } from '../types/vibeatlas.ts';
import {
  computeMakerEngagementSummary,
  computeProjectEngagementRows,
} from './makerAnalytics.ts';

function makeProject(overrides: Partial<CatalogProject> & { id: string; name: string }): CatalogProject {
  return {
    slug: overrides.id,
    tagline: 'Test tagline',
    taglineKo: '테스트 소개',
    description: 'Test description for project engagement analytics verification.',
    descriptionKo: '',
    contentType: 'web_app',
    categories: ['AI Tools'],
    techStack: ['TypeScript'],
    developmentPlatform: 'claude_code',
    hostingProvider: 'vercel',
    backendTech: 'firebase',
    country: 'KR',
    language: 'bilingual',
    license: 'MIT',
    pricingModel: 'open_source',
    verificationStatus: 'verified',
    provenanceSource: 'maker_submitted',
    liveDemoUrl: '',
    websiteUrl: '',
    githubRepo: '',
    githubUrl: '',
    thumbnailUrl: '',
    makerName: 'Maker',
    makerHandle: '@maker',
    ownerUid: 'user-1',
    githubStars: 0,
    githubForks: 0,
    likesCount: 0,
    bookmarksCount: 0,
    lastSyncedAt: '',
    createdAtIso: '2026-11-01T00:00:00.000Z',
    updatedAtIso: '2026-11-01T00:00:00.000Z',
    ...overrides,
  };
}

test('computeMakerEngagementSummary returns zeroes when owned project list is empty', () => {
  const summary = computeMakerEngagementSummary([]);
  assert.deepEqual(summary, {
    totalProjects: 0,
    totalLikes: 0,
    totalBookmarks: 0,
    totalEngagement: 0,
    totalGithubStars: 0,
    topProject: null,
  });
});

test('computeMakerEngagementSummary totals likes, bookmarks, engagement, and external stars separately', () => {
  const projects = [
    makeProject({ id: 'p1', name: 'Alpha', likesCount: 12, bookmarksCount: 8, githubStars: 300 }),
    makeProject({ id: 'p2', name: 'Beta', likesCount: 5, bookmarksCount: 25, githubStars: 50 }),
    makeProject({ id: 'p3', name: 'Gamma', likesCount: 0, bookmarksCount: 0, githubStars: 10 }),
  ];

  const summary = computeMakerEngagementSummary(projects);
  assert.equal(summary.totalProjects, 3);
  assert.equal(summary.totalLikes, 17);
  assert.equal(summary.totalBookmarks, 33);
  assert.equal(summary.totalEngagement, 50);
  assert.equal(summary.totalGithubStars, 360);
  assert.equal(summary.topProject?.id, 'p2');
});

test('computeProjectEngagementRows computes ratios and respects sort modes safely', () => {
  const projects = [
    makeProject({
      id: 'p1',
      name: 'Alpha',
      likesCount: 30,
      bookmarksCount: 10,
      githubStars: 120,
      createdAtIso: '2026-10-01T00:00:00.000Z',
    }),
    makeProject({
      id: 'p2',
      name: 'Beta',
      likesCount: 10,
      bookmarksCount: 40,
      githubStars: 90,
      createdAtIso: '2026-11-10T00:00:00.000Z',
    }),
    makeProject({
      id: 'p3',
      name: 'Zero Engagement',
      likesCount: 0,
      bookmarksCount: 0,
      githubStars: 5,
      createdAtIso: '2026-11-15T00:00:00.000Z',
    }),
  ];

  const byEngagement = computeProjectEngagementRows(projects, 'engagement');
  assert.deepEqual(
    byEngagement.map((r) => r.project.id),
    ['p2', 'p1', 'p3']
  );
  assert.equal(byEngagement[0]?.barWidthPercent, 100);
  assert.equal(byEngagement[0]?.likesSegmentPercent, 20);
  assert.equal(byEngagement[0]?.bookmarksSegmentPercent, 80);
  assert.equal(byEngagement[1]?.barWidthPercent, 80);
  assert.equal(byEngagement[2]?.barWidthPercent, 0);

  const byLikes = computeProjectEngagementRows(projects, 'likes');
  assert.deepEqual(
    byLikes.map((r) => r.project.id),
    ['p1', 'p2', 'p3']
  );

  const byRecent = computeProjectEngagementRows(projects, 'recent');
  assert.deepEqual(
    byRecent.map((r) => r.project.id),
    ['p3', 'p2', 'p1']
  );
});
