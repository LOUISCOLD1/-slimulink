import { useState, useEffect } from 'react';
import { useTranslationStore } from '../stores/translationStore';
import { fetchSettings, updateSettings, type UserSettingsData } from '../services/api';

export function SettingsPage() {
  const { sourceLanguage, targetLanguage, setSourceLanguage, setTargetLanguage, user, logout } =
    useTranslationStore();
  const [autoPlayTts, setAutoPlayTts] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load settings from server
  useEffect(() => {
    fetchSettings()
      .then((data) => {
        setSourceLanguage(data.source_lang);
        setTargetLanguage(data.target_lang);
        setAutoPlayTts(data.auto_play_tts);
      })
      .catch(() => { /* use local defaults */ });
  }, []);// eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const data: UserSettingsData = {
        source_lang: sourceLanguage,
        target_lang: targetLanguage,
        tts_voice_source: null,
        tts_voice_target: null,
        auto_play_tts: autoPlayTts,
      };
      await updateSettings(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { /* ignore */ }
    finally { setSaving(false); }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-gray-100 px-4 py-3">
        <h2 className="text-lg font-semibold text-gray-800">Settings</h2>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto p-4">
        {/* User Info */}
        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Account
          </h3>
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">{user?.display_name || user?.username}</p>
                <p className="text-xs text-gray-400">@{user?.username}</p>
              </div>
              <button
                onClick={logout}
                className="rounded-xl bg-red-50 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-100"
              >
                Logout
              </button>
            </div>
          </div>
        </section>

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
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-600">Auto-play TTS</label>
              <button
                onClick={() => setAutoPlayTts(!autoPlayTts)}
                className={`relative h-6 w-11 rounded-full transition-colors ${autoPlayTts ? 'bg-indigo-500' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${autoPlayTts ? 'left-5.5 translate-x-0' : 'left-0.5'}`} />
              </button>
            </div>
          </div>
        </section>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className={`w-full rounded-xl py-2.5 text-sm font-medium text-white transition-colors ${
            saved ? 'bg-emerald-500' : 'bg-indigo-500 hover:bg-indigo-600'
          } disabled:opacity-50`}
        >
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Settings'}
        </button>

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
