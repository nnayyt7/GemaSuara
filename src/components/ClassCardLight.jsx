import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { iconCalendar, iconProfile, patternBlob } from '../assets';
import { useLanguage } from '../context/LanguageContext';

export default function ClassCardLight({ item, index }) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  return (
    <motion.article className="class-card-light" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.07 }} whileHover={{ y: -3 }}>
      <img className="blob-pattern" src={patternBlob} alt="" />
      <div className="light-card-body">
        <strong>{item.title}</strong>
        <span><img src={iconProfile} alt="" />{item.lecturer}</span>
        <span><img className="calendar-icon" src={iconCalendar} alt="" />{item.note}</span>
        <button onClick={() => navigate(`/session/${item.id}`)}>{t.view}</button>
      </div>
    </motion.article>
  );
}
