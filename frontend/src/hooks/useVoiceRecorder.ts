import { useState, useRef, useCallback } from 'react';
import type { RecordingState } from '../types';

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    webkitSpeechRecognition: new () => SpeechRecognition;
    SpeechRecognition: new () => SpeechRecognition;
  }
}

interface UseVoiceRecorderReturn {
  state: RecordingState;
  transcript: string;
  interimTranscript: string;
  startRecording: () => void;
  stopRecording: () => void;
  isSupported: boolean;
}

export function useVoiceRecorder(language: string = 'zh-CN'): UseVoiceRecorderReturn {
  const [state, setState] = useState<RecordingState>('idle');
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
  const isSupported = !!SpeechRecognitionAPI;

  const startRecording = useCallback(() => {
    if (!SpeechRecognitionAPI) return;

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;

    let finalTranscript = '';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }
      setTranscript(finalTranscript);
      setInterimTranscript(interim);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setState('idle');
    };

    recognition.onend = () => {
      setState('idle');
    };

    recognitionRef.current = recognition;
    recognition.start();
    setState('recording');
    setTranscript('');
    setInterimTranscript('');
  }, [language, SpeechRecognitionAPI]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setState('idle');
    setInterimTranscript('');
  }, []);

  return {
    state,
    transcript,
    interimTranscript,
    startRecording,
    stopRecording,
    isSupported,
  };
}
