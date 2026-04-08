import { useState, useCallback } from 'react';
import { RecordButton } from '../components/RecordButton';
import { useVoiceRecorder } from '../hooks/useVoiceRecorder';
import { useTranslation } from '../hooks/useTranslation';
import { useTTS } from '../hooks/useTTS';
import { translateText } from '../services/api';
import { useTranslationStore } from '../stores/translationStore';

interface Message {
  id: string;
  speaker: 'A' | 'B';
  original: string;
  translated: string;
}

const SPEECH_LOCALE_MAP: Record<string, string> = {
  zh: 'zh-CN', en: 'en-US', ja: 'ja-JP', ko: 'ko-KR',
  fr: 'fr-FR', de: 'de-DE', es: 'es-ES', ru: 'ru-RU',
};

const LANG_NAMES: Record<string, string> = {
  zh: '中文', en: 'English', ja: '日本語', ko: '한국어',
  fr: 'Français', de: 'Deutsch', es: 'Español', ru: 'Русский',
};

function ConversationSide({
  speaker,
  language,
  messages,
  onMessage,
  inverted = false,
}: {
  speaker: 'A' | 'B';
  language: string;
  messages: Message[];
  onMessage: (text: string, speaker: 'A' | 'B') => void;
  inverted?: boolean;
}) {
  const speechLocale = SPEECH_LOCALE_MAP[language] || language;
  const { state, transcript, interimTranscript, startRecording, stopRecording, isSupported } =
    useVoiceRecorder(speechLocale);

  const handleStop = useCallback(() => {
    stopRecording();
    const text = transcript || interimTranscript;
    if (text.trim()) {
      onMessage(text, speaker);
    }
  }, [stopRecording, transcript, interimTranscript, onMessage, speaker]);

  const myMessages = messages.filter((m) => m.speaker === speaker);

  return (
    <div className={`flex flex-1 flex-col ${inverted ? 'rotate-180' : ''}`}>
      <div className="mb-2 text-center text-sm font-semibold text-gray-500">
        {LANG_NAMES[language] || language}
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto px-3">
        {myMessages.map((msg) => (
          <div key={msg.id} className="rounded-xl bg-white/80 p-3 shadow-sm">
            <p className="text-sm text-gray-700">{msg.original}</p>
            <p className="mt-1 text-sm font-medium text-indigo-600">{msg.translated}</p>
          </div>
        ))}

        {state === 'recording' && (transcript || interimTranscript) && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
            <p className="text-sm text-amber-700 streaming-cursor">{transcript}{interimTranscript}</p>
          </div>
        )}
      </div>

      <div className="py-3">
        <RecordButton
          state={state}
          onStart={startRecording}
          onStop={handleStop}
          disabled={!isSupported}
        />
      </div>
    </div>
  );
}

export function ConversationPage() {
  const { sourceLanguage, targetLanguage } = useTranslationStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const { translate } = useTranslation();
  const { play } = useTTS();

  const handleMessage = useCallback(async (text: string, speaker: 'A' | 'B') => {
    const targetLang = speaker === 'A' ? targetLanguage : sourceLanguage;
    const ttsLang = targetLang;

    try {
      // Use the non-streaming translate for conversation mode
      const result = await translateText({
        text,
        source_language: speaker === 'A' ? sourceLanguage : targetLanguage,
        target_language: targetLang,
      });

      const msg: Message = {
        id: crypto.randomUUID(),
        speaker,
        original: text,
        translated: result.translatedText,
      };
      setMessages((prev) => [...prev, msg]);

      // Auto-play TTS for the translation
      play(result.translatedText, ttsLang);
    } catch (err) {
      console.error('Conversation translation failed:', err);
    }
  }, [sourceLanguage, targetLanguage, play, translate]);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-gray-100 px-4 py-3 text-center">
        <h2 className="text-lg font-semibold text-gray-800">Conversation Mode</h2>
        <p className="text-xs text-gray-400">Two people, face to face</p>
      </div>

      {/* Speaker B (inverted for face-to-face) */}
      <div className="flex-1 border-b-2 border-dashed border-gray-200 bg-gradient-to-b from-blue-50 to-white p-3">
        <ConversationSide
          speaker="B"
          language={targetLanguage}
          messages={messages}
          onMessage={handleMessage}
          inverted
        />
      </div>

      {/* Speaker A */}
      <div className="flex-1 bg-gradient-to-t from-indigo-50 to-white p-3">
        <ConversationSide
          speaker="A"
          language={sourceLanguage}
          messages={messages}
          onMessage={handleMessage}
        />
      </div>
    </div>
  );
}
