import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import IconButton from '../components/IconButton';
import Button from '../components/Button';
import { avatarProfile, iconEdit } from '../assets';
import { useLanguage } from '../context/LanguageContext';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';

export default function Profile() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { name, saveName, logout } = useUser();
  const { showToast } = useToast();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);
  const [confirming, setConfirming] = useState(false);
  return <motion.div className="page profile-page" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
    <section className="profile-hero">
      <div className="profile-actions"><IconButton aria-label="Kembali" onClick={() => navigate('/')}>‹</IconButton><IconButton aria-label="Edit profil" onClick={() => setEditing(true)}><img src={iconEdit} alt="" /></IconButton></div>
      <img className="avatar" src={avatarProfile} alt="Avatar pengguna" /><strong>{name}</strong>
    </section>
    <div className="profile-details">
      <section className="profile-group"><h2>{t.account}</h2><div className="profile-row"><span>{t.username}</span><b>{name}</b></div><div className="profile-row"><span>Jenis akun</span><b>Tamu · tanpa password</b></div></section>
      <section className="profile-group"><h2>{t.more}</h2><button className="profile-row language-link" onClick={() => navigate('/language')}><span>{t.language}</span><b>›</b></button></section>
      <AnimatePresence mode="wait">
        {!confirming ? <Button key="logout" variant="slate" className="logout-button" onClick={() => setConfirming(true)}>{t.logout}</Button> :
          <motion.div key="confirm" className="logout-confirm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><p>{t.logoutQuestion} Sesi tamu ini tidak dapat dipulihkan setelah keluar.</p><div><Button variant="slate" onClick={() => setConfirming(false)}>{t.cancel}</Button><Button variant="danger" onClick={async () => { try { await logout(); navigate('/'); } catch (error) { showToast(error.message); } }}>{t.confirmLogout}</Button></div></motion.div>}
      </AnimatePresence>
    </div>
    <AnimatePresence>{editing && <Modal title="Edit nama" subtitle="Nama tampil kepada peserta kelas." onClose={() => setEditing(false)}><form className="profile-edit" onSubmit={async (event) => { event.preventDefault(); try { await saveName(draft); setEditing(false); showToast('Nama diperbarui'); } catch (error) { showToast(error.message); } }}><input aria-label="Nama panggilan" required maxLength={40} value={draft} onChange={(event) => setDraft(event.target.value)} /><Button disabled={!draft.trim()}>Simpan</Button></form></Modal>}</AnimatePresence>
  </motion.div>;
}
