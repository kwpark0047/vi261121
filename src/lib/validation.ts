import { z } from 'zod';

export function parseGitHubRepoSlug(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const directMatch = trimmed.match(/^([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+?)(?:\.git)?\/?$/);
  if (directMatch) {
    return `${directMatch[1]}/${directMatch[2]}`;
  }

  try {
    const url = new URL(trimmed);
    if (url.hostname !== 'github.com' && url.hostname !== 'www.github.com') {
      return null;
    }
    const segments = url.pathname.split('/').filter(Boolean);
    if (segments.length < 2) return null;
    const owner = segments[0];
    const repo = segments[1].replace(/\.git$/, '');
    if (!/^[A-Za-z0-9_.-]+$/.test(owner) || !/^[A-Za-z0-9_.-]+$/.test(repo)) {
      return null;
    }
    return `${owner}/${repo}`;
  } catch {
    return null;
  }
}

function hasValidWebHostname(hostname: string): boolean {
  if (!hostname) return false;
  if (hostname === 'localhost') return true;
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) return true;
  const parts = hostname.split('.');
  return (
    parts.length >= 2 &&
    parts.every((part) => part.length > 0) &&
    /[A-Za-z0-9-]{2,}$/.test(parts[parts.length - 1]!)
  );
}

export function isSafeHttpUrl(val: string): boolean {
  const trimmed = val.trim();
  if (!trimmed) return true;
  try {
    const parsed = new URL(trimmed);
    const isHttp = parsed.protocol === 'https:' || parsed.protocol === 'http:';
    return isHttp && hasValidWebHostname(parsed.hostname);
  } catch {
    return false;
  }
}

export function sanitizeExternalUrl(val: string): string | null {
  const trimmed = val.trim();
  if (!trimmed) return null;
  try {
    const parsed = new URL(trimmed);
    if (
      (parsed.protocol === 'https:' || parsed.protocol === 'http:') &&
      hasValidWebHostname(parsed.hostname)
    ) {
      return parsed.toString();
    }
    return null;
  } catch {
    return null;
  }
}

export function generateSlug(name: string): string {
  const ascii = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  if (ascii.length >= 2) {
    return ascii.slice(0, 80);
  }
  return `project-${Date.now().toString(36)}`;
}

export const projectSubmissionSchema = z.object({
  slug: z
    .string()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9-]+$/),
  name: z.string().trim().min(2).max(120),
  tagline: z.string().trim().min(5).max(220),
  taglineKo: z.string().trim().max(220).default(''),
  description: z.string().trim().min(20).max(4000),
  descriptionKo: z.string().trim().max(4000).default(''),
  contentType: z.enum([
    'web_app',
    'ai_tool',
    'mcp_server',
    'ai_skill',
    'ai_agent',
    'template',
    'open_source',
  ]),
  categories: z.array(z.string().trim().min(1).max(40)).min(1).max(6),
  techStack: z.array(z.string().trim().min(1).max(40)).max(12),
  developmentPlatform: z.enum([
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
  hostingProvider: z.enum([
    'vercel',
    'cloudflare',
    'aws',
    'fly_io',
    'gcp',
    'netlify',
    'self_hosted',
    'unknown',
  ]),
  backendTech: z.enum([
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
  country: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{2,12}$/),
  language: z.enum(['ko', 'en', 'bilingual', 'other']),
  license: z.string().trim().min(1).max(64),
  pricingModel: z.enum(['free', 'open_source', 'freemium', 'paid', 'enterprise']),
  liveDemoUrl: z.string().trim().max(500).refine(isSafeHttpUrl, 'Invalid HTTP/HTTPS URL'),
  websiteUrl: z.string().trim().max(500).refine(isSafeHttpUrl, 'Invalid HTTP/HTTPS URL'),
  githubUrl: z.string().trim().max(500).refine(isSafeHttpUrl, 'Invalid HTTP/HTTPS URL'),
  makerName: z.string().trim().min(1).max(100),
  makerHandle: z.string().trim().max(80).default(''),
});

export const reportSubmissionSchema = z.object({
  reason: z.enum([
    'broken_link',
    'stale_metadata',
    'spam',
    'misattribution',
    'security_concern',
  ]),
  details: z.string().trim().min(5).max(1000),
});

export const ownershipClaimSchema = z.object({
  verificationMethod: z.enum(['github_repo', 'domain_dns', 'demo_meta']),
  proofNote: z.string().trim().min(5).max(1000),
});

export type ProjectSubmissionInput = z.input<typeof projectSubmissionSchema>;
export type ProjectSubmissionValidated = z.output<typeof projectSubmissionSchema>;

export type SubmitValidationField =
  | 'name'
  | 'tagline'
  | 'taglineKo'
  | 'description'
  | 'descriptionKo'
  | 'categories'
  | 'techStack'
  | 'country'
  | 'license'
  | 'liveDemoUrl'
  | 'websiteUrl'
  | 'githubUrl'
  | 'makerName'
  | 'makerHandle';

const FIELD_ERROR_COPY: Record<'ko' | 'en', Record<SubmitValidationField, string>> = {
  ko: {
    name: '프로젝트 이름은 2자 이상 120자 이하로 입력하세요.',
    tagline: '영문 한 줄 소개는 5자 이상 220자 이하로 입력하세요.',
    taglineKo: '한국어 한 줄 소개는 220자 이하로 입력하세요.',
    description: '영문 상세 설명은 최소 20자 이상(최대 4,000자) 입력하세요.',
    descriptionKo: '한국어 상세 설명은 4,000자 이하로 입력하세요.',
    categories: '카테고리를 최소 1개 이상(최대 6개, 쉼표 구분) 입력하세요.',
    techStack: '기술 스택은 최대 12개까지 입력할 수 있습니다.',
    country: '국가 코드는 2~12자의 영문 대문자로 입력하세요 (예: KR, US).',
    license: '라이선스를 입력하세요 (예: MIT, Apache-2.0, Unknown).',
    liveDemoUrl: '올바른 http:// 또는 https:// 라이브 데모 URL 형식을 입력하세요.',
    websiteUrl: '올바른 http:// 또는 https:// 공식 웹사이트 URL 형식을 입력하세요.',
    githubUrl: '올바른 http:// 또는 https:// GitHub URL 형식을 입력하세요.',
    makerName: '메이커 또는 팀 이름을 입력하세요.',
    makerHandle: '메이커 핸들은 80자 이하로 입력하세요.',
  },
  en: {
    name: 'Project name must be between 2 and 120 characters.',
    tagline: 'English tagline must be between 5 and 220 characters.',
    taglineKo: 'Korean tagline must be 220 characters or fewer.',
    description: 'English description must be at least 20 characters (max 4,000).',
    descriptionKo: 'Korean description must be 4,000 characters or fewer.',
    categories: 'Enter at least 1 category (comma-separated, max 6).',
    techStack: 'Tech stack can contain at most 12 entries.',
    country: 'Country code must be 2–12 uppercase letters (e.g. KR, US).',
    license: 'License is required (e.g. MIT, Apache-2.0, Unknown).',
    liveDemoUrl: 'Enter a valid http:// or https:// Live Demo URL.',
    websiteUrl: 'Enter a valid http:// or https:// Website URL.',
    githubUrl: 'Enter a valid http:// or https:// GitHub URL.',
    makerName: 'Maker or team name is required.',
    makerHandle: 'Maker handle must be 80 characters or fewer.',
  },
};

export type ProjectSubmissionValidationResult =
  | { success: true; data: ProjectSubmissionValidated }
  | {
      success: false;
      fieldErrors: Partial<Record<SubmitValidationField, string>>;
      summaryMessage: string;
    };

export function validateProjectSubmissionInput(
  input: ProjectSubmissionInput,
  language: 'ko' | 'en'
): ProjectSubmissionValidationResult {
  const parsed = projectSubmissionSchema.safeParse(input);
  if (parsed.success) {
    return { success: true, data: parsed.data };
  }

  const messages = FIELD_ERROR_COPY[language];
  const fieldErrors: Partial<Record<SubmitValidationField, string>> = {};

  for (const issue of parsed.error.issues) {
    const key = issue.path[0];
    if (typeof key === 'string' && key in messages) {
      const typedKey = key as SubmitValidationField;
      if (!fieldErrors[typedKey]) {
        fieldErrors[typedKey] = messages[typedKey];
      }
    }
  }

  const orderedErrors = Object.values(fieldErrors);
  const summaryMessage =
    orderedErrors.length > 0
      ? orderedErrors[0]!
      : `${parsed.error.issues[0]?.path.join('.') || 'form'}: ${parsed.error.issues[0]?.message || 'Validation failed'}`;

  return {
    success: false,
    fieldErrors,
    summaryMessage,
  };
}
