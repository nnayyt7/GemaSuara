import { AnimatePresence, motion } from 'framer-motion';

export default function LanguageItem({ code, name, nativeName, active, onClick }) {
  return (
    <motion.button className={`language-item ${active ? 'active' : ''}`} onClick={onClick} whileTap={{ scale: 0.98 }}>
      <b>{code}</b><span><strong>{name}</strong><em>{nativeName}</em></span>
      <AnimatePresence>{active && <motion.i initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ type: 'spring' }}>✓</motion.i>}</AnimatePresence>
    </motion.button>
  );
}
