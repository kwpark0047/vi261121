import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_SEARCH_FILTERS, parseUrlState, serializeUrlState } from './urlSync';

test('parseUrlState returns defaults on empty query string', () => {
  const parsed = parseUrlState('');
  assert.equal(parsed.tab, 'home');
  assert.equal(parsed.projectSlug, null);
  assert.deepEqual(parsed.filters, DEFAULT_SEARCH_FILTERS);
});

test('serializeUrlState and parseUrlState round-trip complex discovery filters', () => {
  const input = {
    tab: 'discover' as const,
    projectSlug: 'mcp-reference-servers',
    filters: {
      ...DEFAULT_SEARCH_FILTERS,
      q: '한국어 MCP',
      type: 'mcp_server' as const,
      platform: 'claude_code' as const,
      backend: 'postgresql' as const,
      country: 'KR',
      verified: 'verified' as const,
      minStars: 500,
      sort: 'most_starred' as const,
      view: 'list' as const,
      page: 2,
    },
  };

  const qs = serializeUrlState(input);
  const roundTrip = parseUrlState(qs);
  assert.deepEqual(roundTrip, input);
});

test('parseUrlState safely ignores invalid enum parameters', () => {
  const parsed = parseUrlState('?tab=discover&type=hacked&sort=bad&minStars=-10&page=0');
  assert.equal(parsed.tab, 'discover');
  assert.equal(parsed.filters.type, 'all');
  assert.equal(parsed.filters.sort, 'relevance');
  assert.equal(parsed.filters.minStars, 0);
  assert.equal(parsed.filters.page, 1);
});
