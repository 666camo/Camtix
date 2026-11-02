import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, RefreshCw } from 'lucide-react';

export default function StatusPage({ code, title, description, retry = false }) {
  const { i18n } = useTranslation();
  const english = i18n.language.startsWith('en');
  return <main className="status-page public-page">
    <div className="status-number" aria-hidden="true">{code}</div>
    <div className="status-copy"><p className="eyebrow">CAMTIX / {english ? 'A short intermission' : 'Jeda sebentar'}</p>
      <h1>{title}</h1><p>{description}</p>
      <div className="status-actions">
        {retry && <button type="button" onClick={() => window.location.reload()}><RefreshCw size={16} />{english ? 'Try again' : 'Coba lagi'}</button>}
        <Link to={code === '401' ? '/login' : '/'}>{code === '401' ? (english ? 'Sign in' : 'Masuk ke akun') : (english ? 'Back to concerts' : 'Kembali ke konser')}<ArrowRight size={16} /></Link>
      </div>
    </div>
  </main>;
}
