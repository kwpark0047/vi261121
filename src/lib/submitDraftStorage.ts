import { z } from 'zod';
import type {
  BackendTech,
  ContentType,
  DevelopmentPlatform,
  HostingProvider,
  PricingModel,
} from '../types/vibeatlas';

export const SUBMIT_DRAFT_STORAGE_KEY = 'vibeatlas_submit_draft';
export const AUTOSAVE_INTERVAL_MS = 30_000;

export interface SubmitProjectDraftFields {
  githubInput: string;
  name: string;
  tagline: string;
  taglineKo: string;
  description: string;
  descriptionKo: string;
  contentType: ContentType;
  categoriesRaw: string;
  techStackRaw: string;
  platform: DevelopmentPlatform;
  hosting: HostingProvider;
  backend: BackendTech;
  country: string;
  projLang: 'ko' | 'en' | 'bilingual' | 'other';
  license: string;
  pricingModel: PricingModel;
  liveDemoUrl: string;
  websiteUrl: string;
  githubUrl: string;
  makerName: string;
  makerHandle: string;
}

export const DEFAULT_SUBMIT_DRAFT_FIELDS: SubmitProjectDraftFields = {
  githubInput: '',
  name: '',
  tagline: '',
  taglineKo: '',
  description: '',
  descriptionKo: '',
  contentType: 'web_app',
  categoriesRaw: 'AI Tools, Productivity',
  techStackRaw: 'TypeScript, React',
  platform: 'lovable',
  hosting: 'vercel',
  backend: 'supabase',
  country: 'KR',
  projLang: 'bilingual',
  license: 'MIT',
  pricingModel: 'open_source',
  liveDemoUrl: '',
  websiteUrl: '',
  githubUrl: '',
  makerName: '',
  makerHandle: '',
};

const draftFieldsSchema = z.object({
  githubInput: z.string().max(400),
  name: z.string().max(120),
  tagline: z.string().max(300),
  taglineKo: z.string().max(300),
  description: z.string().max(6000),
  descriptionKo: z.string().max(6000),
  contentType: z.enum([
    'web_app',
    'ai_tool',
    'mcp_server',
    'ai_skill',
    'ai_agent',
    'template',
    'open_source',
  ]),
  categoriesRaw: z.string().max(400),
  techStackRaw: z.string().max(500),
  platform: z.enum([
    'lovable',
    'cursor',
    'windsurf',
    'bolt',
    'v0',
    'claude_code',
    'replit',
    'opencode',
    'google_ai_studio',
    'custom',
  ]),
  hosting: z.enum([
    'vercel',
    'cloudflare',
    'aws',
    'fly_io',
    'gcp',
    'netlify',
    'self_hosted',
    'unknown',
  ]),
  backend: z.enum([
    'supabase',
    'firebase',
    'postgresql',
    'nodejs',
    'python_fastapi',
    'sqlite',
    'serverless',
    'none',
    'unknown',
  ]),
  country: z.string().max(10),
  projLang: z.enum(['ko', 'en', 'bilingual', 'other']),
  license: z.string().max(80),
  pricingModel: z.enum(['free', 'open_source', 'freemium', 'paid', 'enterprise']),
  liveDemoUrl: z.string().max(500),
  websiteUrl: z.string().max(500),
  githubUrl: z.string().max(500),
  makerName: z.string().max(120),
  makerHandle: z.string().max(120),
});

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

function getDefaultStorage(): StorageLike | null {
  try {
    return typeof window !== 'undefined' && window.localStorage ? window.localStorage : null;
  } catch {
    return null;
  }
}

export function hasMeaningfulDraftChanges(
  fields: SubmitProjectDraftFields,
  userDefaultMakerName = ''
): boolean {
  const keys = Object.keys(DEFAULT_SUBMIT_DRAFT_FIELDS) as (keyof SubmitProjectDraftFields)[];
  for (const key of keys) {
    if (key === 'makerName') {
      const trimmed = fields.makerName.trim();
      if (trimmed !== '' && trimmed !== userDefaultMakerName.trim()) {
        return true;
      }
      continue;
    }
    if (fields[key] !== DEFAULT_SUBMIT_DRAFT_FIELDS[key]) {
      return true;
    }
  }
  return false;
}

export function loadSubmitDraft(
  storage: StorageLike | null = getDefaultStorage()
): SubmitProjectDraftFields | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(SUBMIT_DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const parsedJson: unknown = JSON.parse(raw);
    const parsed = draftFieldsSchema.safeParse(parsedJson);
    if (!parsed.success) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

export function saveSubmitDraft(
  fields: SubmitProjectDraftFields,
  storage: StorageLike | null = getDefaultStorage()
): boolean {
  if (!storage) return false;
  const validated = draftFieldsSchema.safeParse(fields);
  if (!validated.success) return false;
  try {
    storage.setItem(SUBMIT_DRAFT_STORAGE_KEY, JSON.stringify(validated.data));
    return true;
  } catch {
    return false;
  }
}

export function clearSubmitDraft(storage: StorageLike | null = getDefaultStorage()): void {
  if (!storage) return;
  try {
    storage.removeItem(SUBMIT_DRAFT_STORAGE_KEY);
  } catch {
    // ignore storage removal failure
  }
}
