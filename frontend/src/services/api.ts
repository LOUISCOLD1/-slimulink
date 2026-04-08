import type { TranslateRequest, TTSRequest, Language, TranslationResult } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE || '';

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('token');
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

function authFetch(url: string, init?: RequestInit): Promise<Response> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
    ...init?.headers,
  };
  return fetch(url, { ...init, headers });
}

// --- Auth ---

export async function register(username: string, password: string): Promise<{ access_token: string }> {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Registration failed' }));
    throw new Error(err.detail || 'Registration failed');
  }
  return res.json();
}

export async function login(username: string, password: string): Promise<{ access_token: string }> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Login failed' }));
    throw new Error(err.detail || 'Invalid username or password');
  }
  return res.json();
}

export async function fetchMe(): Promise<{ id: number; username: string; display_name: string | null }> {
  const res = await authFetch(`${API_BASE}/api/auth/me`);
  if (!res.ok) throw new Error('Not authenticated');
  return res.json();
}

// --- Translation ---

export async function fetchLanguages(): Promise<Language[]> {
  const res = await fetch(`${API_BASE}/api/languages`);
  if (!res.ok) throw new Error('Failed to fetch languages');
  return res.json();
}

export async function translateText(request: TranslateRequest): Promise<TranslationResult> {
  const res = await authFetch(`${API_BASE}/api/translate`, {
    method: 'POST',
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
  const res = await authFetch(`${API_BASE}/api/translate/stream`, {
    method: 'POST',
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

// --- TTS ---

export async function synthesizeSpeech(request: TTSRequest): Promise<string> {
  const res = await authFetch(`${API_BASE}/api/tts`, {
    method: 'POST',
    body: JSON.stringify(request),
  });
  if (!res.ok) throw new Error('TTS failed');
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

// --- History ---

export interface HistoryResponse {
  items: Array<{
    id: number;
    original_text: string;
    cleaned_text: string;
    translated_text: string;
    source_lang: string;
    target_lang: string;
    engine_used: string | null;
    created_at: string;
  }>;
  total: number;
  page: number;
  size: number;
}

export async function fetchHistory(page = 1, size = 20): Promise<HistoryResponse> {
  const res = await authFetch(`${API_BASE}/api/history?page=${page}&size=${size}`);
  if (!res.ok) throw new Error('Failed to fetch history');
  return res.json();
}

export async function deleteHistoryItem(id: number): Promise<void> {
  const res = await authFetch(`${API_BASE}/api/history/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete');
}

// --- Settings ---

export interface UserSettingsData {
  source_lang: string;
  target_lang: string;
  tts_voice_source: string | null;
  tts_voice_target: string | null;
  auto_play_tts: boolean;
}

export async function fetchSettings(): Promise<UserSettingsData> {
  const res = await authFetch(`${API_BASE}/api/settings`);
  if (!res.ok) throw new Error('Failed to fetch settings');
  return res.json();
}

export async function updateSettings(data: UserSettingsData): Promise<UserSettingsData> {
  const res = await authFetch(`${API_BASE}/api/settings`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update settings');
  return res.json();
}
