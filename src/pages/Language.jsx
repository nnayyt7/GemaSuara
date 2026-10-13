import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import IconButton from '../components/IconButton';
import SearchBar from '../components/SearchBar';
import LanguageItem from '../components/LanguageItem';
import { iconGlobe } from '../assets';
import { useLanguage } from '../context/LanguageContext';
import { useState } from 'react';

export default function Language() {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const [search, setSearch] = useState('');
  const languages = language === 'id'
    ? [{ code: 'ID', key: 'id', name: 'Bahasa Indonesia', native: 'Indonesia' }, { code: 'EN', key: 'en', name: 'English', native: 'English' }]
    : [{ code: 'EN', key: 'en', name: 'English', native: 'English' }, { code: 'ID', key: 'id', name: 'Indonesia', native: 'Bahasa Indonesia' }];
  const filtered = languages.filter((item) => `${item.name} ${item.native}`.toLowerCase().includes(search.toLowerCase()));
  return <motion.main className="language-page" key={language} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
    <div className="language-card">
      <IconButton className="language-back" aria-label="Kembali" onClick={() => navigate(-1)}>‹</IconButton>
      <header className="language-header"><span><img src={iconGlobe} alt="" /></span><h1>{t.languageTitle}</h1><p>{t.languageSubtitle}</p></header>
      <SearchBar value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t.languageSearch} />
      <p className="language-label">{t.languageLabel}</p>
      <div className="language-list">{filtered.map((item) => <LanguageItem key={item.key} code={item.code} name={item.name} nativeName={item.native} active={language === item.key} onClick={() => setLanguage(item.key)} />)}</div>
    </div>
  </motion.main>;
}
