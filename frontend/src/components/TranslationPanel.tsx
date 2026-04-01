import { useTTS } from '../hooks/useTTS';

interface TranslationPanelProps {
  label: string;
  icon: string;
  text: string;
  color: 'gray' | 'blue' | 'green';
  language?: string;
  showTTS?: boolean;
  streaming?: boolean;
}

const colorMap = {
  gray: {
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    label: 'text-gray-500',
    text: 'text-gray-700',
  },
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    label: 'text-blue-500',
    text: 'text-blue-800',
  },
  green: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    label: 'text-emerald-500',
    text: 'text-emerald-800',
  },
};

export function TranslationPanel({
  label,
  icon,
  text,
  color,
  language,
  showTTS = false,
  streaming = false,
}: TranslationPanelProps) {
  const { isPlaying, isLoading, play, stop } = useTTS();
  const colors = colorMap[color];

  return (
    <div className={`rounded-2xl border ${colors.border} ${colors.bg} p-4`}>
      <div className="mb-2 flex items-center justify-between">
        <span className={`text-xs font-semibold uppercase tracking-wide ${colors.label}`}>
          {icon} {label}
        </span>
        {showTTS && text && language && (
          <button
            onClick={() => (isPlaying ? stop() : play(text, language))}
            className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
              isPlaying
                ? 'bg-emerald-200 text-emerald-700'
                : 'bg-white/70 text-gray-500 hover:text-emerald-600'
            }`}
            disabled={isLoading}
          >
            {isLoading ? (
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.383 3.07C11.009 2.924 10.579 3 10.293 3.293l-6 6A1 1 0 004 10H2a1 1 0 00-1 1v2a1 1 0 001 1h2a1 1 0 01.293.07l6 6a1 1 0 001.707-.707V3.777a1 1 0 00-.617-.707zM16.717 8.283a1 1 0 10-1.414 1.414 2 2 0 010 2.828 1 1 0 001.414 1.414 4 4 0 000-5.656zM19.142 5.858a1 1 0 10-1.414 1.414 6 6 0 010 8.484 1 1 0 001.414 1.414 8 8 0 000-11.312z" />
              </svg>
            )}
          </button>
        )}
      </div>

      <div className={`min-h-[2rem] text-base leading-relaxed ${colors.text}`}>
        {text ? (
          <span className={streaming ? 'streaming-cursor' : ''}>
            {text}
          </span>
        ) : (
          <span className="italic text-gray-300">Waiting for input...</span>
        )}
      </div>
    </div>
  );
}
