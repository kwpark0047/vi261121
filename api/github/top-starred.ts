import {
  GITHUB_CACHE_TTL_MS,
  GITHUB_FETCH_TIMEOUT_MS,
} from '../../src/lib/githubRepo.ts';
import { readJsonBody } from '../../src/lib/responseJson.ts';
import type { GitHubRankedRepo, GitHubTopRepoPreset } from '../../src/types/vibeatlas';

export interface GitHubTopStarredResponse {
  preset: GitHubTopRepoPreset;
  fetchedAt: string;
  staleCache?: boolean;
  items: GitHubRankedRepo[];
  error?: string;
  errorCode?: string;
  resetAtIso?: string | null;
}

interface LeaderboardCacheEntry {
  storedAt: number;
  items: GitHubRankedRepo[];
}

const leaderboardCache = new Map<GitHubTopRepoPreset, LeaderboardCacheEntry>();

/**
 * GitHub has no canonical search qualifier for every cohort below. `all` maps to
 * `stars:>0` (the star-sorted top of the index); the four language presets map to
 * real search API params; `web_apps` and `ai_agents` are best-effort text
 * heuristics over the search index and will be refined as we can validate them
 * against the live API.
 */
const PRESET_QUERY: Record<GitHubTopRepoPreset, string> = {
  all: 'stars:>0',
  web_apps: '"web app" OR webapp',
  ai_agents: '"ai agent" OR "coding agent"',
  typescript: 'language:typescript',
  python: 'language:python',
  rust: 'language:rust',
  go: 'language:go',
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null;
}

function parseResetAtIso(resp: Response): string | null {
  const raw = resp.headers.get('x-ratelimit-reset');
  if (!raw) return null;
  const epochSeconds = Number(raw);
  if (!Number.isFinite(epochSeconds) || epochSeconds <= 0) return null;
  return new Date(epochSeconds * 1000).toISOString();
}

function mapRepo(raw: Record<string, unknown>, rank: number): GitHubRankedRepo {
  const owner = asRecord(raw.owner);
  const license = asRecord(raw.license);
  return {
    id: Number(raw.id) || 0,
    rank,
    fullName: typeof raw.full_name === 'string' ? raw.full_name : '',
    ownerLogin: owner && typeof owner.login === 'string' ? owner.login : '',
    ownerAvatarUrl: owner && typeof owner.avatar_url === 'string' ? owner.avatar_url : '',
    description: typeof raw.description === 'string' ? raw.description : '',
    htmlUrl: typeof raw.html_url === 'string' ? raw.html_url : '',
    stars: Number(raw.stargazers_count) || 0,
    forks: Number(raw.forks_count) || 0,
    language: typeof raw.language === 'string' ? raw.language : '',
    license: license && typeof license.spdx_id === 'string' ? license.spdx_id : '',
  };
}

function nowIso(): string {
  return new Date().toISOString();
}

function staleResponse(preset: GitHubTopRepoPreset, entry: LeaderboardCacheEntry): Response {
  // Prefer last-known-good over an error surface, disclosing staleness explicitly.
  return Response.json({
    preset,
    fetchedAt: new Date(entry.storedAt).toISOString(),
    staleCache: true,
    items: entry.items,
  });
}

export default async function handler(req: Request): Promise<Response> {
  try {
    return await handleTopStarred(req);
  } catch (err) {
    // Route contract: every outcome is JSON. An unexpected throw must never
    // fall through to the platform's non-JSON error surface.
    console.error('[top-starred] unhandled error:', err instanceof Error ? err.message : err);
    return Response.json(
      {
        fetchedAt: nowIso(),
        items: [],
        error: 'Internal server error while handling top-starred request.',
        errorCode: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}

async function handleTopStarred(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const presetParam = url.searchParams.get('preset');
  // hasOwnProperty, not `in`: `in` walks the prototype chain, so a param like
  // "toString" would pass the check and misshape the upstream query.
  const preset =
    presetParam && Object.prototype.hasOwnProperty.call(PRESET_QUERY, presetParam)
      ? (presetParam as GitHubTopRepoPreset)
      : null;
  if (!preset) {
    return Response.json(
      { error: `Unknown preset "${presetParam ?? ''}".`, errorCode: 'INVALID_PRESET' },
      { status: 400 }
    );
  }

  const token = process.env.GITHUB_TOKEN?.trim();
  if (!token) {
    return Response.json(
      {
        preset,
        fetchedAt: nowIso(),
        items: [],
        error: 'GITHUB_TOKEN is not configured on the server.',
        errorCode: 'MISSING_API_KEY',
      },
      { status: 401 }
    );
  }

  const cached = leaderboardCache.get(preset);
  const cacheFresh =
    cached && cached.storedAt + GITHUB_CACHE_TTL_MS > Date.now() && url.searchParams.get('refresh') !== '1';
  if (cacheFresh && cached) {
    return Response.json({
      preset,
      fetchedAt: new Date(cached.storedAt).toISOString(),
      staleCache: false,
      items: cached.items,
    });
  }

  const endpoint = new URL('https://api.github.com/search/repositories');
  endpoint.searchParams.set('sort', 'stars');
  endpoint.searchParams.set('order', 'desc');
  endpoint.searchParams.set('per_page', '100');
  const q = PRESET_QUERY[preset];
  if (!q) {
    return Response.json(
      {
        preset,
        fetchedAt: nowIso(),
        items: [],
        error: `"${preset}" is unavailable: GitHub search requires a non-empty "q" parameter.`,
        errorCode: 'INVALID_PRESET_QUERY',
      },
      { status: 400 }
    );
  }
  endpoint.searchParams.set('q', q);

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'W-Vibe-GitHub-Stars',
    'X-GitHub-Api-Version': '2022-11-28',
    Authorization: `Bearer ${token}`,
  };

  let resp: Response;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), GITHUB_FETCH_TIMEOUT_MS);
    try {
      resp = await fetch(endpoint, { headers, signal: controller.signal });
    } finally {
      clearTimeout(timeout);
    }
  } catch (err) {
    if (cached) return staleResponse(preset, cached);
    return Response.json(
      { preset, fetchedAt: nowIso(), items: [], error: err instanceof Error ? err.message : 'Failed to reach GitHub API.' },
      { status: 502 }
    );
  }

  if (resp.status === 401) {
    return Response.json(
      { preset, fetchedAt: nowIso(), items: [], error: 'GitHub rejected the configured GITHUB_TOKEN.', errorCode: 'INVALID_TOKEN' },
      { status: 401 }
    );
  }

  if (resp.status === 403 || resp.status === 429) {
    if (cached) {
      // Rate-limited or blocked: serve last-known-good, disclosing staleness.
      return staleResponse(preset, cached);
    }
    const resetAtIso = parseResetAtIso(resp);
    const limited = resp.status === 429 || resp.headers.get('x-ratelimit-remaining') === '0';
    const message = limited
      ? 'GitHub API rate limit reached. Try again later.'
      : `GitHub API blocked the request (status ${resp.status}).`;
    return Response.json(
      { preset, fetchedAt: nowIso(), items: [], error: message, ...(resetAtIso ? { resetAtIso } : {}) },
      { status: resp.status }
    );
  }

  if (!resp.ok) {
    if (cached) return staleResponse(preset, cached);
    return Response.json(
      { preset, fetchedAt: nowIso(), items: [], error: `GitHub API returned status ${resp.status}.` },
      { status: 502 }
    );
  }

  try {
    const body = await readJsonBody(resp);
    if (!body.ok) {
      // `incomplete_results` can be true for broad queries; serve what we got.
      throw new Error('GitHub API returned an unreadable response body.');
    }
    const data = asRecord(body.value);
    const rawItems = data && Array.isArray(data.items) ? data.items : [];
    const items = rawItems
      .map((value, index) => {
        const raw = asRecord(value);
        return raw ? mapRepo(raw, index + 1) : null;
      })
      .filter((item): item is GitHubRankedRepo => item !== null && item.fullName.length > 0);

    leaderboardCache.set(preset, { storedAt: Date.now(), items });
    return Response.json({ preset, fetchedAt: nowIso(), staleCache: false, items });
  } catch (err) {
    // `incomplete_results` can be true for broad queries; serve what we got.
    if (cached) return staleResponse(preset, cached);
    return Response.json(
      { preset, fetchedAt: nowIso(), items: [], error: err instanceof Error ? err.message : 'Failed to read GitHub response.' },
      { status: 502 }
    );
  }
}
