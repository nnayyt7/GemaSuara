import { Link } from 'react-router-dom';
import Logo from './Logo';
import { iconProfile } from '../assets';

export default function PageHeader() {
  return <header className="page-header"><Logo /><Link to="/profile" className="profile-link" aria-label="Buka profil"><img src={iconProfile} alt="" /></Link></header>;
}
