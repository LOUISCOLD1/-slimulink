export interface Language {
  code: string;
  name: string;
  native_name: string;
}

export interface TranslationResult {
  id: string;
  originalText: string;
  cleanedText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  timestamp: number;
}

export interface TranslateRequest {
  text: string;
  source_language: string;
  target_language: string;
  session_id?: string;
}

export interface TTSRequest {
  text: string;
  language: string;
  voice?: string;
}

export type RecordingState = 'idle' | 'recording' | 'processing';
export type TranslationState = 'idle' | 'translating' | 'done' | 'error';
