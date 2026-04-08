import { useState, useCallback } from 'react';
import { translateTextStream } from '../services/api';
import type { TranslationState } from '../types';
import { useTranslationStore } from '../stores/translationStore';

interface UseTranslationReturn {
  state: TranslationState;
  originalText: string;
  cleanedText: string;
  translatedText: string;
  error: string | null;
  translate: (text: string) => Promise<void>;
  reset: () => void;
}

export function useTranslation(): UseTranslationReturn {
  const [state, setState] = useState<TranslationState>('idle');
  const [originalText, setOriginalText] = useState('');
  const [cleanedText, setCleanedText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { sourceLanguage, targetLanguage, sessionId, addHistory } = useTranslationStore();

  const translate = useCallback(async (text: string) => {
    if (!text.trim()) return;

    setState('translating');
    setOriginalText(text);
    setCleanedText('');
    setTranslatedText('');
    setError(null);

    try {
      let cleaned = '';
      let translated = '';

      await translateTextStream(
        {
          text,
          source_language: sourceLanguage,
          target_language: targetLanguage,
          session_id: sessionId,
        },
        (original) => setOriginalText(original),
        (c) => { cleaned = c; setCleanedText(c); },
        (t) => { translated = t; setTranslatedText(t); },
        (err) => setError(err),
      );

      setState('done');

      // Save to history
      addHistory({
        id: crypto.randomUUID(),
        originalText: text,
        cleanedText: cleaned,
        translatedText: translated,
        sourceLanguage,
        targetLanguage,
        timestamp: Date.now(),
      });
    } catch (err) {
      setState('error');
      setError(err instanceof Error ? err.message : 'Translation failed');
    }
  }, [sourceLanguage, targetLanguage, sessionId, addHistory]);

  const reset = useCallback(() => {
    setState('idle');
    setOriginalText('');
    setCleanedText('');
    setTranslatedText('');
    setError(null);
  }, []);

  return { state, originalText, cleanedText, translatedText, error, translate, reset };
}
