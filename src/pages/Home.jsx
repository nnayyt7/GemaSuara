import { useState } from 'react';
import { motion } from 'framer-motion';
import PageHeader from '../components/PageHeader';
import SearchBar from '../components/SearchBar';
import SectionTitle from '../components/SectionTitle';
import ClassCardDark from '../components/ClassCardDark';
import { homeClasses } from '../data/classes';
import { useLanguage } from '../context/LanguageContext';

export default function Home() {
  const [search, setSearch] = useState('');
  const { t } = useLanguage();
  const filtered = homeClasses.filter((item) => item.title.toLowerCase().includes(search.toLowerCase()));
  return <motion.div className="page page-home" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
    <PageHeader />
    <section className="hero-copy"><h1>{t.greeting} <span>{t.name}</span></h1><p>{t.tagline}</p></section>
    <SearchBar value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t.searchHome} />
    <SectionTitle>{t.todayClass}</SectionTitle>
    <div className="home-class-grid">{filtered.map((item, index) => <ClassCardDark key={item.id} item={item} index={index} />)}</div>
  </motion.div>;
}
