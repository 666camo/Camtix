import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import eventService from '../services/eventService';
import SplitText from '../components/SplitText';
import Magnet from '../components/Magnet';
import { 
  Sparkles, 
  Flame, 
  MapPin, 
  Search, 
  Calendar, 
  ShieldCheck, 
  Zap, 
  RefreshCw, 
  Music, 
  Ticket, 
  ArrowRight,
  TrendingUp,
  Star,
  CheckCircle2
} from 'lucide-react';

const POPULAR_GENRES = [
  { key: 'ALL', label: 'Semua Genre', icon: Music },
  { key: 'Pop/Rock', label: 'Pop / Rock', icon: Flame },
  { key: 'K-Pop', label: 'K-Pop', icon: Sparkles },
  { key: 'Electronic', label: 'Electronic / EDM', icon: Zap },
  { key: 'Jazz', label: 'Jazz & Soul', icon: Music },
  { key: 'Festival', label: 'Festival', icon: Ticket },
];

export default function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Interactive Quick Search & Filter states
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('ALL');

  const fetchEvents = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await eventService.getAllEvents();
      if (response && response.data) {
        setEvents(response.data);
      } else {
        setError(t('home.errorFormat'));
      }
    } catch (err) {
      console.error(err);
      setError(t('home.errorLoad'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

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

  const handleQuickSearchSubmit = (e) => {
    e.preventDefault();
    const query = searchKeyword.trim();
    if (query) {
      navigate(`/search?keyword=${encodeURIComponent(query)}`);
    } else {
      navigate('/search');
    }
  };

  // Filter events by selected Genre tab
  const filteredEvents = events.filter((ev) => {
    if (selectedGenre === 'ALL') return true;
    const cat = (ev.category || '').toLowerCase();
    const target = selectedGenre.toLowerCase();
    return cat.includes(target) || (target === 'pop/rock' && (cat.includes('pop') || cat.includes('rock')));
  });

  return (
    <div className="gradient-bg min-h-screen pb-24 pt-28 space-y-24">
      
      {/* ── HERO SECTION ── */}
      <header className="relative px-6 max-w-7xl mx-auto text-center">
        {/* Soft Ambient Mesh Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-blue-200/50 via-indigo-200/40 to-violet-200/30 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Glowing Top Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-indigo-100 shadow-sm shadow-indigo-100/50 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
              {t('home.badge')}
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 leading-[1.15]">
            <SplitText text={t('home.title1')} /> <br className="hidden sm:inline" />
            <span className="gradient-text"><SplitText text={t('home.title2')} /></span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
            {t('home.subtitle')}
          </p>

          {/* Floating Search Bar */}
          <div className="pt-4 max-w-2xl mx-auto">
            <form 
              onSubmit={handleQuickSearchSubmit}
              className="p-2 sm:p-2.5 bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-full border border-slate-200/90 shadow-xl shadow-indigo-950/5 flex flex-col sm:flex-row items-center gap-2 transition-all hover:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-100"
            >
              <div className="flex items-center gap-3 px-4 w-full flex-1">
                <Search className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder={t('home.quickSearchPlaceholder')}
                  className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none py-2"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-7 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl sm:rounded-full text-sm shadow-md shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{t('home.searchAction')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Genre Pills */}
          <div className="pt-3 flex flex-wrap items-center justify-center gap-2">
            {POPULAR_GENRES.map((genre) => {
              const Icon = genre.icon;
              const isSelected = selectedGenre === genre.key;
              return (
                <button
                  key={genre.key}
                  onClick={() => setSelectedGenre(genre.key)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10 scale-105'
                      : 'bg-white/80 hover:bg-white text-slate-600 border border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>{genre.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* ── STATS METRICS BAR ── */}
      <section className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {[
            { value: `${events.length > 0 ? events.length : '12'}+`, label: t('home.statsEvents'), icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50/80' },
            { value: '100K+', label: t('home.statsTickets'), icon: Ticket, color: 'text-indigo-600', bg: 'bg-indigo-50/80' },
            { value: '100%', label: t('home.statsSecurity'), icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50/80' },
            { value: '4.9/5', label: t('home.statsSatisfaction'), icon: Star, color: 'text-amber-500', bg: 'bg-amber-50/80' },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div 
                key={idx} 
                className="p-5 sm:p-6 bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-1"
              >
                <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center flex-shrink-0 shadow-inner`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                    {stat.value}
                  </div>
                  <div className="text-xs font-semibold text-slate-500 mt-0.5">
                    {stat.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── CONCERT CATALOG SECTION ── */}
      <section id="katalog" className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div className="text-left space-y-1">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-indigo-600">
              <TrendingUp className="w-4 h-4" />
              <span>Trending Now</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <Flame className="w-8 h-8 text-orange-500 fill-orange-500/20 flex-shrink-0" />
              {t('home.catalogTitle')}
            </h2>
            <p className="text-slate-500 text-sm font-normal">
              {t('home.catalogSubtitle')}
            </p>
          </div>

          <Link 
            to="/search" 
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 text-indigo-600 font-bold rounded-xl border border-slate-200 shadow-sm hover:border-indigo-200 transition-all text-xs self-start md:self-auto"
          >
            <span>{t('home.searchMore')}</span>
          </Link>
        </div>

        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
            <p className="text-sm font-semibold text-slate-500">{t('home.loading')}</p>
          </div>
        ) : error && events.length === 0 ? (
          <div className="p-6 rounded-2xl border border-red-200 bg-red-50/80 text-red-600 text-sm text-center">
            {error}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="py-16 text-center bg-white/60 backdrop-blur-sm rounded-3xl border border-slate-200 p-8 space-y-3">
            <Music className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-700">Tidak ada konser pada kategori ini</h3>
            <p className="text-xs text-slate-400">Pilih kategori lain atau cari menggunakan kata kunci.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((evt) => {
              const expired = isEventExpired(evt);
              const displayStatus = evt.status === 'CANCELLED' ? 'CANCELLED' : expired ? 'FINISHED' : (evt.status || 'UPCOMING');

              // Format month and day for the date block
              let dateMonth = 'EVT';
              let dateDay = '--';
              if (evt.eventDate) {
                try {
                  const d = new Date(evt.eventDate);
                  dateMonth = d.toLocaleDateString('id-ID', { month: 'short' }).toUpperCase();
                  dateDay = d.toLocaleDateString('id-ID', { day: '2-digit' });
                } catch {
                  // Fallback
                }
              }

              return (
                <div
                  key={evt.idEvent}
                  className="luxe-card luxe-card-interactive rounded-3xl overflow-hidden flex flex-col group h-full relative"
                >
                  {/* Poster Image & Badges */}
                  <div className="relative h-56 overflow-hidden bg-slate-100">
                    {evt.picture ? (
                      <img 
                        src={evt.picture} 
                        alt={evt.eventName} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 font-bold bg-slate-100 gap-2">
                        <Music className="w-8 h-8 opacity-40" />
                        <span className="text-[11px] uppercase tracking-wider">{t('home.noImage')}</span>
                      </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20" />

                    {/* Date Block Overlay (Top Left) */}
                    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md rounded-2xl px-3 py-1.5 text-center shadow-lg border border-white/60">
                      <span className="block text-[9px] font-black text-indigo-600 uppercase tracking-wider">
                        {dateMonth}
                      </span>
                      <span className="block text-base font-black text-slate-900 leading-none">
                        {dateDay}
                      </span>
                    </div>

                    {/* Category & Status Pill (Top Right) */}
                    <div className="absolute top-4 right-4 flex flex-col items-end gap-1.5">
                      <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-slate-800 border border-white/40 shadow-sm">
                        {evt.category || 'Concert'}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border uppercase shadow-sm ${
                        displayStatus === 'UPCOMING' ? 'bg-blue-600 text-white border-blue-500' : 
                        displayStatus === 'ONGOING' ? 'bg-emerald-600 text-white border-emerald-500 animate-pulse' :
                        displayStatus === 'CANCELLED' ? 'bg-red-600 text-white border-red-500' :
                        'bg-slate-700 text-slate-200 border-slate-600'
                      }`}>
                        {displayStatus}
                      </span>
                    </div>

                    {/* Bottom overlay info */}
                    <div className="absolute bottom-3 left-4 right-4 text-white">
                      <span className="text-xs font-semibold text-white/90 drop-shadow flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-400" />
                        <span>{evt.city || t('home.city')} • {evt.location || t('home.location')}</span>
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                        {evt.eventName}
                      </h3>
                      {evt.artistName && (
                        <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                          By {evt.artistName}
                        </p>
                      )}
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-normal">
                        {evt.description || t('home.noDesc')}
                      </p>
                    </div>

                    {/* Action & Price Footer */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                          {t('home.eventDateLabel')}
                        </span>
                        <span className="text-xs font-bold text-slate-700">
                          {evt.eventDate || '-'}
                        </span>
                      </div>

                      <Link 
                        to={`/events/${evt.slug || evt.idEvent}`}
                        className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-1.5 shadow-sm ${
                          expired
                            ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:scale-[1.02] active:scale-95'
                        }`}
                      >
                        <span>
                          {expired 
                            ? (evt.status === 'CANCELLED' ? t('detail.eventCancelled') : t('detail.eventFinished')) 
                            : t('home.buyTicket')}
                        </span>
                        {!expired && <ArrowRight className="w-3.5 h-3.5" />}
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── VALUE PROPOSITIONS (WHY CHOOSE CAMTIX) ── */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 sm:p-14 text-white shadow-2xl relative overflow-hidden">
          {/* Ambient Glows inside card */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto text-center space-y-3 mb-12">
            <span className="text-xs font-extrabold text-indigo-400 uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full border border-white/10">
              CamTix Guarantee
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
              {t('home.whyChooseTitle')}
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              {t('home.whyChooseSubtitle')}
            </p>
          </div>

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: t('home.feat1Title'),
                desc: t('home.feat1Desc'),
                icon: ShieldCheck,
                color: 'text-emerald-400',
                bg: 'bg-emerald-500/10 border-emerald-500/20'
              },
              {
                title: t('home.feat2Title'),
                desc: t('home.feat2Desc'),
                icon: Zap,
                color: 'text-amber-400',
                bg: 'bg-amber-500/10 border-amber-500/20'
              },
              {
                title: t('home.feat3Title'),
                desc: t('home.feat3Desc'),
                icon: RefreshCw,
                color: 'text-blue-400',
                bg: 'bg-blue-500/10 border-blue-500/20'
              },
            ].map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div 
                  key={idx}
                  className="p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 space-y-4 transition-all hover:bg-white/10"
                >
                  <div className={`w-12 h-12 rounded-2xl ${feat.bg} border ${feat.color} flex items-center justify-center`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-normal">
                    {feat.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

    </div>
  );
}
