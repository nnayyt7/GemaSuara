import { motion } from 'framer-motion';

export default function Button({ variant = 'primary', className = '', children, ...props }) {
  return <motion.button whileTap={{ scale: 0.985 }} transition={{ duration: .15 }} className={`button button-${variant} ${className}`} {...props}>{children}</motion.button>;
}
