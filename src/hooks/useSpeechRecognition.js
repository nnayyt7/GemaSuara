import { useEffect, useRef, useState } from 'react';

export function useSpeechRecognition(language, { onResult, onError }) {
  const [listening, setListening] = useState(false);
  const recognition = useRef(null);
  const [interim, setInterim] = useState('');
  const callbacks = useRef({ onResult, onError });
  callbacks.current = { onResult, onError };
  useEffect(() => () => {
    if (recognition.current) {
      recognition.current.onresult = null;
      recognition.current.onerror = null;
      recognition.current.onend = null;
      recognition.current.abort();
      recognition.current = null;
    }
  }, []);

  const start = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (recognition.current) return;
    if (!SpeechRecognition) { onError('unsupported'); return; }
    const instance = new SpeechRecognition();
    instance.lang = language === 'id' ? 'id-ID' : 'en-US';
    instance.continuous = true;
    instance.interimResults = true;
    instance.onstart = () => setListening(true);
    instance.onresult = (event) => {
      let draft = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript.trim();
        if (event.results[i].isFinal && text) callbacks.current.onResult(text);
        else draft += `${text} `;
      }
      setInterim(draft.trim());
    };
    instance.onerror = (event) => { if (event.error !== 'aborted') callbacks.current.onError(event.error); };
    instance.onend = () => { recognition.current = null; setListening(false); setInterim(''); };
    recognition.current = instance;
    try { instance.start(); } catch { recognition.current = null; onError('start'); }
  };

  const stop = () => {
    recognition.current?.stop();
    setListening(false);
  };
  return { listening, interim, start, stop, supported: Boolean(window.SpeechRecognition || window.webkitSpeechRecognition) };
}
