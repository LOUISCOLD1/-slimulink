import type { RecordingState } from '../types';

interface RecordButtonProps {
  state: RecordingState;
  onStart: () => void;
  onStop: () => void;
  disabled?: boolean;
}

export function RecordButton({ state, onStart, onStop, disabled }: RecordButtonProps) {
  const isRecording = state === 'recording';

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        {/* Pulse ring animation when recording */}
        {isRecording && (
          <>
            <div className="animate-pulse-ring absolute inset-0 rounded-full bg-red-400/30" />
            <div className="animate-pulse-ring absolute inset-0 rounded-full bg-red-400/20" style={{ animationDelay: '0.4s' }} />
          </>
        )}

        <button
          onMouseDown={onStart}
          onMouseUp={onStop}
          onMouseLeave={isRecording ? onStop : undefined}
          onTouchStart={(e) => { e.preventDefault(); onStart(); }}
          onTouchEnd={(e) => { e.preventDefault(); onStop(); }}
          disabled={disabled}
          className={`relative z-10 flex h-20 w-20 items-center justify-center rounded-full shadow-lg transition-all active:scale-95 ${
            isRecording
              ? 'bg-red-500 text-white shadow-red-200'
              : 'bg-indigo-500 text-white shadow-indigo-200 hover:bg-indigo-600'
          } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
        >
          {isRecording ? (
            <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          ) : (
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
            </svg>
          )}
        </button>
      </div>

      <span className={`text-sm font-medium ${isRecording ? 'text-red-500' : 'text-gray-500'}`}>
        {isRecording ? 'Release to send' : 'Hold to speak'}
      </span>
    </div>
  );
}
