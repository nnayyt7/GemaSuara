import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import IconButton from '../components/IconButton';
import Button from '../components/Button';
import { avatarProfile, iconEdit } from '../assets';
import { useLanguage } from '../context/LanguageContext';

export default function Profile() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [confirming, setConfirming] = useState(false);
  return <motion.div className="page profile-page" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
    <section className="profile-hero">
      <div className="profile-actions"><IconButton aria-label="Kembali" onClick={() => navigate(-1)}>‹</IconButton><IconButton aria-label="Edit profil"><img src={iconEdit} alt="" /></IconButton></div>
      <img className="avatar" src={avatarProfile} alt="Avatar pengguna" /><strong>@loremipsum</strong>
    </section>
    <div className="profile-details">
      <section className="profile-group"><h2>{t.account}</h2><div className="profile-row"><span>{t.username}</span><b>@loremipsum</b></div><div className="profile-row"><span>{t.password}</span><b>••••••••••••</b></div></section>
      <section className="profile-group"><h2>{t.more}</h2><button className="profile-row language-link" onClick={() => navigate('/language')}><span>{t.language}</span><b>›</b></button></section>
      <AnimatePresence mode="wait">
        {!confirming ? <Button key="logout" variant="slate" className="logout-button" onClick={() => setConfirming(true)}>{t.logout}</Button> :
          <motion.div key="confirm" className="logout-confirm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><p>{t.logoutQuestion}</p><div><Button variant="slate" onClick={() => setConfirming(false)}>{t.cancel}</Button><Button variant="danger" onClick={() => setConfirming(false)}>{t.confirmLogout}</Button></div></motion.div>}
      </AnimatePresence>
    </div>
  </motion.div>;
}
