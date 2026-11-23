/**
 * Non-throwing JSON body reader.
 *
 * Every fetch call site in this codebase has to answer the same question —
 * "what did we actually get back?" — and the failure mode that keeps
 * repeating is a `Response.json()` / `JSON.parse` throw escaping into a
 * generic error path: a proxy's HTML error page, an SPA fallback body, or
 * an empty 2xx body all surface as a `SyntaxError` string instead of an
 * actionable message, and a 2xx body that cannot be parsed is silently
 * treated as "empty result" by some call sites.
 *
 * `readJsonBody` centralizes the contract: it never throws, it never
 * fabricates a value, and it distinguishes *empty* from *malformed* so the
 * caller can word the error truthfully. Callers must still check
 * `resp.ok`/status themselves — this helper reads the body, it does not
 * interpret the outcome.
 */
export type JsonBodyResult =
  | { ok: true; value: unknown }
  | { ok: false; kind: 'empty' | 'invalid'; status: number };

export async function readJsonBody(resp: Response): Promise<JsonBodyResult> {
  let text: string;
  try {
    text = await resp.text();
  } catch {
    return { ok: false, kind: 'invalid', status: resp.status };
  }
  if (!text.trim()) return { ok: false, kind: 'empty', status: resp.status };
  try {
    return { ok: true, value: JSON.parse(text) as unknown };
  } catch {
    return { ok: false, kind: 'invalid', status: resp.status };
  }
}
