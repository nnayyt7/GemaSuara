import { useState } from 'react';
import { motion } from 'framer-motion';
import PageHeader from '../components/PageHeader';
import SearchBar from '../components/SearchBar';
import SectionTitle from '../components/SectionTitle';
import ClassCardLight from '../components/ClassCardLight';
import { classList } from '../data/classes';
import { iconAdd } from '../assets';
import { useLanguage } from '../context/LanguageContext';

export default function Class() {
  const [search, setSearch] = useState('');
  const { t } = useLanguage();
  const filtered = classList.filter((item) => item.title.toLowerCase().includes(search.toLowerCase()));
  return <motion.div className="page page-class" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
    <PageHeader /><SearchBar value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t.searchClass} />
    <SectionTitle action={<button className="add-button" aria-label="Tambah kelas"><img src={iconAdd} alt="" /></button>}>{t.yourClass}</SectionTitle>
    <div className="class-grid">{filtered.map((item, index) => <ClassCardLight key={item.id} item={item} index={index} />)}</div>
  </motion.div>;
}
