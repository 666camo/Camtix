import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, useInView } from 'framer-motion';
import eventService from '../services/eventService';
import {
  Search,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Zap,
  RefreshCw,
  Music,
} from 'lucide-react';

const GENRES = [
  { key: 'ALL', label: 'Semua' },
  { key: 'Pop/Rock', label: 'Pop / Rock' },
  { key: 'K-Pop', label: 'K-Pop' },
  { key: 'Electronic', label: 'EDM' },
  { key: 'Jazz', label: 'Jazz' },
  { key: 'Festival', label: 'Festival' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: i * 0.08,
      ease: [0.25, 0.8, 0.25, 1],
    },
  }),
};

function Section({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.8, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

export default function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('ALL');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await eventService.getAllEvents();
        setEvents(res?.data || []);
      } catch {
        setError(t('home.errorLoad'));
      } finally {
        setLoading(false);
      }
    })();
  }, [t]);

  const isExpired = (ev) => {
    if (!ev) return false;
    if (ev.status === 'FINISHED' || ev.status === 'CANCELLED') return true;
    if (!ev.eventDate) return false;
    const d = new Date(ev.eventDate);
    if (ev.eventTime) {
      const [h, m] = ev.eventTime.split(':').map(Number);
      if (!isNaN(h) && !isNaN(m)) {
        d.setHours(h, m, 0, 0);
        return d < new Date();
      }
    }
    d.setHours(23, 59, 59, 999);
    return d < new Date();
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchKeyword.trim();
    navigate(q ? `/search?keyword=${encodeURIComponent(q)}` : '/search');
  };

  const filtered = events.filter((ev) => {
    if (selectedGenre === 'ALL') return true;
    const cat = (ev.category || '').toLowerCase();
    const tgt = selectedGenre.toLowerCase();
    return cat.includes(tgt) || (tgt === 'pop/rock' && (cat.includes('pop') || cat.includes('rock')));
  });

  const features = [
    { title: t('home.feat1Title'), desc: t('home.feat1Desc'), icon: ShieldCheck },
    { title: t('home.feat2Title'), desc: t('home.feat2Desc'), icon: Zap },
    { title: t('home.feat3Title'), desc: t('home.feat3Desc'), icon: RefreshCw },
  ];

  return (
    <div className="min-h-screen pb-24 pt-28 space-y-20">

      {/* ── HERO ── */}
      <header className="relative px-6 max-w-5xl mx-auto text-center">
        <motion.div
          initial="hidden"
          animate="visible"
          className="space-y-5"
        >
          <motion.h1
            variants={fadeUp}
            custom={0}
            className="text-4xl sm:text-5xl md:text-6xl font-display font-800 tracking-tight text-fg leading-[1.1]"
          >
            {t('home.title1')}{' '}
            <span className="gradient-text">{t('home.title2')}</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            custom={1}
            className="text-base sm:text-lg text-fg-secondary max-w-xl mx-auto leading-relaxed"
          >
            {t('home.subtitle')}
          </motion.p>

          <motion.form
            variants={fadeUp}
            custom={2}
            onSubmit={handleSearch}
            className="max-w-lg mx-auto p-1.5 bg-surface rounded-2xl sm:rounded-full border border-border shadow-card flex flex-col sm:flex-row items-center gap-1.5 transition-shadow focus-within:shadow-card-hover focus-within:ring-2 ring-ring"
          >
            <div className="flex items-center gap-3 px-4 w-full flex-1">
              <Search className="w-4 h-4 text-fg-muted flex-shrink-0" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder={t('home.quickSearchPlaceholder')}
                className="w-full bg-transparent text-sm text-fg placeholder:text-fg-muted focus:outline-none py-2"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 bg-brand hover:bg-brand-hover text-white font-600 rounded-xl sm:rounded-full text-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{t('home.searchAction')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </motion.form>

          <motion.div
            variants={fadeUp}
            custom={3}
            className="flex flex-wrap items-center justify-center gap-2 pt-1"
          >
            {GENRES.map((g) => (
              <button
                key={g.key}
                onClick={() => setSelectedGenre(g.key)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-600 transition-all cursor-pointer ${
                  selectedGenre === g.key
                    ? 'bg-fg text-[var(--bg)] shadow-sm'
                    : 'bg-surface text-fg-secondary border border-border hover:border-border-strong'
                }`}
              >
                {g.label}
              </button>
            ))}
          </motion.div>
        </motion.div>
      </header>

      {/* ── EVENT CATALOG ── */}
      <Section className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-3">
          <div>
            <h2 className="text-2xl sm:text-3xl font-display font-700 text-fg tracking-tight">
              {t('home.catalogTitle')}
            </h2>
            <p className="text-fg-secondary text-sm mt-1">{t('home.catalogSubtitle')}</p>
          </div>
          <Link
            to="/search"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-surface text-brand font-600 rounded-xl border border-border hover:border-border-strong transition-colors text-xs self-start md:self-auto"
          >
            {t('home.searchMore')}
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full border-3 border-border border-t-brand animate-spin" />
            <p className="text-sm font-500 text-fg-muted">{t('home.loading')}</p>
          </div>
        ) : error && events.length === 0 ? (
          <div className="p-5 rounded-2xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-sm text-center">
            {error}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-14 text-center bg-surface rounded-2xl border border-border p-8 space-y-2">
            <Music className="w-10 h-10 text-fg-muted mx-auto" />
            <h3 className="text-sm font-600 text-fg">Tidak ada konser pada kategori ini</h3>
            <p className="text-xs text-fg-muted">Pilih kategori lain atau cari menggunakan kata kunci.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((evt, i) => {
              const expired = isExpired(evt);
              const status = evt.status === 'CANCELLED' ? 'CANCELLED' : expired ? 'FINISHED' : (evt.status || 'UPCOMING');

              let month = '';
              let day = '--';
              if (evt.eventDate) {
                try {
                  const d = new Date(evt.eventDate);
                  month = d.toLocaleDateString('id-ID', { month: 'short' }).toUpperCase();
                  day = d.toLocaleDateString('id-ID', { day: '2-digit' });
                } catch { /* date parse fallback */ }
              }

              return (
                <motion.div
                  key={evt.idEvent}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-30px' }}
                  custom={i % 3}
                  className="group bg-surface rounded-2xl border border-border shadow-card hover:shadow-card-hover overflow-hidden flex flex-col transition-shadow duration-300"
                >
                  <div className="relative h-52 overflow-hidden bg-surface-hover">
                    {evt.picture ? (
                      <img
                        src={evt.picture}
                        alt={evt.eventName}
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-fg-muted gap-2">
                        <Music className="w-7 h-7 opacity-40" />
                        <span className="text-[10px] uppercase tracking-wider font-500">{t('home.noImage')}</span>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                    <div className="absolute top-3 left-3 bg-surface/90 backdrop-blur-sm rounded-xl px-2.5 py-1 text-center border border-border">
                      <span className="block text-[9px] font-700 text-brand uppercase tracking-wider">{month}</span>
                      <span className="block text-sm font-700 text-fg leading-none">{day}</span>
                    </div>

                    <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
                      <span className="bg-surface/90 backdrop-blur-sm px-2.5 py-0.5 rounded-lg text-[10px] font-600 text-fg border border-border">
                        {evt.category || 'Concert'}
                      </span>
                      <span className={`px-2 py-0.5 rounded-lg text-[9px] font-700 uppercase ${
                        status === 'UPCOMING' ? 'bg-brand/90 text-white' :
                        status === 'ONGOING' ? 'bg-emerald-500/90 text-white' :
                        status === 'CANCELLED' ? 'bg-red-500/90 text-white' :
                        'bg-fg-muted/80 text-white'
                      }`}>
                        {status}
                      </span>
                    </div>

                    <div className="absolute bottom-2.5 left-3 right-3">
                      <span className="text-xs font-500 text-white/90 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {evt.city || t('home.city')} · {evt.location || t('home.location')}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <h3 className="text-base font-700 text-fg group-hover:text-brand transition-colors leading-snug">
                        {evt.eventName}
                      </h3>
                      {evt.artistName && (
                        <p className="text-[11px] font-600 text-brand uppercase tracking-wide">
                          {evt.artistName}
                        </p>
                      )}
                      <p className="text-xs text-fg-secondary line-clamp-2 leading-relaxed">
                        {evt.description || t('home.noDesc')}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-border flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] text-fg-muted font-600 uppercase tracking-wide block">
                          {t('home.eventDateLabel')}
                        </span>
                        <span className="text-xs font-600 text-fg">{evt.eventDate || '-'}</span>
                      </div>
                      <Link
                        to={`/events/${evt.slug || evt.idEvent}`}
                        className={`px-4 py-2 rounded-xl text-xs font-600 transition-all duration-200 flex items-center gap-1.5 ${
                          expired
                            ? 'bg-surface-hover text-fg-muted border border-border cursor-not-allowed'
                            : 'bg-brand hover:bg-brand-hover text-white'
                        }`}
                      >
                        {expired
                          ? (evt.status === 'CANCELLED' ? t('detail.eventCancelled') : t('detail.eventFinished'))
                          : t('home.buyTicket')}
                        {!expired && <ArrowRight className="w-3 h-3" />}
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </Section>

      {/* ── WHY CHOOSE CAMTIX ── */}
      <Section className="max-w-5xl mx-auto px-6">
        <div className="bg-surface rounded-3xl border border-border shadow-card p-8 sm:p-12">
          <div className="text-center max-w-lg mx-auto space-y-2 mb-10">
            <h2 className="text-2xl sm:text-3xl font-display font-700 text-fg tracking-tight">
              {t('home.whyChooseTitle')}
            </h2>
            <p className="text-sm text-fg-secondary leading-relaxed">
              {t('home.whyChooseSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-30px' }}
                  custom={i}
                  className="p-6 rounded-2xl bg-brand-subtle border border-border space-y-3 transition-colors hover:bg-accent-subtle"
                >
                  <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-brand" />
                  </div>
                  <h3 className="text-base font-700 text-fg">{f.title}</h3>
                  <p className="text-xs text-fg-secondary leading-relaxed">{f.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </Section>

    </div>
  );
}
