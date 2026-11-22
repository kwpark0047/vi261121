import { useCallback, useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import { AlertCircle, CheckCircle2, Github, LogIn, RefreshCw, RotateCcw, X } from 'lucide-react';
import type { User } from 'firebase/auth';
import type {
  AppLanguage,
  BackendTech,
  CatalogProject,
  ContentType,
  DevelopmentPlatform,
  GitHubRepoMetadata,
  HostingProvider,
  PlatformCategory,
  PricingModel,
} from '../types/vibeatlas';
import {
  BACKEND_LABELS,
  CONTENT_TYPE_LABELS,
  HOSTING_LABELS,
  PLATFORM_CATEGORIES,
  PLATFORM_CATEGORY_LABELS,
  PLATFORM_LABELS,
  PRICING_LABELS,
  UI_STRINGS,
} from '../data/i18n';
import {
  generateSlug,
  isSafeHttpUrl,
  parseGitHubRepoSlug,
  projectSubmissionSchema,
  validateProjectSubmissionInput,
  type SubmitValidationField,
} from '../lib/validation';
import {
  AUTOSAVE_INTERVAL_MS,
  DEFAULT_SUBMIT_DRAFT_FIELDS,
  SUBMIT_DRAFT_STORAGE_KEY,
  clearSubmitDraft,
  hasMeaningfulDraftChanges,
  loadSubmitDraft,
  saveSubmitDraft,
  type SubmitProjectDraftFields,
} from '../lib/submitDraftStorage';

interface SubmitProjectPageProps {
  language: AppLanguage;
  user: User | null;
  onSignIn: () => void;
  onCreateProject: (
    payload: Omit<
      CatalogProject,
      'id' | 'ownerUid' | 'likesCount' | 'bookmarksCount' | 'createdAtIso' | 'updatedAtIso'
    >
  ) => Promise<void>;
}

const submitProjectFormSchema = projectSubmissionSchema.extend({
  liveDemoUrl: z.string().trim().max(500).refine(isSafeHttpUrl, 'Invalid HTTP/HTTPS web URL'),
  websiteUrl: z.string().trim().max(500).refine(isSafeHttpUrl, 'Invalid HTTP/HTTPS web URL'),
  githubUrl: z.string().trim().max(500).refine(isSafeHttpUrl, 'Invalid HTTP/HTTPS web URL'),
});

const FIELD_ELEMENT_IDS: Record<SubmitValidationField, string> = {
  name: 'sub-name',
  tagline: 'sub-tagline',
  taglineKo: 'sub-tagline-ko',
  description: 'sub-desc',
  descriptionKo: 'sub-desc-ko',
  country: 'sub-country',
  license: 'sub-license',
  categories: 'sub-cats',
  techStack: 'sub-stack',
  liveDemoUrl: 'sub-demo',
  websiteUrl: 'sub-web',
  githubUrl: 'sub-gh',
  makerName: 'sub-maker',
  makerHandle: 'sub-handle',
};

const FIELD_KEY_TO_ERROR_KEY: Partial<Record<keyof SubmitProjectDraftFields, SubmitValidationField>> =
  {
    name: 'name',
    tagline: 'tagline',
    taglineKo: 'taglineKo',
    description: 'description',
    descriptionKo: 'descriptionKo',
    categoriesRaw: 'categories',
    techStackRaw: 'techStack',
    country: 'country',
    license: 'license',
    liveDemoUrl: 'liveDemoUrl',
    websiteUrl: 'websiteUrl',
    githubUrl: 'githubUrl',
    makerName: 'makerName',
    makerHandle: 'makerHandle',
  };

export function SubmitProjectPage({
  language,
  user,
  onSignIn,
  onCreateProject,
}: SubmitProjectPageProps) {
  const copy = UI_STRINGS[language].submit;

  const [formState, setFormState] = useState<SubmitProjectDraftFields>(() => ({
    ...DEFAULT_SUBMIT_DRAFT_FIELDS,
    makerName: user?.displayName || DEFAULT_SUBMIT_DRAFT_FIELDS.makerName,
  }));
  const [fetchingGh, setFetchingGh] = useState(false);
  const [ghFeedback, setGhFeedback] = useState<string | null>(null);
  const [ghMeta, setGhMeta] = useState<GitHubRepoMetadata | null>(null);

  const [draftRestored, setDraftRestored] = useState<boolean>(false);
  const [draftNoticeDismissed, setDraftNoticeDismissed] = useState<boolean>(false);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<SubmitValidationField, string>>>(
    {}
  );
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const latestFormStateRef = useRef<SubmitProjectDraftFields>(formState);
  latestFormStateRef.current = formState;

  const userDisplayNameRef = useRef<string>(user?.displayName || '');
  userDisplayNameRef.current = user?.displayName || '';

  // Suppresses the unmount flush once a submission has cleared the draft on purpose.
  const submittedRef = useRef<boolean>(false);
  const appliedDisplayNameRef = useRef<string>('');

  const updateField = useCallback(
    <K extends keyof SubmitProjectDraftFields>(key: K, value: SubmitProjectDraftFields[K]) => {
      submittedRef.current = false;
      setFormState((prev) => ({ ...prev, [key]: value }));
      const errorKey = FIELD_KEY_TO_ERROR_KEY[key];
      if (errorKey) {
        setFieldErrors((prev) => {
          if (!prev[errorKey]) return prev;
          const next = { ...prev };
          delete next[errorKey];
          return next;
        });
      }
      setSubmitError(null);
    },
    []
  );

  // Check localStorage for existing 'vibeatlas_submit_draft' on initial mount and restore via setter
  useEffect(() => {
    const rawDraft =
      typeof window !== 'undefined' ? window.localStorage.getItem(SUBMIT_DRAFT_STORAGE_KEY) : null;
    if (!rawDraft) return;

    const restored = loadSubmitDraft();
    if (restored) {
      setFormState({
        ...restored,
        makerName: restored.makerName || userDisplayNameRef.current,
      });
      setDraftRestored(true);
      setDraftNoticeDismissed(false);
    }
  }, []);

  // Fill the maker name once Firebase restores the signed-in user (auth resolves after mount).
  useEffect(() => {
    const displayName = user?.displayName?.trim() || '';
    if (!displayName || appliedDisplayNameRef.current === displayName) return;

    appliedDisplayNameRef.current = displayName;
    setFormState((prev) => (prev.makerName.trim() ? prev : { ...prev, makerName: displayName }));
  }, [user]);

  const persistDraftSnapshot = useCallback(() => {
    if (submittedRef.current) return;
    const snapshot = latestFormStateRef.current;
    if (hasMeaningfulDraftChanges(snapshot, userDisplayNameRef.current)) {
      saveSubmitDraft(snapshot);
    }
  }, []);

  // Autosave every 30 seconds, and flush on tab close or route change so the last
  // few seconds of edits are not lost between interval ticks.
  useEffect(() => {
    const intervalId = window.setInterval(persistDraftSnapshot, AUTOSAVE_INTERVAL_MS);
    const handlePageHide = () => persistDraftSnapshot();

    window.addEventListener('pagehide', handlePageHide);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('pagehide', handlePageHide);
      persistDraftSnapshot();
    };
  }, [persistDraftSnapshot]);

  const clearDraftAfterSubmission = useCallback(() => {
    submittedRef.current = true;
    clearSubmitDraft();
    setDraftRestored(false);
  }, []);

  const handleClearDraft = () => {
    clearSubmitDraft();
    submittedRef.current = false;
    setDraftRestored(false);
    setDraftNoticeDismissed(false);
    setFormState({
      ...DEFAULT_SUBMIT_DRAFT_FIELDS,
      makerName: user?.displayName || DEFAULT_SUBMIT_DRAFT_FIELDS.makerName,
    });
    setFieldErrors({});
    setSubmitError(null);
    setGhMeta(null);
    setGhFeedback(null);
  };

  const handleFetchGitHub = async () => {
    setGhFeedback(null);
    const slug = parseGitHubRepoSlug(formState.githubInput);
    if (!slug) {
      setGhFeedback(copy.githubInvalidRepo);
      return;
    }

    setFetchingGh(true);
    try {
      const resp = await fetch(`/api/github/repo?repo=${encodeURIComponent(slug)}`);
      const data = await resp.json();
      if (!resp.ok || !data.repo) {
        setGhFeedback(
          resp.status === 404
            ? copy.githubNotFound
            : resp.status === 429
              ? copy.githubRateLimited
              : copy.githubFetchFailed
        );
        return;
      }
      const repo = data.repo as GitHubRepoMetadata;
      setGhMeta(repo);
      setFormState((prev) => ({
        ...prev,
        githubInput: repo.fullName,
        name: prev.name.trim() ? prev.name : repo.name,
        tagline:
          !prev.tagline.trim() && repo.description
            ? repo.description.slice(0, 220)
            : prev.tagline,
        description:
          !prev.description.trim() && repo.description
            ? repo.description.length >= 20
              ? repo.description
              : `${repo.description} — Verified repository hosted on GitHub (${repo.fullName}).`
            : prev.description,
        websiteUrl:
          !prev.websiteUrl.trim() && repo.homepage && isSafeHttpUrl(repo.homepage)
            ? repo.homepage
            : prev.websiteUrl,
        githubUrl: repo.htmlUrl,
        license: repo.license || 'Unknown',
        techStackRaw:
          repo.topics.length > 0
            ? repo.topics.slice(0, 8).join(', ')
            : repo.language || prev.techStackRaw,
        makerName: prev.makerName.trim() ? prev.makerName : repo.ownerLogin,
        makerHandle: prev.makerHandle.trim() ? prev.makerHandle : `@${repo.ownerLogin}`,
      }));
      setFieldErrors({});
      const locale = language === 'ko' ? 'ko-KR' : 'en-US';
      setGhFeedback(
        `${copy.githubSyncSuccessPrefix}: ★ ${repo.stars.toLocaleString(locale)} · Forks ${repo.forks.toLocaleString(locale)} · ${repo.license}`
      );
    } catch {
      setGhFeedback(copy.githubFetchFailed);
    } finally {
      setFetchingGh(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);

    const categories = formState.categoriesRaw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const techStack = formState.techStackRaw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const slug = `${generateSlug(formState.name)}-${Date.now().toString(36).slice(-4)}`;

    const candidatePayload = {
      slug,
      name: formState.name,
      tagline: formState.tagline,
      taglineKo: formState.taglineKo,
      description: formState.description,
      descriptionKo: formState.descriptionKo,
      contentType: formState.contentType,
      categories,
      techStack,
      developmentPlatform: formState.platform,
      hostingProvider: formState.hosting,
      backendTech: formState.backend,
      country: formState.country,
      language: formState.projLang,
      license: formState.license,
      pricingModel: formState.pricingModel,
      liveDemoUrl: formState.liveDemoUrl,
      websiteUrl: formState.websiteUrl,
      githubUrl: formState.githubUrl,
      makerName: formState.makerName,
      makerHandle: formState.makerHandle,
    };

    const rawSchemaCheck = submitProjectFormSchema.safeParse(candidatePayload);
    const validation = validateProjectSubmissionInput(candidatePayload, language);

    if (!rawSchemaCheck.success || !validation.success) {
      const errors = validation.success ? {} : validation.fieldErrors;
      const summary = validation.success
        ? rawSchemaCheck.error?.issues[0]?.message || 'Validation failed'
        : validation.summaryMessage;
      setFieldErrors(errors);
      setSubmitError(
        `${copy.validationSummaryPrefix} (${Object.keys(errors).length}): ${summary}`
      );
      const firstInvalidField = (Object.keys(FIELD_ELEMENT_IDS) as SubmitValidationField[]).find(
        (field) => Boolean(!validation.success && validation.fieldErrors[field])
      );
      if (firstInvalidField && typeof document !== 'undefined') {
        const el = document.getElementById(FIELD_ELEMENT_IDS[firstInvalidField]);
        el?.focus({ preventScroll: true });
        el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
      return;
    }

    setFieldErrors({});

    if (!user) {
      setSubmitError(copy.signInPrompt);
      onSignIn();
      return;
    }

    const validData = validation.data;
    const ghSlug = parseGitHubRepoSlug(validData.githubUrl) || '';

    setSubmitting(true);
    try {
      await onCreateProject({
        slug: validData.slug,
        name: validData.name,
        tagline: validData.tagline,
        taglineKo: validData.taglineKo,
        description: validData.description,
        descriptionKo: validData.descriptionKo,
        contentType: validData.contentType,
        categories: validData.categories,
        techStack: validData.techStack,
        developmentPlatform: validData.developmentPlatform,
        hostingProvider: validData.hostingProvider,
        backendTech: validData.backendTech,
        country: validData.country,
        language: validData.language,
        license: validData.license,
        pricingModel: validData.pricingModel,
        verificationStatus: 'unverified',
        provenanceSource: ghMeta ? 'github_sync' : 'maker_submitted',
        liveDemoUrl: validData.liveDemoUrl,
        websiteUrl: validData.websiteUrl,
        githubRepo: ghSlug,
        githubUrl: validData.githubUrl,
        thumbnailUrl: '',
        makerName: validData.makerName,
        makerHandle: validData.makerHandle,
        githubStars: ghMeta ? ghMeta.stars : 0,
        githubForks: ghMeta ? ghMeta.forks : 0,
        lastSyncedAt: ghMeta ? ghMeta.fetchedAt : '',
        isCuratedSeed: false,
      });
      clearDraftAfterSubmission();
      setSubmitSuccess(copy.submitSuccess);
    } catch (err) {
      setSubmitError(err instanceof Error && err.message ? err.message : copy.publishFailed);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (field?: SubmitValidationField, extra = 'text-sm') =>
    `mt-1 w-full rounded-lg border bg-white px-3 py-2 dark:bg-slate-950 ${extra} ${
      field && fieldErrors[field]
        ? 'border-rose-500 focus:border-rose-600 focus:outline-none dark:border-rose-500'
        : 'border-slate-300 dark:border-slate-700'
    }`;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="border-b border-slate-200 pb-5 dark:border-slate-800">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">
          {copy.title}
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{copy.subtitle}</p>
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
          {copy.draftAutosaveHint}
        </p>
      </div>

      {draftRestored && !draftNoticeDismissed && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-900 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200">
          <span>{copy.draftRestoredNotice}</span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleClearDraft}
              className="inline-flex items-center gap-1.5 rounded-lg border border-blue-300 bg-white px-3 py-1.5 font-medium text-blue-800 hover:bg-blue-100 dark:border-blue-800 dark:bg-slate-900 dark:text-blue-200 dark:hover:bg-slate-800"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>{copy.clearDraftButton}</span>
            </button>
            <button
              type="button"
              onClick={() => setDraftNoticeDismissed(true)}
              aria-label={copy.dismissDraftNotice}
              className="rounded-lg p-1.5 text-blue-800 hover:bg-blue-100 dark:text-blue-200 dark:hover:bg-slate-800"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* GitHub Live Importer */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <Github className="h-4 w-4 text-slate-800 dark:text-slate-200" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            {copy.githubImportTitle}
          </h2>
        </div>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{copy.githubImportHint}</p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={formState.githubInput}
            onChange={(e) => updateField('githubInput', e.target.value)}
            placeholder={copy.githubImportPlaceholder}
            className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
          <button
            type="button"
            disabled={fetchingGh}
            onClick={handleFetchGitHub}
            className="inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${fetchingGh ? 'animate-spin' : ''}`} />
            <span>{fetchingGh ? copy.fetchingGithub : copy.githubFetchButton}</span>
          </button>
        </div>
        {ghFeedback && (
          <p className="mt-2.5 font-mono text-xs text-blue-700 dark:text-blue-400">{ghFeedback}</p>
        )}
      </div>

      <form
        noValidate
        onSubmit={handleSubmit}
        className="mt-6 space-y-5 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="sub-name" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              {copy.nameLabel}
            </label>
            <input
              id="sub-name"
              required
              aria-required="true"
              aria-invalid={Boolean(fieldErrors.name)}
              aria-describedby={fieldErrors.name ? 'sub-name-error' : undefined}
              value={formState.name}
              onChange={(e) => updateField('name', e.target.value)}
              className={inputClass('name')}
            />
            {fieldErrors.name && (
              <p id="sub-name-error" role="alert" className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                {fieldErrors.name}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="sub-type" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              {copy.contentTypeLabel}
            </label>
            <select
              id="sub-type"
              value={formState.contentType}
              onChange={(e) => updateField('contentType', e.target.value as ContentType)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            >
              {(Object.keys(CONTENT_TYPE_LABELS[language]) as ContentType[]).map((key) => (
                <option key={key} value={key}>
                  {CONTENT_TYPE_LABELS[language][key]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="sub-tagline" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              {copy.taglineEnLabel}
            </label>
            <input
              id="sub-tagline"
              required
              aria-required="true"
              aria-invalid={Boolean(fieldErrors.tagline)}
              aria-describedby={fieldErrors.tagline ? 'sub-tagline-error' : undefined}
              value={formState.tagline}
              onChange={(e) => updateField('tagline', e.target.value)}
              className={inputClass('tagline')}
            />
            {fieldErrors.tagline && (
              <p id="sub-tagline-error" role="alert" className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                {fieldErrors.tagline}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="sub-tagline-ko" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              {copy.taglineKoLabel}
            </label>
            <input
              id="sub-tagline-ko"
              aria-invalid={Boolean(fieldErrors.taglineKo)}
              aria-describedby={fieldErrors.taglineKo ? 'sub-tagline-ko-error' : undefined}
              value={formState.taglineKo}
              onChange={(e) => updateField('taglineKo', e.target.value)}
              className={inputClass('taglineKo')}
            />
            {fieldErrors.taglineKo && (
              <p id="sub-tagline-ko-error" role="alert" className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                {fieldErrors.taglineKo}
              </p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="sub-desc" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
            {copy.descriptionEnLabel}
          </label>
          <textarea
            id="sub-desc"
            rows={3}
            required
            aria-required="true"
            aria-invalid={Boolean(fieldErrors.description)}
            aria-describedby={fieldErrors.description ? 'sub-desc-error' : undefined}
            value={formState.description}
            onChange={(e) => updateField('description', e.target.value)}
            className={inputClass('description')}
          />
          {fieldErrors.description && (
            <p id="sub-desc-error" role="alert" className="mt-1 text-xs text-rose-600 dark:text-rose-400">
              {fieldErrors.description}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="sub-desc-ko" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
            {copy.descriptionKoLabel}
          </label>
          <textarea
            id="sub-desc-ko"
            rows={3}
            aria-invalid={Boolean(fieldErrors.descriptionKo)}
            aria-describedby={fieldErrors.descriptionKo ? 'sub-desc-ko-error' : undefined}
            value={formState.descriptionKo}
            onChange={(e) => updateField('descriptionKo', e.target.value)}
            className={inputClass('descriptionKo')}
          />
          {fieldErrors.descriptionKo && (
            <p id="sub-desc-ko-error" role="alert" className="mt-1 text-xs text-rose-600 dark:text-rose-400">
              {fieldErrors.descriptionKo}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="sub-platform" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              {copy.platformLabel}
            </label>
            <select
              id="sub-platform"
              value={formState.platform}
              onChange={(e) => updateField('platform', e.target.value as DevelopmentPlatform)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950"
            >
              {(Object.keys(PLATFORM_CATEGORIES) as PlatformCategory[]).map((category) => (
                <optgroup key={category} label={PLATFORM_CATEGORY_LABELS[language][category]}>
                  {PLATFORM_CATEGORIES[category].map((k) => (
                    <option key={k} value={k}>
                      {PLATFORM_LABELS[k]}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="sub-hosting" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              {copy.hostingLabel}
            </label>
            <select
              id="sub-hosting"
              value={formState.hosting}
              onChange={(e) => updateField('hosting', e.target.value as HostingProvider)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950"
            >
              {(Object.keys(HOSTING_LABELS) as HostingProvider[]).map((k) => (
                <option key={k} value={k}>
                  {HOSTING_LABELS[k]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="sub-backend" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              {copy.backendLabel}
            </label>
            <select
              id="sub-backend"
              value={formState.backend}
              onChange={(e) => updateField('backend', e.target.value as BackendTech)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950"
            >
              {(Object.keys(BACKEND_LABELS) as BackendTech[]).map((k) => (
                <option key={k} value={k}>
                  {BACKEND_LABELS[k]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div>
            <label
              htmlFor="sub-country"
              className="block text-xs font-medium text-slate-700 sm:flex sm:min-h-[2rem] sm:items-end dark:text-slate-300"
            >
              {copy.countryLabel}
            </label>
            <input
              id="sub-country"
              required
              aria-required="true"
              aria-invalid={Boolean(fieldErrors.country)}
              aria-describedby={fieldErrors.country ? 'sub-country-error' : undefined}
              value={formState.country}
              onChange={(e) => updateField('country', e.target.value.toUpperCase())}
              className={inputClass('country', 'text-xs font-mono')}
            />
            {fieldErrors.country && (
              <p id="sub-country-error" role="alert" className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                {fieldErrors.country}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="sub-lang"
              className="block text-xs font-medium text-slate-700 sm:flex sm:min-h-[2rem] sm:items-end dark:text-slate-300"
            >
              {copy.languageLabel}
            </label>
            <select
              id="sub-lang"
              value={formState.projLang}
              onChange={(e) =>
                updateField('projLang', e.target.value as 'ko' | 'en' | 'bilingual' | 'other')
              }
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950"
            >
              <option value="ko">ko</option>
              <option value="en">en</option>
              <option value="bilingual">bilingual</option>
              <option value="other">other</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="sub-license"
              className="block text-xs font-medium text-slate-700 sm:flex sm:min-h-[2rem] sm:items-end dark:text-slate-300"
            >
              {copy.licenseLabel}
            </label>
            <input
              id="sub-license"
              required
              aria-required="true"
              aria-invalid={Boolean(fieldErrors.license)}
              aria-describedby={fieldErrors.license ? 'sub-license-error' : undefined}
              value={formState.license}
              onChange={(e) => updateField('license', e.target.value)}
              className={inputClass('license', 'text-xs font-mono')}
            />
            {fieldErrors.license && (
              <p id="sub-license-error" role="alert" className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                {fieldErrors.license}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="sub-pricing"
              className="block text-xs font-medium text-slate-700 sm:flex sm:min-h-[2rem] sm:items-end dark:text-slate-300"
            >
              {copy.pricingLabel}
            </label>
            <select
              id="sub-pricing"
              value={formState.pricingModel}
              onChange={(e) => updateField('pricingModel', e.target.value as PricingModel)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950"
            >
              {(Object.keys(PRICING_LABELS[language]) as PricingModel[]).map((k) => (
                <option key={k} value={k}>
                  {PRICING_LABELS[language][k]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="sub-cats" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              {copy.categoriesLabel}
            </label>
            <input
              id="sub-cats"
              required
              aria-required="true"
              aria-invalid={Boolean(fieldErrors.categories)}
              aria-describedby={fieldErrors.categories ? 'sub-cats-error' : undefined}
              value={formState.categoriesRaw}
              onChange={(e) => updateField('categoriesRaw', e.target.value)}
              className={inputClass('categories')}
            />
            {fieldErrors.categories && (
              <p id="sub-cats-error" role="alert" className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                {fieldErrors.categories}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="sub-stack" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              {copy.techStackLabel}
            </label>
            <input
              id="sub-stack"
              aria-invalid={Boolean(fieldErrors.techStack)}
              aria-describedby={fieldErrors.techStack ? 'sub-stack-error' : undefined}
              value={formState.techStackRaw}
              onChange={(e) => updateField('techStackRaw', e.target.value)}
              className={inputClass('techStack')}
            />
            {fieldErrors.techStack && (
              <p id="sub-stack-error" role="alert" className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                {fieldErrors.techStack}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="sub-demo" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              {copy.liveDemoLabel}
            </label>
            <input
              id="sub-demo"
              type="url"
              aria-invalid={Boolean(fieldErrors.liveDemoUrl)}
              aria-describedby={fieldErrors.liveDemoUrl ? 'sub-demo-error' : undefined}
              value={formState.liveDemoUrl}
              onChange={(e) => updateField('liveDemoUrl', e.target.value)}
              className={inputClass('liveDemoUrl', 'text-xs')}
            />
            {fieldErrors.liveDemoUrl && (
              <p id="sub-demo-error" role="alert" className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                {fieldErrors.liveDemoUrl}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="sub-web" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              {copy.websiteLabel}
            </label>
            <input
              id="sub-web"
              type="url"
              aria-invalid={Boolean(fieldErrors.websiteUrl)}
              aria-describedby={fieldErrors.websiteUrl ? 'sub-web-error' : undefined}
              value={formState.websiteUrl}
              onChange={(e) => updateField('websiteUrl', e.target.value)}
              className={inputClass('websiteUrl', 'text-xs')}
            />
            {fieldErrors.websiteUrl && (
              <p id="sub-web-error" role="alert" className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                {fieldErrors.websiteUrl}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="sub-gh" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              {copy.githubUrlLabel}
            </label>
            <input
              id="sub-gh"
              type="url"
              aria-invalid={Boolean(fieldErrors.githubUrl)}
              aria-describedby={fieldErrors.githubUrl ? 'sub-gh-error' : undefined}
              value={formState.githubUrl}
              onChange={(e) => updateField('githubUrl', e.target.value)}
              className={inputClass('githubUrl', 'text-xs')}
            />
            {fieldErrors.githubUrl && (
              <p id="sub-gh-error" role="alert" className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                {fieldErrors.githubUrl}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="sub-maker" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              {copy.makerNameLabel}
            </label>
            <input
              id="sub-maker"
              required
              aria-required="true"
              aria-invalid={Boolean(fieldErrors.makerName)}
              aria-describedby={fieldErrors.makerName ? 'sub-maker-error' : undefined}
              value={formState.makerName}
              onChange={(e) => updateField('makerName', e.target.value)}
              className={inputClass('makerName')}
            />
            {fieldErrors.makerName && (
              <p id="sub-maker-error" role="alert" className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                {fieldErrors.makerName}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="sub-handle" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              {copy.makerHandleLabel}
            </label>
            <input
              id="sub-handle"
              aria-invalid={Boolean(fieldErrors.makerHandle)}
              aria-describedby={fieldErrors.makerHandle ? 'sub-handle-error' : undefined}
              value={formState.makerHandle}
              onChange={(e) => updateField('makerHandle', e.target.value)}
              className={inputClass('makerHandle')}
            />
            {fieldErrors.makerHandle && (
              <p id="sub-handle-error" role="alert" className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                {fieldErrors.makerHandle}
              </p>
            )}
          </div>
        </div>

        {submitError && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-medium text-rose-800 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-300"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        {submitSuccess && (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-medium text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4" />
            <span>{submitSuccess}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
          {!user ? (
            <>
              <p className="text-xs text-slate-600 dark:text-slate-300">{copy.signInPrompt}</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onSignIn}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <LogIn className="h-4 w-4" />
                  <span>{UI_STRINGS[language].workspace.signInGoogle}</span>
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-800 disabled:opacity-60"
                >
                  {copy.submitButton}
                </button>
              </div>
            </>
          ) : (
            <button
              type="submit"
              disabled={submitting}
              className="ml-auto rounded-lg bg-blue-700 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-800 disabled:opacity-60"
            >
              {submitting ? copy.submitting : copy.submitButton}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
