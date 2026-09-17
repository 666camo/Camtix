import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import eventService from '../services/eventService';
import { Info, Search, MapPin } from 'lucide-react';
import Pagination from '../components/Pagination';

export default function SearchEvent() {
  const { t } = useTranslation();
  const [query, setQuery] = useState({
    keyword: '',
    city: '',
    category: '',
    startDate: '',
    endDate: ''
  });
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Sorting and pagination state
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(9);

  // Extract unique cities and categories for filters based on initial loaded events
  const [cities, setCities] = useState(['Jakarta', 'Bandung', 'Surabaya', 'Semarang', 'Tangerang', 'Bali']);
  const [categories, setCategories] = useState(['Pop/Rock', 'R&B/Pop', 'Country/Pop', 'K-Pop', 'Electronic', 'Jazz']);

  const handleSearch = async (e, isInitial = false) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');

    const params = {};
    if (query.keyword.trim() !== '') {
      params.eventName = query.keyword.trim();
      params.artistName = query.keyword.trim();
    }
    if (query.city !== '') {
      params.city = query.city;
    }
    if (query.category !== '') {
      params.category = query.category;
    }

    try {
      const response = await eventService.searchEvents(params);
      if (response && response.data) {
        let results = response.data;

        if (query.startDate) {
          const start = new Date(query.startDate);
          results = results.filter(evt => new Date(evt.eventDate) >= start);
        }
        if (query.endDate) {
          const end = new Date(query.endDate);
          end.setHours(23, 59, 59, 999);
          results = results.filter(evt => new Date(evt.eventDate) <= end);
        }

        setEvents(results);
        if (isInitial) {
          const formatName = (str) => {
            if (!str) return '';
            return str.trim().split(/\s+/)
                      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
                      .join(' ');
          };
          const uniqueCities = [...new Set(response.data.map(e => formatName(e.city)).filter(Boolean))].sort();
          const uniqueCategories = [...new Set(response.data.map(e => formatName(e.category)).filter(Boolean))].sort();
          if (uniqueCities.length > 0) setCities(uniqueCities);
          if (uniqueCategories.length > 0) setCategories(uniqueCategories);
        }
      } else {
        setError(t('search.errorFormat'));
      }
    } catch (err) {
      console.error(err);
      setError(t('search.errorSearch'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch(null, true);
  }, []);

  const handleChange = (e) => {
    setQuery({
      ...query,
      [e.target.name]: e.target.value
    });
  };

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

  const sortedEvents = [...events].sort((a, b) => {
    if (sortBy === 'newest') return (b.idEvent || 0) - (a.idEvent || 0);
    if (sortBy === 'oldest') return (a.idEvent || 0) - (b.idEvent || 0);
    if (sortBy === 'az') return (a.eventName || '').localeCompare(b.eventName || '');
    if (sortBy === 'za') return (b.eventName || '').localeCompare(a.eventName || '');
    if (sortBy === 'date_soonest') {
      const dateA = new Date(a.eventDate || 0).getTime();
      const dateB = new Date(b.eventDate || 0).getTime();
      return dateA - dateB;
    }
    return 0;
  });

  const totalPages = Math.ceil(sortedEvents.length / pageSize);
  const paginatedEvents = sortedEvents.slice(page * pageSize, (page + 1) * pageSize);

  useEffect(() => {
    setPage(0);
  }, [sortBy, pageSize, events]);

  const inputClass = "w-full bg-slate-50 border border-slate-200 focus:border-blue-400 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all";

  return (
    <div className="gradient-bg min-h-screen text-slate-800 pb-20 pt-28 px-6 md:px-12">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Title */}
        <div className="text-center md:text-left">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            {t('search.badge')}
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight mt-2 text-slate-800">
            {t('search.title')} <span className="gradient-text">{t('search.titleHighlight')}</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {t('search.subtitle')}
          </p>
        </div>

        {/* Filter Bar */}
        <div className="glass-effect rounded-2xl p-6 border border-slate-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full blur-2xl -z-10"></div>
          
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t('search.keywordLabel')}</label>
              <input
                type="text"
                name="keyword"
                value={query.keyword}
                onChange={handleChange}
                placeholder={t('search.placeholder')}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t('search.cityLabel')}</label>
              <select
                name="city"
                value={query.city}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">{t('search.allCities')}</option>
                {cities.map((city, idx) => (
                  <option key={idx} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t('search.categoryLabel')}</label>
              <select
                name="category"
                value={query.category}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">{t('search.allCategories')}</option>
                {categories.map((cat, idx) => (
                  <option key={idx} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t('search.startDate')}</label>
              <input
                type="date"
                name="startDate"
                value={query.startDate}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t('search.endDate')}</label>
              <input
                type="date"
                name="endDate"
                value={query.endDate}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div className="md:col-span-6 flex flex-col sm:flex-row justify-between items-center gap-4 mt-2">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Urutkan:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="newest">Terbaru Ditambahkan</option>
                  <option value="oldest">Terlama Ditambahkan</option>
                  <option value="date_soonest">Tanggal Terdekat</option>
                  <option value="az">Nama Event: A - Z</option>
                  <option value="za">Nama Event: Z - A</option>
                </select>
              </div>

              <div className="flex gap-3 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setQuery({ keyword: '', city: '', category: '', startDate: '', endDate: '' });
                    setTimeout(() => handleSearch(), 100);
                  }}
                  className="px-6 py-3 bg-slate-50 rounded-xl text-sm font-semibold hover:bg-slate-100 border border-slate-200 text-slate-600 transition-colors cursor-pointer"
                >
                  {t('search.resetFilter')}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-500 text-white font-bold rounded-xl shadow-sm shadow-blue-500/20 hover:shadow-blue-500/30 active:scale-95 transition-all text-sm cursor-pointer flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                      <span>{t('search.searching')}</span>
                    </>
                  ) : (
                    <span>{t('search.applyFilter')}</span>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Results Info Alerts */}
        {error && (
          <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-600 text-sm flex items-center gap-2 animate-fadeIn">
            <Info className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Search Results Catalog */}
        <div>
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full border-4 border-blue-100 border-t-blue-500 animate-spin"></div>
              <p className="text-sm text-slate-500">{t('search.loading')}</p>
            </div>
          ) : events.length === 0 ? (
            <div className="glass-effect rounded-2xl py-20 text-center text-slate-500 border border-slate-200">
              <Search className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <p className="text-base font-bold text-slate-700">{t('search.noResult')}</p>
              <p className="text-xs text-slate-400 mt-1">{t('search.noResultSub')}</p>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {paginatedEvents.map((evt) => {
                  const expired = isEventExpired(evt);
                  const displayStatus = evt.status === 'CANCELLED' ? 'CANCELLED' : expired ? 'FINISHED' : (evt.status || 'UPCOMING');

                  return (
                    <div key={evt.idEvent} className="glass-effect rounded-2xl overflow-hidden hover:scale-[1.02] hover:shadow-xl transition-all duration-300 flex flex-col group border border-slate-200">
                      <div className="relative h-48 overflow-hidden bg-slate-100">
                        {evt.picture ? (
                          <img 
                            src={evt.picture} 
                            alt={evt.eventName} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold bg-slate-100">
                            {t('home.noImage')}
                          </div>
                        )}
                        <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-blue-600 border border-blue-200">
                          {evt.category || 'Event'}
                        </span>
                        <span className={`absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-extrabold border ${
                          displayStatus === 'UPCOMING' ? 'text-blue-600 border-blue-200' : 
                          displayStatus === 'ONGOING' ? 'text-emerald-600 border-emerald-200 animate-pulse' :
                          displayStatus === 'CANCELLED' ? 'text-red-600 border-red-200' :
                          'text-slate-500 border-slate-200'
                        }`}>
                          {displayStatus}
                        </span>
                      </div>
                      <div className="p-6 flex-1 flex flex-col">
                        <span className="text-[10px] text-blue-600 uppercase tracking-widest font-bold mb-1 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-blue-600" /> {evt.city} • {evt.location || t('home.location')}
                        </span>
                        <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors mb-2 leading-snug">
                          {evt.eventName}
                        </h3>
                        <p className="text-xs text-slate-500 mb-6 flex-1 line-clamp-2">
                          {evt.description || t('search.noDesc')}
                        </p>
                        
                        <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-auto">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">{t('search.date')}</span>
                            <span className="text-xs font-semibold text-slate-700">{evt.eventDate}</span>
                          </div>
                          <Link 
                            to={`/events/${evt.slug || evt.idEvent}`}
                            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all duration-300 cursor-pointer ${
                              expired
                                ? 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                                : 'bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 border-blue-200 hover:border-blue-600'
                            }`}
                          >
                            {expired ? (evt.status === 'CANCELLED' ? t('detail.eventCancelled') : t('detail.eventFinished')) : t('search.buyTicket')}
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  totalItems={sortedEvents.length}
                  pageSize={pageSize}
                  onPageChange={setPage}
                  onPageSizeChange={setPageSize}
                  pageSizeOptions={[6, 9, 18, 30]}
                />
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
