import { useTranslationStore } from '../stores/translationStore';

const LANGUAGES = [
  { code: 'zh', name: '中文' },
  { code: 'en', name: 'English' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'es', name: 'Español' },
  { code: 'ru', name: 'Русский' },
];

export function LanguageSelector() {
  const { sourceLanguage, targetLanguage, setSourceLanguage, setTargetLanguage, swapLanguages } =
    useTranslationStore();

  return (
    <div className="flex items-center justify-center gap-3 px-4 py-3">
      <select
        value={sourceLanguage}
        onChange={(e) => setSourceLanguage(e.target.value)}
        className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm focus:border-indigo-400 focus:outline-none"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>

      <button
        onClick={swapLanguages}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 transition-transform hover:bg-indigo-100 active:scale-90"
        title="Swap languages"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
        </svg>
      </button>

      <select
        value={targetLanguage}
        onChange={(e) => setTargetLanguage(e.target.value)}
        className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm focus:border-indigo-400 focus:outline-none"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
}
