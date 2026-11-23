import type { CatalogProject, GitHubRankedRepo } from '../types/vibeatlas';

export interface LeaderboardSummary {
  totalRepos: number;
  topStars: number;
  topRepoName: string;
  medianStars: number;
}

function starsOf(item: GitHubRankedRepo): number {
  return Number.isFinite(item.stars) ? Math.max(0, item.stars) : 0;
}

export function computeLeaderboardSummary(items: readonly GitHubRankedRepo[]): LeaderboardSummary {
  if (items.length === 0) {
    return { totalRepos: 0, topStars: 0, topRepoName: '', medianStars: 0 };
  }

  const sorted = items.map(starsOf).sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const medianStars =
    sorted.length % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;

  // `items` arrives rank-ordered, so the first maximum is the true #1.
  const top = items.reduce((best, item) => (starsOf(item) > starsOf(best) ? item : best));
  return {
    totalRepos: items.length,
    topStars: starsOf(top),
    topRepoName: top.fullName,
    medianStars,
  };
}

export function extractLeaderboardLanguages(items: readonly GitHubRankedRepo[]): string[] {
  const byLower = new Map<string, string>();
  for (const item of items) {
    const language = (item.language ?? '').trim();
    if (!language) continue;
    const key = language.toLowerCase();
    if (!byLower.has(key)) byLower.set(key, language);
  }
  return Array.from(byLower.values()).sort((a, b) => a.localeCompare(b));
}

/**
 * Search/filter for the leaderboard table. Matches the repository full name, the
 * original description, and any available translation (a query can hit terms the
 * original text uses even when a translation is displayed).
 */
export function filterGitHubRankedRepos(
  items: readonly GitHubRankedRepo[],
  query: string,
  languageFilter: string,
  translations: Record<number, string> | undefined = undefined
): GitHubRankedRepo[] {
  const q = (query ?? '').trim().toLowerCase();
  const lang = (languageFilter ?? 'all').trim().toLowerCase();

  return items.filter((item) => {
    if (lang && lang !== 'all' && (item.language ?? '').toLowerCase() !== lang) return false;
    if (!q) return true;
    const translated = translations?.[item.id];
    return [item.fullName, item.description ?? '', translated ?? ''].some((field) =>
      field.toLowerCase().includes(q)
    );
  });
}

/** Matches the catalog `githubRepo` slug (owner/repo, case-insensitive). */
export function findCatalogProjectByRepo(
  projects: readonly CatalogProject[],
  fullName: string
): CatalogProject | undefined {
  const target = (fullName ?? '').trim().toLowerCase();
  if (!target) return undefined;
  return projects.find((project) => (project.githubRepo ?? '').trim().toLowerCase() === target);
}

/**
 * Interprets a parsed `GET /api/github/top-starred` JSON payload. Pure — no
 * fetch, no DOM — so every branch (HTTP failure with a readable error field,
 * empty body, non-JSON body, success without an items list) is unit-testable
 * and the page keeps only state transitions. Message strings mirror the
 * leaderboard copy that previously lived inline in GitHubStarsPage.
 */
export type TopStarredPayloadResult =
  | {
      kind: 'items';
      items: GitHubRankedRepo[];
      staleCache: boolean;
      fetchedAt: string;
    }
  | {
      kind: 'failure';
      message: string;
      resetAtIso: string | null;
    };

export type TopStarredBodyKind = 'json' | 'empty' | 'invalid';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function parseTopStarredPayload(
  payload: unknown,
  response: { ok: boolean; status: number },
  bodyKind: TopStarredBodyKind
): TopStarredPayloadResult {
  const data = isRecord(payload) ? payload : null;

  if (!response.ok) {
    const serverError =
      data && typeof data.error === 'string' && data.error.trim() ? data.error : null;
    const suffix =
      bodyKind === 'empty'
        ? ' with an empty response body'
        : bodyKind === 'invalid'
          ? ' with an unreadable (non-JSON) response body'
          : '';
    return {
      kind: 'failure',
      message: serverError ?? `Ranking request failed (HTTP ${response.status})${suffix}.`,
      resetAtIso: typeof data?.resetAtIso === 'string' ? data.resetAtIso : null,
    };
  }

  if (!data) {
    const suffix =
      bodyKind === 'empty' ? ' — the body was empty' : bodyKind === 'invalid' ? ' — the body was not JSON' : '';
    return {
      kind: 'failure',
      message: `Ranking response was not usable (HTTP ${response.status})${suffix}.`,
      resetAtIso: null,
    };
  }

  if (!Array.isArray(data.items)) {
    return {
      kind: 'failure',
      message: `Ranking response did not contain an items list (HTTP ${response.status}).`,
      resetAtIso: null,
    };
  }

  return {
    kind: 'items',
    items: data.items as GitHubRankedRepo[],
    staleCache: Boolean(data.staleCache),
    fetchedAt: typeof data.fetchedAt === 'string' && data.fetchedAt ? data.fetchedAt : '',
  };
}
