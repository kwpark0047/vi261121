import { Mic, Square, X } from 'lucide-react';
import type { AppLanguage } from '../types/vibeatlas';
import { UI_STRINGS } from '../data/i18n';
import type { VoiceSearchErrorCode, VoiceSearchStatus } from '../lib/voiceSearch';

interface VoiceSearchButtonProps {
  language: AppLanguage;
  isListening: boolean;
  onClick: () => void;
}

export function VoiceSearchButton({
  language,
  isListening,
  onClick,
}: VoiceSearchButtonProps) {
  const copy = UI_STRINGS[language].voiceSearch;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isListening}
      aria-label={isListening ? copy.stopLabel : copy.startLabel}
      title={isListening ? copy.stopLabel : copy.startLabel}
      className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
        isListening
          ? 'border-blue-600 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-500 dark:bg-blue-950/60 dark:text-blue-300 dark:hover:bg-blue-950'
          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
      }`}
    >
      {isListening ? (
        <Square className="h-4 w-4 fill-current" aria-hidden="true" />
      ) : (
        <Mic className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  );
}

interface VoiceSearchFeedbackProps {
  language: AppLanguage;
  status: VoiceSearchStatus;
  errorCode: VoiceSearchErrorCode | null;
  interimTranscript: string;
  onStop: () => void;
  onDismissError: () => void;
}

function getErrorMessage(language: AppLanguage, code: VoiceSearchErrorCode): string {
  const copy = UI_STRINGS[language].voiceSearch;
  switch (code) {
    case 'unsupported':
      return copy.unsupportedError;
    case 'permission_denied':
      return copy.permissionDeniedError;
    case 'no_speech':
      return copy.noSpeechError;
    case 'audio_capture':
      return copy.audioCaptureError;
    case 'network':
      return copy.networkError;
    default:
      return copy.unknownError;
  }
}

export function VoiceSearchFeedback({
  language,
  status,
  errorCode,
  interimTranscript,
  onStop,
  onDismissError,
}: VoiceSearchFeedbackProps) {
  const copy = UI_STRINGS[language].voiceSearch;

  if (status === 'listening') {
    return (
      <div
        role="status"
        aria-live="polite"
        className="mt-2 flex items-center justify-between gap-3 rounded-lg border border-blue-200 bg-blue-50/80 px-3 py-2 text-xs text-blue-900 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-200"
      >
        <div className="flex min-w-0 items-center gap-2">
          <Mic className="h-3.5 w-3.5 shrink-0 text-blue-700 dark:text-blue-400" aria-hidden="true" />
          <span className="truncate font-medium">
            {interimTranscript ? `“${interimTranscript}”` : copy.listeningStatus}
          </span>
        </div>
        <button
          type="button"
          onClick={onStop}
          className="shrink-0 whitespace-nowrap rounded-md border border-blue-300 bg-white px-2.5 py-1 text-xs font-medium text-blue-800 hover:bg-blue-100 dark:border-blue-800 dark:bg-slate-900 dark:text-blue-200 dark:hover:bg-slate-800"
        >
          {copy.stopButton}
        </button>
      </div>
    );
  }

  if (errorCode) {
    return (
      <div
        role="alert"
        className="mt-2 flex items-center justify-between gap-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-200"
      >
        <span>{getErrorMessage(language, errorCode)}</span>
        <button
          type="button"
          onClick={onDismissError}
          aria-label={copy.dismissError}
          className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded text-rose-700 hover:bg-rose-100 dark:text-rose-300 dark:hover:bg-rose-900/50"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    );
  }

  return null;
}
