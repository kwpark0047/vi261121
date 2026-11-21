import { parseGitHubRepoSlug } from '../../src/lib/validation';
import { fetchGitHubRepoFromApi, MAX_SYNC_REPOS } from '../../src/lib/githubRepo';
import type { GitHubRepoMetadata } from '../../src/types/vibeatlas';

// POST /api/github/sync-batch  { "repos": ["owner/repo", ...] }  (max 12)
export default async function handler(req: Request): Promise<Response> {
  let body: unknown = null;
  try {
    body = await req.json();
  } catch {
    body = null;
  }

  const rawRepos: unknown[] = Array.isArray((body as { repos?: unknown } | null)?.repos)
    ? ((body as { repos: unknown[] }).repos)
    : [];

  const slugs: string[] = rawRepos
    .slice(0, MAX_SYNC_REPOS)
    .map((item) => (typeof item === 'string' ? parseGitHubRepoSlug(item) : null))
    .filter((item): item is string => item !== null);

  if (slugs.length === 0) {
    return Response.json({ error: 'Provide at least one valid owner/repo slug.' }, { status: 400 });
  }

  const results: Record<string, GitHubRepoMetadata> = {};
  const errors: Record<string, string> = {};

  await Promise.all(
    slugs.map(async (slug) => {
      const result = await fetchGitHubRepoFromApi(slug);
      if (result.ok) {
        results[slug] = result.data;
      } else {
        errors[slug] = result.error;
      }
    }),
  );

  return Response.json({ results, errors });
}
