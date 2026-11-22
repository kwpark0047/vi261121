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
