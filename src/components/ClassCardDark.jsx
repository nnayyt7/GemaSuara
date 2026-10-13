import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function ClassCardDark({ item, index }) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  return (
    <motion.button className={`class-card-dark ${item.live ? 'is-live' : ''}`} onClick={() => navigate(`/session/${item.id}`)}
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.07 }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <span className="card-accent" />
      <span className="card-copy"><strong>{item.title}</strong><small className="lecturer-name">Nama Dosen</small>{item.live ? <em>{t.ongoing}</em> : <small>{item.time} · {item.room}</small>}</span>
      {item.live ? <span className="live-badge"><i /> {t.live}</span> : <span className="chevron">›</span>}
    </motion.button>
  );
}
