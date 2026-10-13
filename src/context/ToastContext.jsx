import { createContext, useContext, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [message, setMessage] = useState('');
  const showToast = (text) => {
    setMessage(text);
    window.clearTimeout(window.__gemaToast);
    window.__gemaToast = window.setTimeout(() => setMessage(''), 2500);
  };
  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <AnimatePresence>
        {message && <motion.div className="toast" role="status" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>{message}</motion.div>}
      </AnimatePresence>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
