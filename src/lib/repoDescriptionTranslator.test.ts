import assert from 'node:assert/strict';
import test from 'node:test';
import {
  chunkTranslationItems,
  needsDescriptionTranslation,
  resolveDisplayedRepoDescription,
} from './repoDescriptionTranslator';

test('chunkTranslationItems: empty list yields no batches', () => {
  assert.deepEqual(chunkTranslationItems([]), []);
});

test('chunkTranslationItems: splits in order with default size 15', () => {
  const items = Array.from({ length: 32 }, (_, i) => ({ id: i + 1, text: `t${i}` }));
  const batches = chunkTranslationItems(items);
  assert.equal(batches.length, 3);
  assert.equal(batches[0].length, 15);
  assert.equal(batches[1].length, 15);
  assert.equal(batches[2].length, 2);
  assert.deepEqual(batches.flat().map((i) => i.id), items.map((i) => i.id));
});

test('chunkTranslationItems: custom size, floors fractional sizes, clamps below 1 to default', () => {
  const items = [{ id: 1, text: 'a' }, { id: 2, text: 'b' }, { id: 3, text: 'c' }];
  assert.deepEqual(chunkTranslationItems(items, 2).map((b) => b.length), [2, 1]);
  assert.deepEqual(chunkTranslationItems(items, 2.9).map((b) => b.length), [2, 1]);
  assert.deepEqual(chunkTranslationItems(items, 0).map((b) => b.length), [3]);
});

test('needsDescriptionTranslation: empty/whitespace never needs translation', () => {
  assert.equal(needsDescriptionTranslation('', 'ko'), false);
  assert.equal(needsDescriptionTranslation('   ', 'en'), false);
});

test('needsDescriptionTranslation: Hangul heuristic per target language', () => {
  assert.equal(needsDescriptionTranslation('웹 빌더 도구', 'ko'), false);
  assert.equal(needsDescriptionTranslation('A web builder', 'ko'), true);
  assert.equal(needsDescriptionTranslation('A web builder', 'en'), false);
  assert.equal(needsDescriptionTranslation('한글 설명', 'en'), true);
});

test('resolveDisplayedRepoDescription: original shown without translation', () => {
  assert.deepEqual(
    resolveDisplayedRepoDescription({
      repoId: 1,
      originalDescription: 'original',
      translationsMap: undefined,
      showOriginal: false,
    }),
    { text: 'original', hasTranslation: false, isTranslated: false }
  );
});

test('resolveDisplayedRepoDescription: translation shown by default, original on demand', () => {
  const map = { 1: '  translated  ' };
  assert.deepEqual(
    resolveDisplayedRepoDescription({ repoId: 1, originalDescription: 'original', translationsMap: map, showOriginal: false }),
    { text: 'translated', hasTranslation: true, isTranslated: true }
  );
  assert.deepEqual(
    resolveDisplayedRepoDescription({ repoId: 1, originalDescription: 'original', translationsMap: map, showOriginal: true }),
    { text: 'original', hasTranslation: true, isTranslated: false }
  );
});

test('resolveDisplayedRepoDescription: blank translation entry falls back to original', () => {
  assert.deepEqual(
    resolveDisplayedRepoDescription({
      repoId: 1,
      originalDescription: 'original',
      translationsMap: { 1: '   ' },
      showOriginal: false,
    }),
    { text: 'original', hasTranslation: false, isTranslated: false }
  );
});
