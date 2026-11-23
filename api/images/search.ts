// GET /api/images/search?q=keyword&page=1
// Fetches images from Pixabay public API (server-side, via Vercel Functions).
// Requires PIXABAY_API_KEY environment variable.

import type { Request } from 'express';
import { readJsonBody } from '../../src/lib/responseJson.ts';

const PIXABAY_BASE = 'https://pixabay.com/api';

export default async function handler(req: Request): Promise<Response> {
  const query = (req.query.q ?? '').toString().trim();
  const page = Number(req.query.page ?? 1);
  const perPage = Number(req.query.perPage ?? 9);
  const apiKey = process.env.PIXABAY_API_KEY?.trim();

  if (!query) {
    return new Response(
      JSON.stringify({ error: 'Search query is required.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  if (!apiKey) {
    console.warn('[Pixabay] PIXABAY_API_KEY not set; returning stub results.');
    return new Response(
      JSON.stringify({
        hits: [],
        total: 0,
        totalHits: 0,
        message: 'Pixabay API key not configured.',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  }

  try {
    const endpoint = `${PIXABAY_BASE}/?key=${encodeURIComponent(
      apiKey,
    )}&q=${encodeURIComponent(query)}&per_page=${perPage}&page=${page}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const resp = await fetch(endpoint, { signal: controller.signal });
    clearTimeout(timeout);

    if (!resp.ok) {
      const text = await resp.text();
      console.error('[Pixabay] API error:', resp.status, text);
      return new Response(
        JSON.stringify({ error: `Pixabay API returned ${resp.status}.` }),
        { status: 502, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const body = await readJsonBody(resp);
    if (
      !body.ok ||
      body.value === null ||
      typeof body.value !== 'object' ||
      Array.isArray(body.value) ||
      !Array.isArray((body.value as { hits?: unknown }).hits)
    ) {
      return new Response(
        JSON.stringify({
          error: `Pixabay API returned an unreadable response body (HTTP ${resp.status}).`,
        }),
        { status: 502, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const data = body.value as {
      hits: Array<{
        id: number;
        pageURL: string;
        type: string;
        tags: string;
        previewURL: string;
        webformatURL: string;
        largeImageURL: string;
        views: number;
        downloads: number;
        likes: number;
        comments: number;
        user_id: number;
      }>;
      total: number;
      totalHits: number;
    };

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[Pixabay] fetch error:', err);
    return new Response(
      JSON.stringify({ error: 'Failed to reach Pixabay API.' }),
      { status: 502, headers: { 'Content-Type': 'application/json' } },
    );
  }
}