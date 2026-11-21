import test from 'node:test';
import assert from 'node:assert/strict';
import {
  extractTranscriptFromSpeechEvent,
  getSpeechRecognitionConstructor,
  mapSpeechErrorCode,
  normalizeVoiceTranscript,
  resolveSpeechRecognitionLanguage,
} from './voiceSearch.ts';

test('resolveSpeechRecognitionLanguage maps app language to BCP-47 speech locale', () => {
  assert.equal(resolveSpeechRecognitionLanguage('ko'), 'ko-KR');
  assert.equal(resolveSpeechRecognitionLanguage('en'), 'en-US');
});

test('getSpeechRecognitionConstructor detects standard and webkit constructors safely', () => {
  class MockStandard {}
  class MockWebkit {}

  assert.equal(getSpeechRecognitionConstructor(undefined), null);
  assert.equal(getSpeechRecognitionConstructor({}), null);
  assert.equal(getSpeechRecognitionConstructor({ SpeechRecognition: MockStandard }), MockStandard);
  assert.equal(
    getSpeechRecognitionConstructor({ webkitSpeechRecognition: MockWebkit }),
    MockWebkit
  );
});

test('normalizeVoiceTranscript collapses whitespace and strips trailing dictation punctuation', () => {
  assert.equal(normalizeVoiceTranscript('  MCP   서버. '), 'MCP 서버');
  assert.equal(normalizeVoiceTranscript('Lovable Supabase!'), 'Lovable Supabase');
  assert.equal(normalizeVoiceTranscript('   '), '');
});

test('extractTranscriptFromSpeechEvent combines multi-segment speech results cleanly', () => {
  const interim = extractTranscriptFromSpeechEvent([
    { isFinal: false, length: 1, 0: { transcript: '한국어  에이전트' } },
  ]);
  assert.deepEqual(interim, { transcript: '한국어 에이전트', isFinal: false });

  const finalized = extractTranscriptFromSpeechEvent([
    { isFinal: true, length: 1, 0: { transcript: 'MCP' } },
    { isFinal: true, length: 1, 0: { transcript: '서버.' } },
  ]);
  assert.deepEqual(finalized, { transcript: 'MCP 서버', isFinal: true });
});

test('mapSpeechErrorCode maps browser speech errors to localized semantic codes', () => {
  assert.equal(mapSpeechErrorCode('not-allowed'), 'permission_denied');
  assert.equal(mapSpeechErrorCode('service-not-allowed'), 'permission_denied');
  assert.equal(mapSpeechErrorCode('no-speech'), 'no_speech');
  assert.equal(mapSpeechErrorCode('audio-capture'), 'audio_capture');
  assert.equal(mapSpeechErrorCode('network'), 'network');
  assert.equal(mapSpeechErrorCode('aborted'), 'aborted');
  assert.equal(mapSpeechErrorCode('unexpected'), 'unknown');
});
