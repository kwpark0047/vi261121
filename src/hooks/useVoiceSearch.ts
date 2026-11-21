import { useCallback, useEffect, useRef, useState } from 'react';
import type { AppLanguage } from '../types/vibeatlas';
import {
  extractTranscriptFromSpeechEvent,
  getSpeechRecognitionConstructor,
  mapSpeechErrorCode,
  resolveSpeechRecognitionLanguage,
  type SpeechRecognitionLike,
  type VoiceSearchErrorCode,
  type VoiceSearchStatus,
} from '../lib/voiceSearch';

interface UseVoiceSearchOptions {
  language: AppLanguage;
  onInterimTranscript?: (transcript: string) => void;
  onFinalTranscript: (transcript: string) => void;
}

export function useVoiceSearch({
  language,
  onInterimTranscript,
  onFinalTranscript,
}: UseVoiceSearchOptions) {
  const [status, setStatus] = useState<VoiceSearchStatus>('idle');
  const [errorCode, setErrorCode] = useState<VoiceSearchErrorCode | null>(null);
  const [interimTranscript, setInterimTranscript] = useState('');

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const manualStopRef = useRef(false);
  const hasErrorRef = useRef(false);
  const finalDeliveredRef = useRef(false);
  const onInterimRef = useRef(onInterimTranscript);
  const onFinalRef = useRef(onFinalTranscript);

  useEffect(() => {
    onInterimRef.current = onInterimTranscript;
  }, [onInterimTranscript]);

  useEffect(() => {
    onFinalRef.current = onFinalTranscript;
  }, [onFinalTranscript]);

  const stop = useCallback(() => {
    manualStopRef.current = true;
    const active = recognitionRef.current;
    recognitionRef.current = null;
    if (active) {
      try {
        active.stop();
      } catch {
        // Ignore stop errors if recognition already ended
      }
    }
    setStatus('idle');
    setInterimTranscript('');
  }, []);

  const clearError = useCallback(() => {
    hasErrorRef.current = false;
    setErrorCode(null);
    setStatus((prev) => (prev === 'error' ? 'idle' : prev));
  }, []);

  const start = useCallback(() => {
    const Ctor = getSpeechRecognitionConstructor();
    if (!Ctor) {
      hasErrorRef.current = true;
      setErrorCode('unsupported');
      setStatus('error');
      return;
    }

    if (recognitionRef.current) {
      stop();
      return;
    }

    manualStopRef.current = false;
    hasErrorRef.current = false;
    finalDeliveredRef.current = false;
    setErrorCode(null);
    setInterimTranscript('');

    const recognition = new Ctor();
    recognition.lang = resolveSpeechRecognitionLanguage(language);
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setStatus('listening');
    };

    recognition.onresult = (event) => {
      const { transcript, isFinal } = extractTranscriptFromSpeechEvent(event.results);
      if (!transcript) return;
      setInterimTranscript(transcript);
      onInterimRef.current?.(transcript);
      if (isFinal && !finalDeliveredRef.current) {
        finalDeliveredRef.current = true;
        onFinalRef.current(transcript);
      }
    };

    recognition.onerror = (event) => {
      if (manualStopRef.current || event.error === 'aborted') {
        return;
      }
      hasErrorRef.current = true;
      setErrorCode(mapSpeechErrorCode(event.error));
      setStatus('error');
      setInterimTranscript('');
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      if (!hasErrorRef.current) {
        setStatus('idle');
      }
    };

    recognitionRef.current = recognition;
    setStatus('listening');

    try {
      recognition.start();
    } catch {
      recognitionRef.current = null;
      hasErrorRef.current = true;
      setErrorCode('unknown');
      setStatus('error');
    }
  }, [language, stop]);

  const toggle = useCallback(() => {
    if (status === 'listening') {
      stop();
    } else {
      start();
    }
  }, [status, start, stop]);

  useEffect(() => {
    return () => {
      manualStopRef.current = true;
      const active = recognitionRef.current;
      recognitionRef.current = null;
      if (active) {
        try {
          if (typeof active.abort === 'function') {
            active.abort();
          } else {
            active.stop();
          }
        } catch {
          // Ignore unmount cleanup failures
        }
      }
    };
  }, []);

  return {
    status,
    isListening: status === 'listening',
    errorCode,
    interimTranscript,
    start,
    stop,
    toggle,
    clearError,
  };
}
