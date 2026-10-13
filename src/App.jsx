import { lazy, Suspense } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Route, Routes, useLocation } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import { UserProvider, useUser } from './context/UserContext';
import Welcome from './pages/Welcome';

const Home = lazy(() => import('./pages/Home'));
const Class = lazy(() => import('./pages/Class'));
const Profile = lazy(() => import('./pages/Profile'));
const Language = lazy(() => import('./pages/Language'));
const Session = lazy(() => import('./pages/Session'));

export default function App() {
  return <UserProvider><AppRoutes /></UserProvider>;
}
function AppRoutes() {
  const { name, loading } = useUser();
  const location = useLocation();
  if (loading) return <div className="loading">Menghubungkan GemaSuara…</div>;
  if (!name) return <Welcome />;
  return <Suspense fallback={<div className="loading">GemaSuara.</div>}><AnimatePresence mode="wait"><Routes location={location}>
    <Route element={<AppLayout />}><Route path="/" element={<Home />} /><Route path="/class" element={<Class />} /><Route path="/profile" element={<Profile />} /></Route>
    <Route path="/language" element={<Language />} /><Route path="/session/:id" element={<Session />} /><Route path="*" element={<Home />} />
  </Routes></AnimatePresence></Suspense>;
}
