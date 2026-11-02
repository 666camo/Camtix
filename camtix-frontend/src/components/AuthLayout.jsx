import { useTranslation } from 'react-i18next';
import { Ticket } from 'lucide-react';

export default function AuthLayout({ children }) {
  const { i18n } = useTranslation();
  const english = i18n.language.startsWith('en');
  return (
    <main className="auth-page public-page">
      <div className="auth-layout">
        <aside className="auth-editorial">
          <p className="eyebrow">CAMTIX / BACKSTAGE</p>
          <p className="auth-poster-title">{english ? <>Good nights.<br />Great music.<br /><em>Your ticket.</em></> : <>Malam seru.<br />Musik bagus.<br /><em>Tiketmu.</em></>}</p>
          <div className="auth-pass"><Ticket size={28} aria-hidden="true" /><span>{english ? 'One account. Every live moment.' : 'Satu akun. Semua momen live.'}</span></div>
          <p>{english ? 'Keep your bookings and concert tickets together, ready for your next show.' : 'Simpan pesanan dan tiket konsermu di satu tempat, siap untuk panggung berikutnya.'}</p>
          <span className="auth-edition">LIVE LOUD TOGETHER. / CTX</span>
        </aside>
        <section className="auth-form-panel">{children}</section>
      </div>
    </main>
  );
}
