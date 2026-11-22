import type { AppLanguage } from '../../src/types/vibeatlas';

export const TRANSLATION_TIMEOUT_MS = 15_000;
export const DEFAULT_TRANSLATION_MODEL = 'gemini-2.0-flash';

export interface TranslateDescriptionsRequest {
  targetLanguage: AppLanguage;
  items: Array<{ id: number; text: string }>;
}

export interface TranslateDescriptionsResponse {
  translations?: Record<number, string>;
  error?: string;
  errorCode?: string;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null;
}

function isAppLanguage(value: unknown): value is AppLanguage {
  return value === 'ko' || value === 'en';
}

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    const start = trimmed.indexOf('{');
    const end = trimmed.lastIndexOf('}');
    if (start === -1 || end <= start) return null;
    try {
      return JSON.parse(trimmed.slice(start, end + 1)) as unknown;
    } catch {
      return null;
    }
  }
}

function buildPrompt(targetLanguage: AppLanguage, items: TranslateDescriptionsRequest['items']): string {
  const lines = items.map((item) => `${item.id}: ${item.text}`).join('\n');
  return [
    `You translate GitHub repository descriptions for display in a product directory.`,
    `Translate every description into ${targetLanguage}.`,
    'Preserve product names, numbers, URLs, code identifiers, and markdown links unchanged.',
    'Return ONLY a JSON object mapping each numeric id (as a string key) to its translation, e.g. {"1":"번역"}.',
    'No commentary, no markdown fences.',
    '',
    lines,
  ].join('\n');
}

export default async function handler(req: Request): Promise<Response> {
  let body: unknown = null;
  try {
    body = await req.json();
  } catch {
    body = null;
  }

  const parsed = asRecord(body);
  const targetLanguage = parsed ? parsed.targetLanguage : undefined;
  const rawItems = parsed ? parsed.items : undefined;

  if (!isAppLanguage(targetLanguage)) {
    return Response.json(
      { error: 'targetLanguage must be "ko" or "en".', errorCode: 'INVALID_LANGUAGE' },
      { status: 400 }
    );
  }
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    return Response.json(
      { error: 'Provide a non-empty items array.', errorCode: 'INVALID_ITEMS' },
      { status: 400 }
    );
  }
  if (rawItems.length > 15) {
    return Response.json(
      { error: 'Batches support at most 15 items; chunk before sending.', errorCode: 'BATCH_TOO_LARGE' },
      { status: 400 }
    );
  }
  const items: TranslateDescriptionsRequest['items'] = [];
  for (const value of rawItems) {
    const item = asRecord(value);
    if (!item) {
      return Response.json(
        { error: 'Each item must be an object with numeric id and string text.', errorCode: 'INVALID_ITEMS' },
        { status: 400 }
      );
    }
    const id = Number(item.id);
    if (!Number.isFinite(id) || typeof item.text !== 'string' || !item.text.trim()) {
      return Response.json(
        { error: 'Each item needs a non-empty text and a numeric id.', errorCode: 'INVALID_ITEMS' },
        { status: 400 }
      );
    }
    items.push({ id, text: item.text });
  }

  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) {
    return Response.json(
      { error: 'GEMINI_API_KEY is not configured on the server.', errorCode: 'MISSING_API_KEY' },
      { status: 401 }
    );
  }

  const model = process.env.TRANSLATION_MODEL?.trim() || DEFAULT_TRANSLATION_MODEL;
  const endpoint = new URL(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`
  );
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TRANSLATION_TIMEOUT_MS);
  let resp: Response;
  try {
    resp = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': key,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildPrompt(targetLanguage, items) }] }],
      }),
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeout);
    if (err instanceof DOMException && err.name === 'AbortError') {
      return Response.json(
        { error: 'Translation upstream timed out.', errorCode: 'UPSTREAM_TIMEOUT' },
        { status: 504 }
      );
    }
    return Response.json(
      { error: err instanceof Error ? err.message : 'Failed to reach translation upstream.', errorCode: 'UPSTREAM_ERROR' },
      { status: 502 }
    );
  }
  clearTimeout(timeout);

  if (!resp.ok) {
    let detail = '';
    try {
      const errBody = asRecord(await resp.json());
      if (errBody && typeof errBody.error === 'string') detail = `: ${errBody.error}`;
    } catch {
      // non-JSON error body
    }
    return Response.json(
      { error: `Translation upstream returned status ${resp.status}${detail}`, errorCode: 'UPSTREAM_ERROR' },
      { status: 502 }
    );
  }

  let text = '';
  try {
    const data = asRecord(await resp.json());
    const candidates = data && Array.isArray(data.candidates) ? data.candidates : [];
    const first = asRecord(candidates[0]);
    const content = first ? asRecord(first.content) : null;
    const parts = content && Array.isArray(content.parts) ? content.parts : [];
    text = parts
      .map((part) => {
        const p = asRecord(part);
        return p && typeof p.text === 'string' ? p.text : '';
      })
      .join('\n');
  } catch {
    text = '';
  }

  const json = extractJson(text);
  const translations: Record<number, string> = {};
  if (json && typeof json === 'object' && !Array.isArray(json)) {
    for (const [key, value] of Object.entries(json as Record<string, unknown>)) {
      const id = Number(key);
      if (Number.isFinite(id) && typeof value === 'string' && value.trim()) {
        translations[id] = value.trim();
      }
    }
  }
  if (Object.keys(translations).length === 0) {
    return Response.json(
      { error: 'Translation upstream returned no usable translations.', errorCode: 'UPSTREAM_EMPTY' },
      { status: 502 }
    );
  }
  return Response.json({ translations });
}
