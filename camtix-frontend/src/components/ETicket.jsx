import { Music, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function ETicket({ booking, event, user, qr, confirmed, ticketRef }) {
  const { t, i18n } = useTranslation();
  const amount = new Intl.NumberFormat(i18n.language.startsWith('en') ? 'en-US' : 'id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(booking.totalPrice || 0);
  return <article id="ticket-pdf-rendered-card" ref={ticketRef} className="e-ticket">
    <header className="e-ticket-header"><div><Music size={22} aria-hidden="true" /><strong>CAMTIX</strong></div><span>E-TICKET / #{booking.idBooking}</span></header>
    <div className="e-ticket-body">
      <div className="e-ticket-main">
        <p className="e-ticket-kicker">{event?.category || 'LIVE MUSIC'}</p>
        <h2>{event?.eventName || `${t('polish.concert')} #${booking.eventId}`}</h2>
        {event?.artistName && <p className="e-ticket-artist">{event.artistName}</p>}
        <dl className="e-ticket-details">
          <div><dt>{t('detail.eventDate')}</dt><dd>{event?.eventDate || '—'}{event?.eventTime && <small>{event.eventTime} WIB</small>}</dd></div>
          <div><dt>{t('detail.venue')}</dt><dd>{event?.location || '—'}{event?.city && <small>{event.city}</small>}</dd></div>
          <div><dt>{t('booking.fullName')}</dt><dd>{user?.fullName || '—'}</dd></div>
          <div><dt>{t('polish.ticketDetails')}</dt><dd>{booking.numberOfTicket} {t('booking.ticketsUnit')}<small>{t('booking.category')} #{booking.ticketId}</small></dd></div>
        </dl>
        <div className="e-ticket-total"><span>{t('booking.totalPrice')}</span><strong>{amount}</strong></div>
      </div>
      <aside className="e-ticket-stub">
        <span className="e-ticket-scan-label">{t('polish.entryPass')}</span>
        <div className="e-ticket-qr">{qr ? <img src={qr} alt={t('polish.entryQr')} width="180" height="180" /> : <span>{t('common.loading')}</span>}</div>
        <strong className="e-ticket-code">{booking.bookingCode || `CTX-${booking.idBooking}`}</strong>
        {confirmed && <span className="e-ticket-confirmed"><Check size={14} aria-hidden="true" />{t('polish.confirmed')}</span>}
      </aside>
    </div>
    <footer className="e-ticket-footer">{t('polish.qrPrivacy')}</footer>
  </article>;
}
