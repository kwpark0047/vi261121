import 'dotenv/config';
import express from 'express';
import type { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import type { IncomingHttpHeaders } from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseGitHubRepoSlug } from './src/lib/validation.ts';
import { fetchGitHubRepoFromApi } from './src/lib/githubRepo.ts';
import type { GitHubRepoMetadata } from './src/types/vibeatlas.ts';
import topStarredHandler from './api/github/top-starred.ts';
import translateDescriptionsHandler from './api/github/translate-descriptions.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

/**
 * Dev/self-host parity for the GitHub API routes that ship as Vercel
 * functions in `api/github/`. Express cannot host serverless functions, so
 * the dev server delegates those paths to the very same handler modules the
 * functions bundle (pure Web API, no Node built-ins) instead of letting them
 * fall through to the SPA fallback. Secrets resolve from process.env exactly
 * like the functions do — dotenv/config above loads .env.
 */
type EdgeHandler = (req: Request) => Promise<Response>;

function httpHeadersToRecord(headers: IncomingHttpHeaders): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (value === undefined) continue;
    out[key] = Array.isArray(value) ? value.join(', ') : String(value);
  }
  return out;
}

async function collectRequestBody(req: ExpressRequest): Promise<Uint8Array | undefined> {
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') return undefined;
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : (chunk as Buffer));
  }
  if (chunks.length === 0) return undefined;
  return new Uint8Array(Buffer.concat(chunks));
}

function proxyToEdgeHandler(handler: EdgeHandler) {
  return async (req: ExpressRequest, res: ExpressResponse): Promise<void> => {
    try {
      const url = new URL(req.originalUrl ?? req.url ?? '/', 'http://localhost');
      const init: RequestInit = {
        method: req.method ?? 'GET',
        headers: httpHeadersToRecord(req.headers),
      };
      if (req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'OPTIONS') {
        const body = await collectRequestBody(req);
        if (body) init.body = body.buffer as ArrayBuffer;
      }
      const edgeResp = await handler(new Request(url, init));
      res.status(edgeResp.status);
      edgeResp.headers.forEach((value, key) => res.setHeader(key, value));
      res.send(Buffer.from(await edgeResp.arrayBuffer()));
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Edge handler proxy failed.' });
    }
  };
}

const edgeRoutes: Array<{ path: string; handler: EdgeHandler }> = [
  { path: '/api/github/top-starred', handler: topStarredHandler },
  { path: '/api/github/translate-descriptions', handler: translateDescriptionsHandler },
];

async function createApp() {
  const app = express();

  // Registered before express.json so these routes own their requests (and
  // can forward a raw body) rather than being parsed/handled as generic
  // JSON or falling through to the SPA fallback below.
  for (const route of edgeRoutes) {
    app.all(route.path, proxyToEdgeHandler(route.handler));
  }

  app.use(express.json({ limit: '512kb' }));

  app.get('/api/health', (_req: ExpressRequest, res: ExpressResponse) => {
    res.json({
      ok: true,
      app: 'W-Vibe',
      hasGithubToken: Boolean(process.env.GITHUB_TOKEN?.trim()),
    });
  });

  app.get('/api/github/repo', async (req: ExpressRequest, res: ExpressResponse) => {
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

  app.post('/api/github/sync-batch', async (req: ExpressRequest, res: ExpressResponse) => {
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
    app.get('*', (_req: ExpressRequest, res: ExpressResponse) => {
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
