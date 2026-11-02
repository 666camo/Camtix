import CatalogState from '../components/CatalogState';
import EventPoster from '../components/EventPoster';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import eventService from '../services/eventService';
import {
  ArrowRight,
  CalendarDays,
  MapPin,
  Music,
  RefreshCw,
  Search,
  ShieldCheck,
  Zap,
} from 'lucide-react';

const GENRES = [
  { key: 'ALL', label: 'Semua' },
  { key: 'Pop/Rock', label: 'Pop / Rock' },
  { key: 'K-Pop', label: 'K-Pop' },
  { key: 'Electronic', label: 'EDM' },
  { key: 'Jazz', label: 'Jazz' },
  { key: 'Festival', label: 'Festival' },
];

function Section({ children, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      ref={ref}
      initial={reduceMotion ? false : { opacity: 0, y: 20 }}
      animate={reduceMotion || inView ? { opacity: 1, y: 0 } : {}}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.45, ease: [0.25, 0.8, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

export default function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('ALL');

  const loadEvents = useCallback(async () => {
    try {
      const res = await eventService.getAllEvents();
      setEvents(res?.data || []);
      setError('');
    } catch {
      setError(t('home.errorLoad'));
    } finally { setLoading(false); }
  }, [t]);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- Starts an async server request; responses update state.
  useEffect(() => { loadEvents(); }, [loadEvents]);

  const isExpired = (event) => {
    if (!event) return false;
    if (event.status === 'FINISHED' || event.status === 'CANCELLED') return true;
    if (!event.eventDate) return false;

    const date = new Date(event.eventDate);
    if (event.eventTime) {
      const [hour, minute] = event.eventTime.split(':').map(Number);
      if (!Number.isNaN(hour) && !Number.isNaN(minute)) {
        date.setHours(hour, minute, 0, 0);
        return date < new Date();
      }
    }
    date.setHours(23, 59, 59, 999);
    return date < new Date();
  };

  const handleSearch = (event) => {
    event.preventDefault();
    const query = searchKeyword.trim();
    navigate(query ? `/search?keyword=${encodeURIComponent(query)}` : '/search');
  };

  const filteredEvents = events.filter((event) => {
    if (selectedGenre === 'ALL') return true;
    const category = (event.category || '').toLowerCase();
    const genre = selectedGenre.toLowerCase();
    return category.includes(genre) || (genre === 'pop/rock' && (category.includes('pop') || category.includes('rock')));
  });

  const features = [
    { title: t('home.feat1Title'), desc: t('home.feat1Desc'), icon: ShieldCheck },
    { title: t('home.feat2Title'), desc: t('home.feat2Desc'), icon: Zap },
    { title: t('home.feat3Title'), desc: t('home.feat3Desc'), icon: RefreshCw },
  ];

  return (
    <main className="home-page">
      <header className="home-hero">
        <div className="home-hero-inner">
          <motion.div
            className="home-hero-copy"
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.55 }}
          >
            <p className="eyebrow hero-eyebrow"><span />{t('home.badge')}</p>
            <h1>{t('home.title1')}<br /><span>{t('home.title2')}</span></h1>
            <p className="home-hero-subtitle">{t('home.subtitle')}</p>
            <Link to="/search" className="hero-link">
              {t('home.exploreCTA')} <ArrowRight aria-hidden="true" size={17} />
            </Link>
          </motion.div>

          <motion.div
            className="home-hero-art"
            aria-hidden="true"
            initial={reduceMotion ? false : { opacity: 0, x: 18, rotate: 1.5 }}
            animate={{ opacity: 1, x: 0, rotate: 0 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.7, delay: 0.1 }}
          >
            {events[0]?.picture && <img src={events[0].picture} alt="" onError={(event) => { event.currentTarget.hidden = true; }} />}
            <div className="hero-art-frame">
              <div className="hero-art-top"><span>CAMTIX / LIVE</span><Music size={17} /></div>
              <div className="hero-art-wordmark">LIVE<br /><em>LOUD</em><br />TOGETHER<span>.</span></div>
              <div className="hero-art-wave" />
              <div className="hero-art-bottom"><span>FIND YOUR NEXT SHOW</span><span>01 — CTX</span></div>
            </div>
          </motion.div>
        </div>
      </header>

      <section className="home-discovery" aria-label={t('home.searchAction')}>
        <form onSubmit={handleSearch} className="home-search">
          <Search size={18} aria-hidden="true" />
          <input
            type="search"
            value={searchKeyword}
            onChange={(event) => setSearchKeyword(event.target.value)}
            placeholder={t('home.quickSearchPlaceholder')}
            aria-label={t('home.quickSearchPlaceholder')}
          />
          <button type="submit">{t('home.searchAction')}<ArrowRight size={16} aria-hidden="true" /></button>
        </form>
        <div className="genre-filter" aria-label={t('home.allGenres')}>
          <span className="genre-label">{t('home.allGenres')}</span>
          {GENRES.map((genre) => (
            <button
              key={genre.key}
              type="button"
              aria-pressed={selectedGenre === genre.key}
              onClick={() => setSelectedGenre(genre.key)}
              className={selectedGenre === genre.key ? 'is-active' : ''}
            >
              {genre.label}
            </button>
          ))}
        </div>
      </section>

      <Section className="home-catalog">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{t('home.catalogKicker')}</p>
            <h2>{t('home.catalogTitle')}</h2>
            <p>{t('home.catalogSubtitle')}</p>
          </div>
          <Link to="/search" className="text-link">{t('home.searchMore')}<ArrowRight size={16} /></Link>
        </div>

        {loading ? (
          <CatalogState loading title={t('home.loading')} />
        ) : error && events.length === 0 ? (
          <CatalogState title={t('polish.catalogUnavailable')} description={t('polish.catalogRetry')} onRetry={() => { setLoading(true); loadEvents(); }} />
        ) : filteredEvents.length === 0 ? (
          <CatalogState title={t('home.emptyTitle')} description={t('home.emptyDescription')} onRetry={events.length ? () => setSelectedGenre('ALL') : undefined} actionLabel={t('polish.resetGenres')} />
        ) : (
          <div className="event-grid">
            {filteredEvents.map((event) => {
              const expired = isExpired(event);
              const status = event.status === 'CANCELLED' ? 'CANCELLED' : expired ? 'FINISHED' : (event.status || 'UPCOMING');
              let month = '';
              let day = '--';
              if (event.eventDate) {
                try {
                  const date = new Date(event.eventDate);
                  month = date.toLocaleDateString('id-ID', { month: 'short' }).toUpperCase();
                  day = date.toLocaleDateString('id-ID', { day: '2-digit' });
                } catch { /* Keep the fallback date label. */ }
              }

              return (
                <article key={event.idEvent} className="event-card">
                  <Link to={`/events/${event.slug || event.idEvent}`} className="event-poster" aria-label={`${event.eventName} — ${t('home.buyTicket')}`}>
                    <EventPoster src={event.picture} title={event.eventName} category={event.category} />
                    <span className="poster-date"><strong>{day}</strong><small>{month}</small></span>
                    <span className={`event-status status-${status.toLowerCase()}`}>{status}</span>
                    <span className="poster-arrow"><ArrowRight size={18} /></span>
                  </Link>
                  <div className="event-card-info">
                    <div>
                      <p className="event-category">{event.category || 'LIVE EVENT'}</p>
                      <h3><Link to={`/events/${event.slug || event.idEvent}`}>{event.eventName}</Link></h3>
                      {event.artistName && <p className="event-artist">{event.artistName}</p>}
                    </div>
                    <div className="event-meta">
                      <span><MapPin size={14} />{event.city || t('home.city')}{event.location ? ` · ${event.location}` : ''}</span>
                      <span><CalendarDays size={14} />{event.eventDate || t('home.eventDateLabel')}</span>
                    </div>
                    <Link
                      to={`/events/${event.slug || event.idEvent}`}
                      className={`event-buy-link ${expired ? 'is-expired' : ''}`}
                      aria-disabled={expired}
                      onClick={(clickEvent) => expired && clickEvent.preventDefault()}
                    >
                      {expired
                        ? (event.status === 'CANCELLED' ? t('detail.eventCancelled') : t('detail.eventFinished'))
                        : t('home.buyTicket')}
                      {!expired && <ArrowRight size={15} />}
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </Section>

      <Section className="home-trust">
        <div className="trust-heading">
          <p className="eyebrow">{t('home.trustKicker')}</p>
          <h2>{t('home.whyChooseTitle')}</h2>
          <p>{t('home.whyChooseSubtitle')}</p>
        </div>
        <div className="trust-list">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <article key={feature.title} className="trust-item">
                <span className="trust-index">0{index + 1}</span>
                <Icon size={21} aria-hidden="true" />
                <div><h3>{feature.title}</h3><p>{feature.desc}</p></div>
                <ArrowRight className="trust-arrow" size={17} aria-hidden="true" />
              </article>
            );
          })}
        </div>
      </Section>
    </main>
  );
}
