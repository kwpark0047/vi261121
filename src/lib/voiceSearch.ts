import type { AppLanguage } from '../types/vibeatlas';

export type VoiceSearchStatus = 'idle' | 'listening' | 'error';

export type VoiceSearchErrorCode =
  | 'unsupported'
  | 'permission_denied'
  | 'no_speech'
  | 'audio_capture'
  | 'network'
  | 'aborted'
  | 'unknown';

export interface SpeechRecognitionAlternativeLike {
  transcript: string;
  confidence?: number;
}

export interface SpeechRecognitionResultLike {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternativeLike | undefined;
}

export interface SpeechRecognitionEventLike {
  results: ArrayLike<SpeechRecognitionResultLike>;
  resultIndex?: number;
}

export interface SpeechRecognitionErrorEventLike {
  error: string;
  message?: string;
}

export interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort?: () => void;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
}

export type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

export function resolveSpeechRecognitionLanguage(language: AppLanguage): string {
  return language === 'ko' ? 'ko-KR' : 'en-US';
}

export function getSpeechRecognitionConstructor(
  win: unknown = typeof window !== 'undefined' ? window : undefined
): SpeechRecognitionConstructor | null {
  if (!win || typeof win !== 'object') return null;
  const record = win as Record<string, unknown>;
  const ctor = record.SpeechRecognition ?? record.webkitSpeechRecognition;
  return typeof ctor === 'function' ? (ctor as SpeechRecognitionConstructor) : null;
}

export function normalizeVoiceTranscript(raw: string): string {
  if (typeof raw !== 'string') return '';
  return raw
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[.。!?]+$/u, '')
    .trim();
}

export function extractTranscriptFromSpeechEvent(results: ArrayLike<SpeechRecognitionResultLike> | null | undefined): {
  transcript: string;
  isFinal: boolean;
} {
  if (!results || results.length === 0) {
    return { transcript: '', isFinal: false };
  }

  const parts: string[] = [];
  let isFinal = false;

  for (let i = 0; i < results.length; i += 1) {
    const item = results[i];
    if (!item || item.length === 0) continue;
    const primary = item[0];
    if (primary && typeof primary.transcript === 'string' && primary.transcript.trim()) {
      parts.push(primary.transcript.trim());
    }
    if (item.isFinal) {
      isFinal = true;
    }
  }

  return {
    transcript: normalizeVoiceTranscript(parts.join(' ')),
    isFinal,
  };
}

export function mapSpeechErrorCode(error: string): VoiceSearchErrorCode {
  switch (error) {
    case 'not-allowed':
    case 'service-not-allowed':
      return 'permission_denied';
    case 'no-speech':
      return 'no_speech';
    case 'audio-capture':
      return 'audio_capture';
    case 'network':
      return 'network';
    case 'aborted':
      return 'aborted';
    default:
      return 'unknown';
  }
}
