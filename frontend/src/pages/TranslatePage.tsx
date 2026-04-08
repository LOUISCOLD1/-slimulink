import { useCallback, useState } from 'react';
import { LanguageSelector } from '../components/LanguageSelector';
import { RecordButton } from '../components/RecordButton';
import { TranslationPanel } from '../components/TranslationPanel';
import { useVoiceRecorder } from '../hooks/useVoiceRecorder';
import { useTranslation } from '../hooks/useTranslation';
import { useTranslationStore } from '../stores/translationStore';

// Map language codes to Web Speech API locale codes
const SPEECH_LOCALE_MAP: Record<string, string> = {
  zh: 'zh-CN',
  en: 'en-US',
  ja: 'ja-JP',
  ko: 'ko-KR',
  fr: 'fr-FR',
  de: 'de-DE',
  es: 'es-ES',
  ru: 'ru-RU',
};

export function TranslatePage() {
  const { sourceLanguage, targetLanguage } = useTranslationStore();
  const speechLocale = SPEECH_LOCALE_MAP[sourceLanguage] || 'zh-CN';
  const { state: recState, transcript, interimTranscript, startRecording, stopRecording, isSupported } =
    useVoiceRecorder(speechLocale);
  const { state: transState, originalText, cleanedText, translatedText, error, translate, reset } =
    useTranslation();
  const [textInput, setTextInput] = useState('');

  const handleStopRecording = useCallback(() => {
    stopRecording();
    // Use the transcript captured at stop time
    const text = transcript || interimTranscript;
    if (text.trim()) {
      translate(text);
    }
  }, [stopRecording, transcript, interimTranscript, translate]);

  const handleTextSubmit = useCallback(() => {
    if (textInput.trim()) {
      translate(textInput.trim());
      setTextInput('');
    }
  }, [textInput, translate]);

  const isTranslating = transState === 'translating';
  const liveText = recState === 'recording' ? (transcript + interimTranscript) : '';

  return (
    <div className="flex h-full flex-col">
      {/* Language selector */}
      <LanguageSelector />

      {/* Translation panels */}
      <div className="flex-1 space-y-3 overflow-y-auto px-4 pb-4">
        {/* Live speech preview during recording */}
        {recState === 'recording' && liveText && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <span className="text-xs font-semibold uppercase tracking-wide text-amber-500">
              Listening...
            </span>
            <p className="mt-1 text-base text-amber-800 streaming-cursor">{liveText}</p>
          </div>
        )}

        {/* Original text panel */}
        <TranslationPanel
          label="Original"
          icon="🎤"
          text={originalText}
          color="gray"
          streaming={isTranslating && !cleanedText}
        />

        {/* Arrow indicator */}
        {originalText && (
          <div className="flex justify-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-500">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
              </svg>
            </div>
          </div>
        )}

        {/* AI cleaned text panel */}
        <TranslationPanel
          label="AI Refined"
          icon="✨"
          text={cleanedText}
          color="blue"
          streaming={isTranslating && !!originalText && !translatedText}
        />

        {/* Arrow indicator */}
        {cleanedText && (
          <div className="flex justify-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-500">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
              </svg>
            </div>
          </div>
        )}

        {/* Translation result panel */}
        <TranslationPanel
          label="Translation"
          icon="🌍"
          text={translatedText}
          color="green"
          language={targetLanguage}
          showTTS
          streaming={isTranslating && !!cleanedText}
        />

        {/* Error display */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Reset button */}
        {transState === 'done' && (
          <button
            onClick={reset}
            className="w-full rounded-xl bg-gray-100 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
          >
            Clear & Start Over
          </button>
        )}
      </div>

      {/* Bottom input area */}
      <div className="border-t border-gray-100 bg-white px-4 pb-6 pt-4 safe-bottom">
        {/* Text input fallback */}
        <div className="mb-4 flex gap-2">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleTextSubmit()}
            placeholder="Or type here..."
            className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:border-indigo-400 focus:outline-none"
            disabled={isTranslating}
          />
          <button
            onClick={handleTextSubmit}
            disabled={!textInput.trim() || isTranslating}
            className="rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-600 disabled:opacity-50"
          >
            Send
          </button>
        </div>

        {/* Record button */}
        <RecordButton
          state={recState}
          onStart={startRecording}
          onStop={handleStopRecording}
          disabled={!isSupported || isTranslating}
        />

        {!isSupported && (
          <p className="mt-2 text-center text-xs text-amber-500">
            Speech recognition is not supported in this browser. Please use Chrome or Edge.
          </p>
        )}
      </div>
    </div>
  );
}
