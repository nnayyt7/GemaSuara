import { Link } from 'react-router-dom';

export default function Logo({ large = false }) {
  return <Link to="/" className={`logo ${large ? 'logo-large' : ''}`} aria-label="GemaSuara — Home"><span>Gema</span><strong>Suara.</strong></Link>;
}
