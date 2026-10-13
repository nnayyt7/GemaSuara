import { useState } from 'react';
import { useUser } from '../context/UserContext';
import Logo from '../components/Logo';
import Button from '../components/Button';
export default function Welcome() {
  const [value, setValue] = useState('');
  const { saveName } = useUser();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (event) => { event.preventDefault(); setBusy(true); setError(''); try { await saveName(value); } catch (err) { setError(err.message); } finally { setBusy(false); } };
  return <main className="welcome-page"><section className="welcome-card"><Logo large /><h1>Selamat datang di <span>GemaSuara.</span></h1><p>Setiap suara berarti. Ikuti kelas melalui teks dan sampaikan pertanyaanmu dengan nyaman.</p><form onSubmit={submit}><label htmlFor="display-name">Siapa namamu?</label><input id="display-name" autoComplete="nickname" autoFocus maxLength={40} value={value} onChange={(event) => setValue(event.target.value)} placeholder="Nama panggilan" required /><small>Masuk sebagai tamu. Nama tampil kepada peserta kelas yang kamu ikuti.</small>{error && <p role="alert">{error}</p>}<Button type="submit" disabled={!value.trim() || busy}>{busy ? 'Menghubungkan…' : 'Lanjut'}</Button></form></section></main>;
}
