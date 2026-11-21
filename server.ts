import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseGitHubRepoSlug } from './src/lib/validation.ts';
import type { GitHubRepoMetadata } from './src/types/vibeatlas.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const CACHE_TTL_MS = 15 * 60 * 1000;

interface CacheEntry {
  expiresAt: number;
  data: GitHubRepoMetadata;
}

const githubCache = new Map<string, CacheEntry>();

async function fetchGitHubRepoFromApi(slug: string): Promise<{
  ok: true;
  data: GitHubRepoMetadata;
} | {
  ok: false;
  status: number;
  error: string;
}> {
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(slug)) {
    return { ok: false, status: 400, error: 'Invalid GitHub repository format (expected owner/repo).' };
  }

  const cached = githubCache.get(slug.toLowerCase());
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
    const timeout = setTimeout(() => controller.abort(), 8000);
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

    githubCache.set(slug.toLowerCase(), {
      expiresAt: Date.now() + CACHE_TTL_MS,
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

async function createApp() {
  const app = express();
  app.use(express.json({ limit: '512kb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      ok: true,
      app: 'VibeAtlas',
      hasGithubToken: Boolean(process.env.GITHUB_TOKEN?.trim()),
    });
  });

  app.get('/api/github/repo', async (req: Request, res: Response) => {
    const rawRepo = typeof req.query.repo === 'string' ? req.query.repo : '';
    const slug = parseGitHubRepoSlug(rawRepo);
    if (!slug) {
      res.status(400).json({ error: 'Provide a valid GitHub repository (owner/repo or https://github.com/owner/repo).' });
      return;
    }

    const result = await fetchGitHubRepoFromApi(slug);
    if (!result.ok) {
      res.status(result.status).json({ error: result.error });
      return;
    }
    res.json({ repo: result.data });
  });

  app.post('/api/github/sync-batch', async (req: Request, res: Response) => {
    const rawRepos: unknown[] = Array.isArray(req.body?.repos) ? (req.body.repos as unknown[]) : [];
    const slugs: string[] = rawRepos
      .slice(0, 12)
      .map((item: unknown) => (typeof item === 'string' ? parseGitHubRepoSlug(item) : null))
      .filter((item): item is string => Boolean(item));

    if (slugs.length === 0) {
      res.status(400).json({ error: 'Provide at least one valid owner/repo slug.' });
      return;
    }

    const results: Record<string, GitHubRepoMetadata> = {};
    const errors: Record<string, string> = {};

    await Promise.all(
      slugs.map(async (slug: string) => {
        const result = await fetchGitHubRepoFromApi(slug);
        if (result.ok) {
          results[slug] = result.data;
        } else {
          errors[slug] = result.error;
        }
      })
    );

    res.json({ results, errors });
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      const indexFile = path.join(distDir, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Build output not found.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`VibeAtlas listening on http://localhost:${PORT}`);
  });
}

createApp().catch((err) => {
  console.error('Failed to start VibeAtlas server:', err);
  process.exit(1);
});
