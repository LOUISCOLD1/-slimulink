import { useState, useEffect, useCallback } from 'react';
import { fetchHistory, deleteHistoryItem, type HistoryResponse } from '../services/api';
import { useTTS } from '../hooks/useTTS';

export function HistoryPage() {
  const [data, setData] = useState<HistoryResponse | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const { play, isPlaying, stop } = useTTS();

  const loadHistory = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const result = await fetchHistory(p, 20);
      setData(result);
    } catch {
      // If server unavailable, show empty
      setData({ items: [], total: 0, page: p, size: 20 });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory(page);
  }, [page, loadHistory]);

  const handleDelete = async (id: number) => {
    try {
      await deleteHistoryItem(id);
      loadHistory(page);
    } catch { /* ignore */ }
  };

  const totalPages = data ? Math.ceil(data.total / data.size) : 0;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <h2 className="text-lg font-semibold text-gray-800">History</h2>
        {data && data.total > 0 && (
          <span className="text-xs text-gray-400">{data.total} records</span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex h-full items-center justify-center text-gray-400">
            <div className="text-sm">Loading...</div>
          </div>
        ) : !data || data.items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-gray-400">
            <svg className="mb-3 h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm">No translation history yet</p>
          </div>
        ) : (
          <div className="space-y-3 p-4">
            {data.items.map((item) => (
              <div key={item.id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    {new Date(item.created_at).toLocaleString()}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                      {item.source_lang} → {item.target_lang}
                    </span>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-xs text-gray-300 hover:text-red-400"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <span className="text-xs font-medium text-gray-400">Original</span>
                    <p className="text-sm text-gray-600">{item.original_text}</p>
                  </div>

                  {item.cleaned_text && item.cleaned_text !== item.original_text && (
                    <div>
                      <span className="text-xs font-medium text-blue-400">AI Refined</span>
                      <p className="text-sm text-blue-700">{item.cleaned_text}</p>
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <span className="text-xs font-medium text-emerald-400">Translation</span>
                      <p className="text-sm font-medium text-emerald-700">{item.translated_text}</p>
                    </div>
                    <button
                      onClick={() => isPlaying ? stop() : play(item.translated_text, item.target_lang)}
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 py-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page <= 1}
                  className="rounded-lg px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 disabled:opacity-30"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-400">{page} / {totalPages}</span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page >= totalPages}
                  className="rounded-lg px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 disabled:opacity-30"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
