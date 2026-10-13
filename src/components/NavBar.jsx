import { motion, useReducedMotion } from 'framer-motion';
import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { iconClass, iconHome, iconProfile } from '../assets';
import { useLanguage } from '../context/LanguageContext';

const items = [
  { to: '/', key: 'home', icon: iconHome, end: true },
  { to: '/class', key: 'class', icon: iconClass },
  { to: '/profile', key: 'profile', icon: iconProfile },
];

export default function NavBar({ sidebar = false }) {
  const { t } = useLanguage();
  const { pathname } = useLocation();
  const [preview, setPreview] = useState(null);
  const reduced = useReducedMotion();
  const active = Math.max(0, items.findIndex((item) => item.end ? pathname === item.to : pathname.startsWith(item.to)));
  const selected = preview ?? active;
  return (
    <nav className={`gema-nav ${sidebar ? 'gema-nav-side' : 'gema-nav-bottom'}`} aria-label="Navigasi utama" onMouseLeave={() => setPreview(null)}>
      <motion.div className="gema-nav-marker" aria-hidden="true" initial={false}
        animate={sidebar ? { top: `${selected * 68}px` } : { left: `${(selected + .5) * 100 / 3}%` }}
        transition={{ duration: reduced ? 0 : .28, ease: [.22, 1, .36, 1] }}>
        {!sidebar && <svg className="gema-nav-cutout" viewBox="0 0 104 60"><path d="M0 23C14 23 20 56 52 56S90 23 104 23Z" /></svg>}
        <span className="gema-nav-disc"><img src={items[selected].icon} alt="" /></span>
      </motion.div>
      {items.map((item, index) => <NavLink key={item.to} to={item.to} end={item.end}
        aria-label={t[item.key]} onMouseEnter={(event) => { if (window.matchMedia('(hover: hover)').matches) setPreview(index); }}
        onFocus={() => setPreview(index)} onBlur={() => setPreview(null)} onClick={() => setPreview(null)}
        className={`gema-nav-link ${selected === index ? 'is-highlighted' : ''}`}>
          <img src={item.icon} alt="" /><span>{t[item.key]}</span>
      </NavLink>)}
    </nav>
  );
}
