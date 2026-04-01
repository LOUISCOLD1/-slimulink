import { create } from 'zustand';
import type { TranslationResult } from '../types';

interface TranslationStore {
  sourceLanguage: string;
  targetLanguage: string;
  sessionId: string;
  history: TranslationResult[];
  setSourceLanguage: (lang: string) => void;
  setTargetLanguage: (lang: string) => void;
  swapLanguages: () => void;
  addHistory: (result: TranslationResult) => void;
  clearHistory: () => void;
}

// Load history from localStorage
function loadHistory(): TranslationResult[] {
  try {
    const data = localStorage.getItem('translation_history');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveHistory(history: TranslationResult[]) {
  try {
    localStorage.setItem('translation_history', JSON.stringify(history.slice(-100)));
  } catch { /* ignore quota errors */ }
}

export const useTranslationStore = create<TranslationStore>((set, get) => ({
  sourceLanguage: 'zh',
  targetLanguage: 'en',
  sessionId: crypto.randomUUID(),
  history: loadHistory(),

  setSourceLanguage: (lang) => set({ sourceLanguage: lang }),
  setTargetLanguage: (lang) => set({ targetLanguage: lang }),

  swapLanguages: () => {
    const { sourceLanguage, targetLanguage } = get();
    set({ sourceLanguage: targetLanguage, targetLanguage: sourceLanguage });
  },

  addHistory: (result) => {
    const history = [...get().history, result];
    saveHistory(history);
    set({ history });
  },

  clearHistory: () => {
    localStorage.removeItem('translation_history');
    set({ history: [] });
  },
}));
