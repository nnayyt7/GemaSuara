import { motion } from 'framer-motion';

export default function IconButton({ children, className = '', ...props }) {
  return <motion.button whileTap={{ scale: 0.9 }} className={`icon-button ${className}`} {...props}>{children}</motion.button>;
}
