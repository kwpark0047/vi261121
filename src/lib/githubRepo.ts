import type { GitHubRepoMetadata } from '../types/vibeatlas';

/**
 * Shared GitHub repo metadata fetcher.
 *
 * Extracted from `server.ts` so the Express server and the Vercel
 * (`api/`) functions share one implementation. The 15-minute in-memory
 * cache keeps repeated lookups cheap:
 *  - long-lived processes (Express) keep it for CACHE_TTL_MS;
 *  - serverless/edge instances get a per-instance cache that resets on cold
 *    start (functionally equivalent, may re-hit the upstream API more often).
 *
 * No Node built-ins here on purpose — safe for edge/serverless bundling.
 */
export const GITHUB_CACHE_TTL_MS = 15 * 60 * 1000;
export const GITHUB_FETCH_TIMEOUT_MS = 8000;
export const MAX_SYNC_REPOS = 12;

export type GitHubRepoResult =
  | { ok: true; data: GitHubRepoMetadata }
  | { ok: false; status: number; error: string };

const repoCache = new Map<string, { expiresAt: number; data: GitHubRepoMetadata }>();

async function fetchGitHubRepoFromApi(slug: string): Promise<GitHubRepoResult> {
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(slug)) {
    return { ok: false, status: 400, error: 'Invalid GitHub repository format (expected owner/repo).' };
  }

  const cached = repoCache.get(slug.toLowerCase());
  if (cached && cached.expiresAt > Date.now()) {
    return { ok: true, data: cached.data };
  }

  const [owner, repo] = slug.split('/');
  const endpoint = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'VibeAtlas-Directory-Sync',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  const ghToken = process.env.GITHUB_TOKEN?.trim();
  if (ghToken) {
    headers.Authorization = `Bearer ${ghToken}`;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), GITHUB_FETCH_TIMEOUT_MS);
    const resp = await fetch(endpoint, { headers, signal: controller.signal });
    clearTimeout(timeout);

    if (resp.status === 404) {
      return { ok: false, status: 404, error: `GitHub repository "${slug}" was not found.` };
    }
    if (resp.status === 403 || resp.status === 429) {
      return {
        ok: false,
        status: 429,
        error: 'GitHub API rate limit reached. Try again later or configure GITHUB_TOKEN on the server.',
      };
    }
    if (!resp.ok) {
      return { ok: false, status: resp.status, error: `GitHub API returned status ${resp.status}.` };
    }

    const raw = (await resp.json()) as Record<string, unknown>;
    const licenseObj = raw.license as Record<string, unknown> | null | undefined;
    const ownerObj = raw.owner as Record<string, unknown> | null | undefined;

    const metadata: GitHubRepoMetadata = {
      fullName: String(raw.full_name || slug),
      name: String(raw.name || repo),
      description: String(raw.description || ''),
      homepage: typeof raw.homepage === 'string' ? raw.homepage : '',
      htmlUrl: String(raw.html_url || `https://github.com/${slug}`),
      stars: Number(raw.stargazers_count || 0),
      forks: Number(raw.forks_count || 0),
      license:
        licenseObj && typeof licenseObj.spdx_id === 'string' && licenseObj.spdx_id !== 'NOASSERTION'
          ? licenseObj.spdx_id
          : 'Unknown',
      language: typeof raw.language === 'string' ? raw.language : '',
      topics: Array.isArray(raw.topics) ? raw.topics.slice(0, 8).map(String) : [],
      ownerLogin: ownerObj && typeof ownerObj.login === 'string' ? ownerObj.login : owner,
      pushedAt: typeof raw.pushed_at === 'string' ? raw.pushed_at : new Date().toISOString(),
      fetchedAt: new Date().toISOString(),
    };

    repoCache.set(slug.toLowerCase(), {
      expiresAt: Date.now() + GITHUB_CACHE_TTL_MS,
      data: metadata,
    });

    return { ok: true, data: metadata };
  } catch (err) {
    return {
      ok: false,
      status: 502,
      error: err instanceof Error ? err.message : 'Failed to reach GitHub API.',
    };
  }
}

export { fetchGitHubRepoFromApi };
