export default function Logo({ large = false }) {
  return <div className={`logo ${large ? 'logo-large' : ''}`} aria-label="GemaSuara"><span>Gema</span><strong>Suara.</strong></div>;
}
