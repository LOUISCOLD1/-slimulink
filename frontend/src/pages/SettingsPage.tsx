import { useState } from 'react';
import { useTranslationStore } from '../stores/translationStore';

export function SettingsPage() {
  const { sourceLanguage, targetLanguage, setSourceLanguage, setTargetLanguage } =
    useTranslationStore();
  const [apiBase, setApiBase] = useState(
    () => localStorage.getItem('api_base') || ''
  );

  const handleSaveApiBase = () => {
    if (apiBase) {
      localStorage.setItem('api_base', apiBase);
    } else {
      localStorage.removeItem('api_base');
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-gray-100 px-4 py-3">
        <h2 className="text-lg font-semibold text-gray-800">Settings</h2>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto p-4">
        {/* Language Settings */}
        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Language
          </h3>
          <div className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
            <div>
              <label className="mb-1 block text-sm text-gray-600">Source Language</label>
              <select
                value={sourceLanguage}
                onChange={(e) => setSourceLanguage(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
              >
                <option value="zh">中文</option>
                <option value="en">English</option>
                <option value="ja">日本語</option>
                <option value="ko">한국어</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="es">Español</option>
                <option value="ru">Русский</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-600">Target Language</label>
              <select
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
              >
                <option value="zh">中文</option>
                <option value="en">English</option>
                <option value="ja">日本語</option>
                <option value="ko">한국어</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="es">Español</option>
                <option value="ru">Русский</option>
              </select>
            </div>
          </div>
        </section>

        {/* API Settings */}
        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            API Configuration
          </h3>
          <div className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
            <div>
              <label className="mb-1 block text-sm text-gray-600">
                Backend API URL (optional)
              </label>
              <input
                type="text"
                value={apiBase}
                onChange={(e) => setApiBase(e.target.value)}
                placeholder="http://localhost:8000"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
              />
            </div>
            <button
              onClick={handleSaveApiBase}
              className="w-full rounded-xl bg-indigo-500 py-2 text-sm font-medium text-white hover:bg-indigo-600"
            >
              Save
            </button>
          </div>
        </section>

        {/* About */}
        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            About
          </h3>
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <h4 className="text-base font-bold text-gray-800">AI Voice Translator</h4>
            <p className="mt-1 text-sm text-gray-500">
              Powered by AI, not just translation — understanding what you truly mean.
            </p>
            <div className="mt-3 space-y-1 text-xs text-gray-400">
              <p>STT: Web Speech API</p>
              <p>Translation: DeepSeek / ZhipuAI</p>
              <p>TTS: Edge TTS</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
