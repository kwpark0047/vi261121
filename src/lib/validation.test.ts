import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isSafeHttpUrl,
  validateProjectSubmissionInput,
  type ProjectSubmissionInput,
} from './validation.ts';
import { PLATFORM_CATEGORIES, PLATFORM_LABELS } from '../data/i18n.ts';
import type { DevelopmentPlatform } from '../types/vibeatlas.ts';

function createValidInput(): ProjectSubmissionInput {
  return {
    slug: 'w-vibe-mcp-ab12',
    name: 'W-Vibe MCP Bridge',
    tagline: 'Verified MCP server bridge for Korean and English tooling.',
    taglineKo: '한영 도구 연동을 위한 검증된 MCP 서버 브리지',
    description:
      'A production-ready MCP bridge exposing safe filesystem and Postgres read queries for coding agents.',
    descriptionKo: '',
    contentType: 'mcp_server',
    categories: ['MCP', 'Developer Tools'],
    techStack: ['TypeScript', 'Node.js'],
    developmentPlatform: 'claude_code',
    hostingProvider: 'vercel',
    backendTech: 'postgresql',
    country: 'KR',
    language: 'bilingual',
    license: 'MIT',
    pricingModel: 'open_source',
    liveDemoUrl: 'https://demo.example.com',
    websiteUrl: 'https://example.com',
    githubUrl: 'https://github.com/example/w-vibe-mcp',
    makerName: 'Seoul Builder',
    makerHandle: '@seoulbuilder',
  };
}

test('isSafeHttpUrl permits empty or http/https URLs and rejects malformed or unsafe schemes', () => {
  assert.equal(isSafeHttpUrl(''), true);
  assert.equal(isSafeHttpUrl('https://w-vibe.dev/demo'), true);
  assert.equal(isSafeHttpUrl('http://localhost:3000'), true);
  assert.equal(isSafeHttpUrl('not-a-valid-url'), false);
  assert.equal(isSafeHttpUrl('https://missing-tld'), false);
  assert.equal(isSafeHttpUrl('javascript:alert(1)'), false);
  assert.equal(isSafeHttpUrl('ftp://files.example.com'), false);
});

test('validateProjectSubmissionInput passes for valid submission input', () => {
  const result = validateProjectSubmissionInput(createValidInput(), 'en');
  assert.equal(result.success, true);
});

test('validateProjectSubmissionInput accepts OpenCode and Google AI Studio platforms', () => {
  for (const developmentPlatform of ['opencode', 'google_ai_studio'] as const) {
    const result = validateProjectSubmissionInput(
      { ...createValidInput(), developmentPlatform },
      'en',
    );
    assert.equal(result.success, true, `${developmentPlatform} should be a valid platform`);
  }
});

test('platform taxonomy assigns every labelled platform to exactly one internal category', () => {
  const categorized = Object.values(PLATFORM_CATEGORIES).flat();
  assert.deepEqual(
    [...categorized].sort(),
    (Object.keys(PLATFORM_LABELS) as DevelopmentPlatform[]).sort(),
  );
  assert.equal(new Set(categorized).size, categorized.length, 'a platform must not appear twice');
});

test('validateProjectSubmissionInput flags missing required fields and malformed URLs', () => {
  const invalid: ProjectSubmissionInput = {
    ...createValidInput(),
    name: '',
    tagline: 'Hi',
    description: 'Too short',
    categories: [],
    country: '1',
    license: '',
    liveDemoUrl: 'not-a-url',
    websiteUrl: 'javascript:alert(1)',
    githubUrl: 'github.com/missing-scheme',
    makerName: '',
  };

  const result = validateProjectSubmissionInput(invalid, 'en');
  assert.equal(result.success, false);
  if (!result.success) {
    assert.ok(result.fieldErrors.name);
    assert.ok(result.fieldErrors.tagline);
    assert.ok(result.fieldErrors.description);
    assert.ok(result.fieldErrors.categories);
    assert.ok(result.fieldErrors.country);
    assert.ok(result.fieldErrors.license);
    assert.ok(result.fieldErrors.liveDemoUrl);
    assert.ok(result.fieldErrors.websiteUrl);
    assert.ok(result.fieldErrors.githubUrl);
    assert.ok(result.fieldErrors.makerName);
    assert.ok(result.summaryMessage.length > 0);
  }
});

test('validateProjectSubmissionInput enforces max categories and techStack limits with Korean copy', () => {
  const result = validateProjectSubmissionInput(
    {
      ...createValidInput(),
      categories: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
      techStack: Array.from({ length: 13 }, (_, i) => `Tech${i + 1}`),
    },
    'ko'
  );
  assert.equal(result.success, false);
  if (!result.success) {
    assert.match(result.fieldErrors.categories || '', /최대 6개/);
    assert.match(result.fieldErrors.techStack || '', /최대 12개/);
  }
});

