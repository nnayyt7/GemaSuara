import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useUser } from '../context/UserContext';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { iconMessage } from '../assets';
import { streamingLines } from '../data/transcript';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useMediaQuery } from '../hooks/useMediaQuery';

export default function Session() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useUser();
  const isRoom = /^[a-f0-9]{36}$/.test(id);
  const [room, setRoom] = useState(null);
  const [connection, setConnection] = useState(isRoom ? 'Menghubungkan…' : 'Demo lokal');
  const [demo, setDemo] = useState(false);
  const [voiceMode, setVoiceMode] = useState('caption');
  const { language, t } = useLanguage();
  const { showToast } = useToast();
  const [lines, setLines] = useState([]);
  const [openPoints, setOpenPoints] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [manualScroll, setManualScroll] = useState(false);
  const captionRef = useRef(null);
  const desktop = useMediaQuery('(min-width: 1024px)');

  const addText = async (text, kind = 'message') => {
    if (isRoom) { await api(`/rooms/${id}/messages`, { text, kind }); }
    else setLines((current) => [...current, { id: crypto.randomUUID(), text: kind === 'message' ? `Kamu: ${text}` : text, mine: kind === 'message' }]);
  };
  const speech = useSpeechRecognition(language, { onResult: (text) => { addText(text, voiceMode).catch((error) => showToast(error.message)); }, onError: (error) => showToast(error === 'unsupported' ? 'Voice belum didukung browser ini. Gunakan Chrome/Edge, pesan teks, atau demo.' : error === 'not-allowed' ? 'Izinkan mikrofon di browser untuk memulai transkripsi.' : 'Suara belum dapat diproses. Periksa mikrofon dan koneksi, lalu coba lagi.') });

  useEffect(() => {
    if (!isRoom) return;
    let events;
    let disposed = false;
    const convert = (entry) => ({ ...entry, mine: entry.kind === 'message', text: entry.kind === 'message' ? `${entry.name}: ${entry.text}` : entry.text });
    api(`/rooms/${id}`).then((value) => {
      if (disposed) return;
      setRoom(value);
      events = new EventSource(`/api/rooms/${id}/events`);
      events.onopen = () => setConnection('Terhubung langsung');
      events.onerror = () => setConnection('Menghubungkan ulang…');
      events.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'history') setLines(data.messages.map(convert));
        else setLines((current) => current.some((line) => line.id === data.message.id) ? current : [...current, convert(data.message)]);
      };
    }).catch((error) => setConnection(error.message));
    return () => { disposed = true; events?.close(); };
  }, [id, isRoom]);

  useEffect(() => {
    if (!demo) return;
    let index = 0;
    const timer = setInterval(() => {
      const text = streamingLines[index++];
      if (!text) { setDemo(false); return; }
      setLines((current) => [...current, { id: crypto.randomUUID(), text }]);
    }, 2500);
    return () => clearInterval(timer);
  }, [demo]);

  useEffect(() => {
    if (!manualScroll) captionRef.current?.scrollTo({ top: captionRef.current.scrollHeight, behavior: 'smooth' });
  }, [lines, manualScroll, speech.interim]);

  const toggleSpeak = () => {
    if (speech.listening) speech.stop();
    else { setDemo(false); setVoiceMode('message'); speech.start(); }
  };
  const submitMessage = async () => {
    if (!message.trim()) return;
    try { await addText(message.trim()); setMessage(''); setMessageOpen(false); showToast(t.sent); } catch (error) { showToast(error.message); }
  };
  const handleScroll = (event) => {
    const el = event.currentTarget;
    setManualScroll(el.scrollHeight - el.scrollTop - el.clientHeight > 50);
  };

  return <motion.main className={`session-page ${speech.listening ? 'speaking' : ''}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
    <header className="session-header"><button aria-label="Kembali" onClick={() => navigate('/')}>‹</button><div><small>{isRoom ? `KODE KELAS · ${room?.code || '…'}` : 'SESI DEMO'}</small><h1>{room?.title || 'Caption kelas'}</h1><span className="listening-pill">{speech.listening && <i />} {speech.listening ? t.listening : 'Jeda'}</span></div><em>{connection}</em></header>
    <div className="voice-toolbar">{(!isRoom || room?.owner === user.id) && <Button variant="secondary" onClick={() => { if (speech.listening) speech.stop(); else { setDemo(false); setVoiceMode('caption'); speech.start(); } }}>{speech.listening ? 'Jeda mikrofon' : 'Mulai mendengarkan kelas'}</Button>}{!isRoom && <Button variant="secondary" onClick={() => { speech.stop(); setDemo(!demo); }}>{demo ? 'Hentikan demo' : 'Putar demo'}</Button>}<span>{isRoom ? 'Bagikan kode kelas agar peserta dapat bergabung.' : 'Demo terpisah dari transkripsi mikrofon.'}</span></div>
    <div className="session-grid">
      <section className="caption-column">
        <div className="caption-heading"><span>{t.liveCaption}</span><i /></div>
        <div className="caption-scroll" ref={captionRef} onScroll={handleScroll} aria-live="polite">
          {!lines.length && !speech.interim && <div className="caption-empty"><h2>Siap mengikuti kelas</h2><p>{isRoom && room?.owner !== user.id ? 'Caption muncul saat dosen mulai berbicara. Kamu juga bisa mengirim pertanyaan.' : 'Tekan mulai mendengarkan dan izinkan mikrofon. Letakkan perangkat dekat pembicara.'}</p></div>}
          {lines.map((line, index) => <motion.p key={line.id} className={`${line.mine ? 'mine' : ''} ${index === lines.length - 1 ? 'current' : ''}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: line.id === 4 ? .65 : 1, y: 0 }}>{line.text}</motion.p>)}
          {speech.interim && <p className="interim-caption">{speech.interim}…</p>}
        </div>
        <AnimatePresence>{manualScroll && <motion.button className="scroll-down" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setManualScroll(false); captionRef.current?.scrollTo({ top: captionRef.current.scrollHeight, behavior: 'smooth' }); }}>{t.down} ↓</motion.button>}</AnimatePresence>
      </section>
      <section className={`key-points ${openPoints ? 'open' : ''}`}>
        <button className="key-heading" onClick={() => setOpenPoints((value) => !value)}><span><b>{t.keyPoints}</b><small>{t.keyHint}</small></span><i>⌃</i></button>
        <motion.div className="key-list" initial={false} animate={{ height: openPoints ? 'auto' : 0, opacity: openPoints ? 1 : 0 }}>
          <p>Cuplikan terakhir dari pembicara; bukan ringkasan AI.</p>
          {lines.filter((line) => !line.mine).slice(-3).map((line, index) => <motion.p key={line.id} initial={{ opacity: 0, x: -8 }} animate={openPoints || desktop ? { opacity: 1, x: 0 } : { opacity: 0 }} transition={{ delay: index * 0.06 }}>• {line.text}</motion.p>)}
        </motion.div>
      </section>
      <div className="session-actions"><Button variant={speech.listening ? 'pressed' : 'primary'} onClick={toggleSpeak}>{speech.listening ? <><i className="record-dot" />{t.finishSpeak}</> : t.speak}</Button><Button variant="secondary" onClick={() => setMessageOpen(true)}><img src={iconMessage} alt="" />{t.typeMessage}</Button></div>
    </div>
    <AnimatePresence>{messageOpen && <Modal title={t.typeMessage} subtitle={t.messageSubtitle} onClose={() => setMessageOpen(false)}><textarea autoFocus value={message} onChange={(e) => setMessage(e.target.value)} placeholder={t.messagePlaceholder} /><div className="modal-actions"><Button variant="slate" onClick={() => setMessageOpen(false)}>{t.cancel}</Button><Button variant="primary" onClick={submitMessage}>{t.send}</Button></div></Modal>}</AnimatePresence>
  </motion.main>;
}
