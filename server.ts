import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseGitHubRepoSlug } from './src/lib/validation.ts';
import { fetchGitHubRepoFromApi } from './src/lib/githubRepo.ts';
import type { GitHubRepoMetadata } from './src/types/vibeatlas.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

async function createApp() {
  const app = express();
  app.use(express.json({ limit: '512kb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      ok: true,
      app: 'W-Vibe',
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
    console.log(`W-Vibe listening on http://localhost:${PORT}`);
  });
}

createApp().catch((err) => {
  console.error('Failed to start W-Vibe server:', err);
  process.exit(1);
});
