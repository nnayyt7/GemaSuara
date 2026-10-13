import { Outlet } from 'react-router-dom';
import Logo from '../components/Logo';
import NavBar from '../components/NavBar';
import Button from '../components/Button';
import { useLanguage } from '../context/LanguageContext';

export default function AppLayout() {
  const { t } = useLanguage();
  return (
    <div className="app-shell">
      <aside className="desktop-sidebar"><Logo large /><NavBar sidebar /><Button variant="slate">{t.logout}</Button></aside>
      <main className="app-main"><Outlet /></main>
      <div className="mobile-nav-wrap"><NavBar /></div>
    </div>
  );
}
