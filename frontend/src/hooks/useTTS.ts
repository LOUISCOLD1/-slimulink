import { useState, useRef, useCallback } from 'react';
import { synthesizeSpeech } from '../services/api';

interface UseTTSReturn {
  isPlaying: boolean;
  isLoading: boolean;
  play: (text: string, language: string, voice?: string) => Promise<void>;
  stop: () => void;
}

export function useTTS(): UseTTSReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const play = useCallback(async (text: string, language: string, voice?: string) => {
    stop();

    if (!text.trim()) return;

    setIsLoading(true);
    try {
      const audioUrl = await synthesizeSpeech({ text, language, voice });
      urlRef.current = audioUrl;

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onplay = () => { setIsPlaying(true); setIsLoading(false); };
      audio.onended = () => { setIsPlaying(false); };
      audio.onerror = () => { setIsPlaying(false); setIsLoading(false); };

      await audio.play();
    } catch {
      setIsLoading(false);
      setIsPlaying(false);
    }
  }, [stop]);

  return { isPlaying, isLoading, play, stop };
}
