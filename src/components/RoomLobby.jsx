import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import Button from './Button';

export default function RoomLobby() {
  const [rooms, setRooms] = useState([]);
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  useEffect(() => { api('/rooms').then(setRooms).catch((err) => setError(err.message)); }, []);
  const submit = async (event, join) => {
    event.preventDefault(); setBusy(true); setError('');
    try { const room = await api(join ? '/join' : '/rooms', join ? { code } : { title }); navigate(`/session/${room.id}`); }
    catch (err) { setError(err.message); } finally { setBusy(false); }
  };
  return <section className="room-lobby"><h2>Kelas bersama</h2><p>Buat kelas sebagai dosen, atau masukkan kode dari dosen untuk bergabung.</p><div className="room-forms">
    <form onSubmit={(e) => submit(e, false)}><label htmlFor="room-title">Nama kelas</label><input id="room-title" required maxLength={80} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Contoh: Fisika Dasar" /><Button disabled={busy || !title.trim()}>Buat kelas</Button></form>
    <form onSubmit={(e) => submit(e, true)}><label htmlFor="room-code">Kode kelas</label><input id="room-code" required maxLength={6} value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="6 karakter" /><Button variant="secondary" disabled={busy || code.trim().length !== 6}>Gabung kelas</Button></form>
    </div>{error && <p role="alert">{error}</p>}<div className="room-list">{rooms.map((room) => <Link key={room.id} to={`/session/${room.id}`}><strong>{room.title}</strong><span>Kode {room.code} · {room.members} peserta →</span></Link>)}</div></section>;
}
