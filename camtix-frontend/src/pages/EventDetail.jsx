import EventPoster from '../components/EventPoster';
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import eventService from '../services/eventService';
import { useAuth } from '../context/AuthContext';
import { Calendar, FileText, MapPin, Ticket, ShieldCheck, AlertCircle } from 'lucide-react';

export default function EventDetail() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { slug } = useParams();
  const [event, setEvent] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isEventExpired = (ev) => {
    if (!ev) return false;
    if (ev.status === 'FINISHED' || ev.status === 'CANCELLED') return true;
    if (!ev.eventDate) return false;
    
    const eventDateObj = new Date(ev.eventDate);
    if (ev.eventTime) {
      const [hours, minutes] = ev.eventTime.split(':').map(Number);
      if (!isNaN(hours) && !isNaN(minutes)) {
        eventDateObj.setHours(hours, minutes, 0, 0);
        return eventDateObj < new Date();
      }
    }
    eventDateObj.setHours(23, 59, 59, 999);
    return eventDateObj < new Date();
  };

  const isExpired = isEventExpired(event);

  const fetchDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const eventRes = await eventService.getEventBySlug(slug);
      if (eventRes && eventRes.data) {
        setEvent(eventRes.data);

        const ticketRes = await eventService.getTicketsByEventId(eventRes.data.idEvent);
        if (ticketRes && ticketRes.data) {
          setTickets(ticketRes.data);
        }
      }
    } catch (err) {
      console.error(err);
      setError(t('detail.errorLoad'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [slug]);

  const formatRupiah = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  if (loading) {
    return (
      <div className="public-page eventdetail-page gradient-bg min-h-screen text-fg flex items-center justify-center">
        <div className="detail-loading" role="status" aria-busy="true" aria-label={t('detail.loading')}><div aria-hidden="true" /><div aria-hidden="true"><span /><span /><span /></div><span className="sr-only">{t('detail.loading')}</span></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="public-page eventdetail-page gradient-bg min-h-screen text-fg flex items-center justify-center px-6">
        <div className="glass-effect rounded-2xl p-8 max-w-md w-full border border-border text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-brand mx-auto" aria-hidden="true" />
          <h2 className="text-xl font-bold text-red-600">{t('detail.errorTitle')}</h2>
          <p className="text-sm text-fg-secondary">{error || t('polish.catalogUnavailable')}</p>
          <button type="button" className="state-retry" onClick={fetchDetails}>{t('polish.tryAgain')}</button>
          <Link to="/" className="inline-block px-6 py-2.5 bg-brand hover:bg-brand-hover text-white rounded-xl text-sm font-bold transition-all">
            {t('detail.backCatalog')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="public-page eventdetail-page gradient-bg min-h-screen text-fg pb-20 pt-28 px-6 md:px-12">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Cover Hero Banner */}
        <div className="detail-cover">
          <EventPoster src={event?.picture} title={event?.eventName} category={event?.category} eager />
          <div className="detail-cover-shade"></div>
          
          <div className="detail-cover-copy">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full border border-white/30 bg-surface/20 text-xs font-semibold text-white backdrop-blur-md inline-block">
                  {event?.category}
                </span>
                {isExpired && (
                  <span className="px-3 py-1 rounded-full border border-red-400/50 bg-red-600/80 text-xs font-bold text-white backdrop-blur-md inline-block">
                    {event?.status === 'CANCELLED' ? t('detail.eventCancelled') : t('detail.eventFinished')}
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight text-white">
                {event?.eventName}
              </h1>
            </div>
            
            <div className="bg-surface/90 backdrop-blur-md border border-border px-5 py-3 rounded-2xl flex items-center gap-3">
              <Calendar className="w-5 h-5 text-brand" />
              <div className="text-left">
                <span className="text-[10px] text-fg-secondary uppercase tracking-widest block font-bold">{t('detail.eventDate')}</span>
                <span className="text-sm font-bold text-brand">{event?.eventDate} ({event?.eventTime || 'WIB'})</span>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-600 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500" /> {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Main description details */}
          <div className="lg:col-span-2 space-y-8">
             <div className="glass-effect rounded-2xl p-8 border border-border space-y-6">
              <h3 className="text-xl font-bold text-brand flex items-center gap-2">
                <FileText className="w-5 h-5 text-brand" /> {t('detail.aboutConcert')}
              </h3>
              <p className="text-sm text-fg-secondary leading-relaxed font-normal whitespace-pre-wrap">
                {event?.description}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-border">
                <div>
                  <span className="text-[10px] text-fg-muted uppercase tracking-wider font-bold block">{t('detail.mainArtist')}</span>
                  <span className="text-sm font-semibold text-fg">{event?.artistName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-fg-muted uppercase tracking-wider font-bold block">{t('detail.city')}</span>
                  <span className="text-sm font-semibold text-fg flex items-center gap-1 mt-1"><MapPin className="w-3.5 h-3.5 text-brand" /> {event?.city}</span>
                </div>
                <div>
                  <span className="text-[10px] text-fg-muted uppercase tracking-wider font-bold block">{t('detail.venue')}</span>
                  <span className="text-sm font-semibold text-fg flex items-center gap-1 mt-1"><MapPin className="w-3.5 h-3.5 text-brand" /> {event?.location}</span>
                </div>
              </div>
            </div>

            {/* Google Maps Location Embed */}
            {event && (
              <div className="glass-effect rounded-2xl p-6 border border-border space-y-4">
                <h3 className="text-lg font-bold text-fg flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-brand" /> {t('detail.mapTitle')}
                </h3>
                <div className="rounded-xl overflow-hidden border border-border h-[280px]">
                  <iframe
                    title="Event Location Map"
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    style={{ border: 0 }}
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(event.location + ", " + event.city)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            )}
          </div>

          {/* Ticket buying panel */}
          <div className="ticket-selection space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2 text-fg">
              <Ticket className="w-5 h-5 text-fg" /> {t('detail.selectTicket')}
            </h3>

            {isExpired && (
              <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p>{t('detail.eventPassedNotice')}</p>
              </div>
            )}
            
            <div className="space-y-4">
              {tickets.length === 0 ? (
                <div className="glass-effect rounded-2xl p-6 text-center text-fg-secondary border border-border">
                  {t('detail.noTickets')}
                </div>
              ) : (
                tickets.map((tItem) => {
                  const isOutOfStock = tItem.stock <= 0;
                  const isBlocked = isExpired || isOutOfStock;
                  return (
                    <div
                      key={tItem.idTicket}
                      className={`glass-effect rounded-2xl p-5 border ${
                        isBlocked ? 'border-border opacity-60 bg-surface' : 'border-border hover:border-border'
                      } transition-all relative overflow-hidden`}
                    >
                      {isExpired ? (
                        <div className="absolute top-3 right-3 bg-surface-hover border border-border text-fg-secondary font-bold px-2 py-0.5 rounded text-[9px] uppercase tracking-wider">
                          {event?.status === 'CANCELLED' ? t('detail.eventCancelled') : t('detail.eventFinished')}
                        </div>
                      ) : isOutOfStock && (
                        <div className="absolute top-3 right-3 bg-red-100 border border-red-200 text-red-600 font-bold px-2 py-0.5 rounded text-[9px] uppercase tracking-wider">
                          {t('detail.outOfStock')}
                        </div>
                      )}
                      
                      <h4 className="text-base font-extrabold text-fg">{tItem.ticketType}</h4>
                      <p className="text-xs text-fg-secondary mt-1 font-normal line-clamp-2">
                        {tItem.description || t('detail.defaultDesc')}
                      </p>
                      
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                        <div>
                          <span className="text-[10px] text-fg-muted block uppercase tracking-wider font-bold">{t('detail.pricePerTicket')}</span>
                          <span className="text-base font-extrabold text-brand">{formatRupiah(tItem.price)}</span>
                          <span className="text-[10px] text-fg-secondary block mt-0.5 font-medium">{t('detail.remainingStock')}: {tItem.stock}</span>
                        </div>
                        
                        {isExpired ? (
                          <button
                            disabled
                            className="px-4 py-2 bg-surface-hover text-fg-secondary text-xs font-bold rounded-xl cursor-not-allowed"
                          >
                            {event?.status === 'CANCELLED' ? t('detail.eventCancelled') : t('detail.eventFinished')}
                          </button>
                        ) : isOutOfStock ? (
                          <button
                            disabled
                            className="px-4 py-2 bg-surface-hover text-fg-secondary text-xs font-bold rounded-xl"
                          >
                            {t('detail.soldOut')}
                          </button>
                        ) : user && ['ADMIN_CAMTIX', 'ADMIN_APLIKASI'].includes(user.role) ? (
                          <button
                            disabled
                            title={t('detail.adminBlockedTooltip')}
                            className="px-5 py-2.5 bg-surface-hover text-fg-secondary text-xs font-bold rounded-xl cursor-not-allowed"
                          >
                            {t('detail.adminBlocked')}
                          </button>
                        ) : (
                          <Link
                            to={`/booking?eventId=${event?.idEvent}&ticketId=${tItem.idTicket}`}
                            className="px-5 py-2.5 bg-brand hover:bg-brand-hover text-xs font-bold rounded-xl shadow-sm shadow-card hover:shadow-card active:scale-95 transition-all text-white cursor-pointer"
                          >
                            {t('detail.bookTicket')}
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Safety tips */}
             <div className="bg-brand/10/50 rounded-2xl p-4 border border-border space-y-2">
              <span className="text-xs font-bold text-brand uppercase flex items-center gap-1.5 tracking-wider">
                <ShieldCheck className="w-4 h-4 text-brand" /> {t('detail.securityGuarantee')}
              </span>
              <p className="text-[10px] text-fg-secondary leading-relaxed font-normal">
                {t('detail.securityDesc')}
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
