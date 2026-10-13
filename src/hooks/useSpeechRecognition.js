import { useRef, useState } from 'react';

export function useSpeechRecognition(language, { onResult, onError }) {
  const [listening, setListening] = useState(false);
  const recognition = useRef(null);

  const start = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setListening(true);
    if (!SpeechRecognition) return;
    const instance = new SpeechRecognition();
    instance.lang = language === 'id' ? 'id-ID' : 'en-US';
    instance.interimResults = false;
    instance.onresult = (event) => onResult(event.results[0][0].transcript);
    instance.onerror = () => { onError(); setListening(false); };
    instance.onend = () => setListening(false);
    recognition.current = instance;
    instance.start();
  };

  const stop = () => {
    recognition.current?.stop();
    setListening(false);
  };
  return { listening, start, stop, supported: Boolean(window.SpeechRecognition || window.webkitSpeechRecognition) };
}
