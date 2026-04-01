import { useTranslationStore } from '../stores/translationStore';
import { useTTS } from '../hooks/useTTS';

export function HistoryPage() {
  const { history, clearHistory } = useTranslationStore();
  const { play, isPlaying, stop } = useTTS();

  const sortedHistory = [...history].reverse();

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <h2 className="text-lg font-semibold text-gray-800">History</h2>
        {history.length > 0 && (
          <button
            onClick={clearHistory}
            className="text-sm text-red-500 hover:text-red-600"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {sortedHistory.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-gray-400">
            <svg className="mb-3 h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm">No translation history yet</p>
          </div>
        ) : (
          <div className="space-y-3 p-4">
            {sortedHistory.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    {new Date(item.timestamp).toLocaleString()}
                  </span>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                    {item.sourceLanguage} → {item.targetLanguage}
                  </span>
                </div>

                <div className="space-y-2">
                  <div>
                    <span className="text-xs font-medium text-gray-400">Original</span>
                    <p className="text-sm text-gray-600">{item.originalText}</p>
                  </div>

                  {item.cleanedText && item.cleanedText !== item.originalText && (
                    <div>
                      <span className="text-xs font-medium text-blue-400">AI Refined</span>
                      <p className="text-sm text-blue-700">{item.cleanedText}</p>
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <span className="text-xs font-medium text-emerald-400">Translation</span>
                      <p className="text-sm font-medium text-emerald-700">{item.translatedText}</p>
                    </div>
                    <button
                      onClick={() =>
                        isPlaying ? stop() : play(item.translatedText, item.targetLanguage)
                      }
                      className="mt-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 hover:bg-emerald-100"
                    >
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M11.383 3.07C11.009 2.924 10.579 3 10.293 3.293l-6 6A1 1 0 004 10H2a1 1 0 00-1 1v2a1 1 0 001 1h2a1 1 0 01.293.07l6 6a1 1 0 001.707-.707V3.777a1 1 0 00-.617-.707z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
