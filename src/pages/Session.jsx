import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { iconMessage, iconMic } from '../assets';
import { keyPoints, streamingLines, transcriptSeed } from '../data/transcript';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useMediaQuery } from '../hooks/useMediaQuery';

export default function Session() {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const { showToast } = useToast();
  const [lines, setLines] = useState(transcriptSeed);
  const [openPoints, setOpenPoints] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [latency, setLatency] = useState(24);
  const [manualScroll, setManualScroll] = useState(false);
  const captionRef = useRef(null);
  const desktop = useMediaQuery('(min-width: 1024px)');

  const addMine = useCallback((text) => setLines((current) => [...current, { id: Date.now(), text: `Kamu: ${text}`, mine: true }]), []);
  const speech = useSpeechRecognition(language, { onResult: addMine, onError: () => showToast(t.microphoneDenied) });

  useEffect(() => {
    const latencyTimer = setInterval(() => setLatency(20 + Math.floor(Math.random() * 21)), 2400);
    const lineTimer = setInterval(() => setLines((current) => current.length >= 7 ? current : [...current, { id: Date.now(), text: streamingLines[current.length % streamingLines.length] }]), 6500);
    return () => { clearInterval(latencyTimer); clearInterval(lineTimer); };
  }, []);

  useEffect(() => {
    if (!manualScroll) captionRef.current?.scrollTo({ top: captionRef.current.scrollHeight, behavior: 'smooth' });
  }, [lines, manualScroll]);

  const toggleSpeak = () => {
    if (speech.listening) { speech.stop(); if (!speech.supported) addMine('Saya ingin bertanya tentang persetujuan sebelum wawancara.'); }
    else speech.start();
  };
  const submitMessage = () => {
    if (!message.trim()) return;
    addMine(message.trim()); setMessage(''); setMessageOpen(false); showToast(t.sent);
  };
  const handleScroll = (event) => {
    const el = event.currentTarget;
    setManualScroll(el.scrollHeight - el.scrollTop - el.clientHeight > 50);
  };

  return <motion.main className={`session-page ${speech.listening ? 'speaking' : ''}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
    <header className="session-header"><button aria-label="Kembali" onClick={() => navigate(-1)}>‹</button><div><small>SEDANG BERLANGSUNG</small><h1>NAMA MATKUL....</h1><span className="listening-pill"><i /> {t.listening}</span></div><em>{t.detail}: {latency} ms</em></header>
    <div className="session-grid">
      <section className="caption-column">
        <div className="caption-heading"><span>{t.liveCaption}</span><i /></div>
        <div className="caption-scroll" ref={captionRef} onScroll={handleScroll} aria-live="polite">
          {lines.map((line, index) => <motion.p key={line.id} className={`${line.mine ? 'mine' : ''} ${index === lines.length - 1 ? 'current' : ''}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: line.id === 4 ? .65 : 1, y: 0 }}>{line.text}</motion.p>)}
        </div>
        <AnimatePresence>{manualScroll && <motion.button className="scroll-down" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setManualScroll(false); captionRef.current?.scrollTo({ top: captionRef.current.scrollHeight, behavior: 'smooth' }); }}>{t.down} ↓</motion.button>}</AnimatePresence>
      </section>
      <section className={`key-points ${openPoints ? 'open' : ''}`}>
        <button className="key-heading" onClick={() => setOpenPoints((value) => !value)}><span><b>{t.keyPoints}</b><small>{t.keyHint}</small></span><i>⌃</i></button>
        <motion.div className="key-list" initial={false} animate={{ height: openPoints ? 'auto' : 0, opacity: openPoints ? 1 : 0 }}>
          {keyPoints.map((point, index) => <motion.p key={point} initial={{ opacity: 0, x: -8 }} animate={openPoints || desktop ? { opacity: 1, x: 0 } : { opacity: 0 }} transition={{ delay: index * 0.06 }}>• {point}</motion.p>)}
        </motion.div>
      </section>
      <div className="session-actions"><Button variant={speech.listening ? 'pressed' : 'primary'} onClick={toggleSpeak}>{speech.listening ? <><i className="record-dot" />{t.finishSpeak}</> : t.speak}</Button><Button variant="secondary" onClick={() => setMessageOpen(true)}><img src={iconMessage} alt="" />{t.typeMessage}</Button></div>
    </div>
    <AnimatePresence>{messageOpen && <Modal title={t.typeMessage} subtitle={t.messageSubtitle} onClose={() => setMessageOpen(false)}><textarea autoFocus value={message} onChange={(e) => setMessage(e.target.value)} placeholder={t.messagePlaceholder} /><div className="modal-actions"><Button variant="slate" onClick={() => setMessageOpen(false)}>{t.cancel}</Button><Button variant="primary" onClick={submitMessage}>{t.send}</Button></div></Modal>}</AnimatePresence>
  </motion.main>;
}
