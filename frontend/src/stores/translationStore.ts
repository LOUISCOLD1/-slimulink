import { create } from 'zustand';
import type { TranslationResult } from '../types';

interface TranslationStore {
  // Auth
  token: string | null;
  user: { id: number; username: string; display_name: string | null } | null;
  setAuth: (token: string, user: { id: number; username: string; display_name: string | null }) => void;
  logout: () => void;
  isAuthenticated: () => boolean;

  // Language
  sourceLanguage: string;
  targetLanguage: string;
  sessionId: string;
  setSourceLanguage: (lang: string) => void;
  setTargetLanguage: (lang: string) => void;
  swapLanguages: () => void;

  // History (local cache)
  history: TranslationResult[];
  addHistory: (result: TranslationResult) => void;
  clearHistory: () => void;
}

export const useTranslationStore = create<TranslationStore>((set, get) => ({
  // Auth
  token: localStorage.getItem('token'),
  user: null,
  setAuth: (token, user) => {
    localStorage.setItem('token', token);
    set({ token, user });
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, user: null });
  },
  isAuthenticated: () => !!get().token,

  // Language
  sourceLanguage: 'zh',
  targetLanguage: 'en',
  sessionId: crypto.randomUUID(),
  setSourceLanguage: (lang) => set({ sourceLanguage: lang }),
  setTargetLanguage: (lang) => set({ targetLanguage: lang }),
  swapLanguages: () => {
    const { sourceLanguage, targetLanguage } = get();
    set({ sourceLanguage: targetLanguage, targetLanguage: sourceLanguage });
  },

  // History (local cache, backed by server API)
  history: [],
  addHistory: (result) => {
    set({ history: [...get().history, result] });
  },
  clearHistory: () => {
    set({ history: [] });
  },
}));
