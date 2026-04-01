import type { TranslateRequest, TTSRequest, Language, TranslationResult } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE || '';

export async function fetchLanguages(): Promise<Language[]> {
  const res = await fetch(`${API_BASE}/api/languages`);
  if (!res.ok) throw new Error('Failed to fetch languages');
  return res.json();
}

export async function translateText(
  request: TranslateRequest,
): Promise<TranslationResult> {
  const res = await fetch(`${API_BASE}/api/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!res.ok) throw new Error('Translation failed');
  const data = await res.json();
  return {
    id: crypto.randomUUID(),
    originalText: data.original_text,
    cleanedText: data.cleaned_text,
    translatedText: data.translated_text,
    sourceLanguage: request.source_language,
    targetLanguage: request.target_language,
    timestamp: Date.now(),
  };
}

export async function translateTextStream(
  request: TranslateRequest,
  onOriginal: (text: string) => void,
  onCleaned: (text: string) => void,
  onTranslation: (text: string) => void,
  onError?: (error: string) => void,
): Promise<void> {
  const res = await fetch(`${API_BASE}/api/translate/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!res.ok) throw new Error('Translation stream failed');

  const reader = res.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    let currentEvent = '';
    for (const line of lines) {
      if (line.startsWith('event: ')) {
        currentEvent = line.slice(7).trim();
      } else if (line.startsWith('data: ')) {
        const data = JSON.parse(line.slice(6));
        switch (currentEvent) {
          case 'original':
            onOriginal(data.text);
            break;
          case 'cleaned':
            onCleaned(data.text);
            break;
          case 'translation':
            onTranslation(data.text);
            break;
          case 'error':
            onError?.(data.message);
            break;
        }
      }
    }
  }
}

export async function synthesizeSpeech(request: TTSRequest): Promise<string> {
  const res = await fetch(`${API_BASE}/api/tts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!res.ok) throw new Error('TTS failed');
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}
