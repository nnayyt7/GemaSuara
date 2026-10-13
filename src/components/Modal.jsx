import { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Modal({ title, subtitle, children, onClose }) {
  useEffect(() => {
    const close = (event) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [onClose]);
  return (
    <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={onClose}>
      <motion.div role="dialog" aria-modal="true" aria-labelledby="modal-title" className="message-modal" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }} transition={{ type: 'spring', damping: 25 }} onMouseDown={(e) => e.stopPropagation()}>
        <div className="sheet-handle" /><h2 id="modal-title">{title}</h2><p>{subtitle}</p>{children}
      </motion.div>
    </motion.div>
  );
}
