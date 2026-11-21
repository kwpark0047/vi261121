import test from 'node:test';
import assert from 'node:assert/strict';
import {
  AUTOSAVE_INTERVAL_MS,
  DEFAULT_SUBMIT_DRAFT_FIELDS,
  SUBMIT_DRAFT_STORAGE_KEY,
  clearSubmitDraft,
  hasMeaningfulDraftChanges,
  loadSubmitDraft,
  saveSubmitDraft,
  type StorageLike,
  type SubmitProjectDraftFields,
} from './submitDraftStorage.ts';

function createMemoryStorage(): StorageLike {
  const store = new Map<string, string>();
  return {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => {
      store.set(key, value);
    },
    removeItem: (key) => {
      store.delete(key);
    },
  };
}

test('SUBMIT_DRAFT_STORAGE_KEY and AUTOSAVE_INTERVAL_MS match specification', () => {
  assert.equal(SUBMIT_DRAFT_STORAGE_KEY, 'vibeatlas_submit_draft');
  assert.equal(AUTOSAVE_INTERVAL_MS, 30_000);
});

test('saveSubmitDraft and loadSubmitDraft round-trip form state cleanly', () => {
  const storage = createMemoryStorage();
  const modified: SubmitProjectDraftFields = {
    ...DEFAULT_SUBMIT_DRAFT_FIELDS,
    name: 'Seoul MCP Bridge',
    description: 'Detailed architecture notes for Korean MCP server discovery.',
    descriptionKo: '한국어 MCP 서버 검색 및 연동 설계 메모입니다.',
    contentType: 'mcp_server',
    platform: 'claude_code',
    hosting: 'cloudflare',
    backend: 'postgresql',
    country: 'KR',
    projLang: 'ko',
    license: 'Apache-2.0',
    pricingModel: 'freemium',
  };

  const saved = saveSubmitDraft(modified, storage);
  assert.equal(saved, true);

  const raw = storage.getItem('vibeatlas_submit_draft');
  assert.ok(raw);
  assert.equal(JSON.parse(raw).name, 'Seoul MCP Bridge');

  const restored = loadSubmitDraft(storage);
  assert.deepEqual(restored, modified);
});

test('loadSubmitDraft ignores corrupted or invalid payloads safely', () => {
  const storage = createMemoryStorage();
  storage.setItem(SUBMIT_DRAFT_STORAGE_KEY, '{not-valid-json');
  assert.equal(loadSubmitDraft(storage), null);

  storage.setItem(SUBMIT_DRAFT_STORAGE_KEY, JSON.stringify({ name: 123 }));
  assert.equal(loadSubmitDraft(storage), null);
});

test('hasMeaningfulDraftChanges detects edits and clearSubmitDraft removes persisted state', () => {
  const storage = createMemoryStorage();
  assert.equal(hasMeaningfulDraftChanges(DEFAULT_SUBMIT_DRAFT_FIELDS, 'Builder'), false);
  assert.equal(
    hasMeaningfulDraftChanges(
      { ...DEFAULT_SUBMIT_DRAFT_FIELDS, makerName: 'Builder' },
      'Builder'
    ),
    false
  );
  assert.equal(
    hasMeaningfulDraftChanges({ ...DEFAULT_SUBMIT_DRAFT_FIELDS, contentType: 'ai_agent' }),
    true
  );

  saveSubmitDraft({ ...DEFAULT_SUBMIT_DRAFT_FIELDS, name: 'Draft App' }, storage);
  assert.ok(loadSubmitDraft(storage));
  clearSubmitDraft(storage);
  assert.equal(loadSubmitDraft(storage), null);
});
