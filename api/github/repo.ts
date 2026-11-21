import { parseGitHubRepoSlug } from '../../src/lib/validation';
import { fetchGitHubRepoFromApi } from '../../src/lib/githubRepo';

// GET /api/github/repo?repo=owner/repo | https://github.com/owner/repo
export default async function handler(req: Request): Promise<Response> {
  const rawRepo = new URL(req.url).searchParams.get('repo') ?? '';
  const slug = parseGitHubRepoSlug(rawRepo);
  if (!slug) {
    return Response.json(
      { error: 'Provide a valid GitHub repository (owner/repo or https://github.com/owner/repo).' },
      { status: 400 },
    );
  }

  const result = await fetchGitHubRepoFromApi(slug);
  if (!result.ok) {
    return Response.json({ error: result.error }, { status: result.status });
  }
  return Response.json({ repo: result.data });
}
