import CatalogState from '../components/CatalogState';
import EventPoster from '../components/EventPoster';
import PageHeading from '../components/PageHeading';
import { useCallback, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import eventService from '../services/eventService';
import { Search, MapPin } from 'lucide-react';
import Pagination from '../components/Pagination';

export default function SearchEvent() {
  const { t } = useTranslation();
  const [initialQuery] = useState(() => ({
    keyword: new URLSearchParams(window.location.search).get('keyword') || '',
    city: '',
    category: '',
    startDate: '',
    endDate: ''
  }));
  const [query, setQuery] = useState(initialQuery);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Sorting and pagination state
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(9);

  // Extract unique cities and categories for filters based on initial loaded events
  const [cities, setCities] = useState(['Jakarta', 'Bandung', 'Surabaya', 'Semarang', 'Tangerang', 'Bali']);
  const [categories, setCategories] = useState(['Pop/Rock', 'R&B/Pop', 'Country/Pop', 'K-Pop', 'Electronic', 'Jazz']);

  const fetchEvents = useCallback(async (values, isInitial = false) => {

    const params = {};
    if (values.keyword.trim() !== '') {
      params.eventName = values.keyword.trim();
      params.artistName = values.keyword.trim();
    }
    if (values.city !== '') {
      params.city = values.city;
    }
    if (values.category !== '') {
      params.category = values.category;
    }

    try {
      const response = await eventService.searchEvents(params);
      setError('');
      if (response && response.data) {
        let results = response.data;

        if (values.startDate) {
          const start = new Date(values.startDate);
          results = results.filter(evt => new Date(evt.eventDate) >= start);
        }
        if (values.endDate) {
          const end = new Date(values.endDate);
          end.setHours(23, 59, 59, 999);
          results = results.filter(evt => new Date(evt.eventDate) <= end);
        }

        setEvents(results);
        setPage(0);
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
  }, [t]);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- Starts an async server request; responses update state.
  useEffect(() => { fetchEvents(initialQuery, true); }, [fetchEvents, initialQuery]);

  const handleSearch = (event, isInitial = false, values = query) => {
    event?.preventDefault();
    setLoading(true);
    setError('');
    return fetchEvents(values, isInitial);
  };

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

  const resetFilters = () => {
    const cleared = { keyword: '', city: '', category: '', startDate: '', endDate: '' };
    setQuery(cleared);
    handleSearch(null, false, cleared);
  };

  const inputClass = "w-full bg-surface border border-border focus:border-brand rounded-xl px-4 py-3 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all";

  return (
    <div className="public-page searchevent-page gradient-bg min-h-screen text-fg pb-20 pt-28 px-6 md:px-12">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <PageHeading eyebrow={t('search.badge')} title={t('search.title')} accent={t('search.titleHighlight')} description={t('search.subtitle')} />
        {/* Filter Bar */}
        <div className="search-filters glass-effect p-6 border border-border">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand/10 rounded-full blur-2xl -z-10"></div>
          
          <form onSubmit={(event) => { handleSearch(event); if (window.matchMedia('(max-width: 767px)').matches) event.currentTarget.querySelector('details').open = false; }} className="search-form">
            <div className="search-primary">
            <div className="search-keyword">
              <label htmlFor="searchevent-field-1" className="block text-xs font-semibold text-fg-secondary uppercase tracking-wider mb-2">{t('search.keywordLabel')}</label>
              <input id="searchevent-field-1"
                type="text"
                name="keyword"
                value={query.keyword}
                onChange={handleChange}
                placeholder={t('search.placeholder')}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="searchevent-field-2" className="block text-xs font-semibold text-fg-secondary uppercase tracking-wider mb-2">{t('search.cityLabel')}</label>
              <select id="searchevent-field-2"
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
              <button type="submit" disabled={loading} className="search-submit">{loading ? t('search.searching') : t('home.searchAction')}<Search size={16} aria-hidden="true" /></button>
            </div>
            <details className="search-advanced">
              <summary>{t('polish.advancedFilters')}<span>{[query.category, query.startDate, query.endDate].filter(Boolean).length || '+'}</span></summary>
              <p>{t('polish.filterHint')}</p>
              <div className="search-advanced-fields">
            <div>
              <label htmlFor="searchevent-field-3" className="block text-xs font-semibold text-fg-secondary uppercase tracking-wider mb-2">{t('search.categoryLabel')}</label>
              <select id="searchevent-field-3"
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
              <label htmlFor="searchevent-field-4" className="block text-xs font-semibold text-fg-secondary uppercase tracking-wider mb-2">{t('search.startDate')}</label>
              <input id="searchevent-field-4"
                type="date"
                name="startDate"
                value={query.startDate}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="searchevent-field-5" className="block text-xs font-semibold text-fg-secondary uppercase tracking-wider mb-2">{t('search.endDate')}</label>
              <input id="searchevent-field-5"
                type="date"
                min={query.startDate || undefined}
                name="endDate"
                value={query.endDate}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
              </div>
              <div className="search-filter-actions"><button type="button" onClick={resetFilters}>{t('search.resetFilter')}</button><button type="submit" disabled={loading}>{t('search.applyFilter')}</button></div>
            </details>
          </form>
        </div>

        {/* Search Results Catalog */}
        <div>
          <div className="search-results-heading"><p aria-live="polite">{loading ? t('search.searching') : `${events.length} ${t('polish.results')}`}</p><div><label htmlFor="search-sort">{t('polish.searchResults')}</label><select id="search-sort" value={sortBy} onChange={(event) => { setSortBy(event.target.value); setPage(0); }}><option value="newest">{t('polish.sortNewest')}</option><option value="oldest">{t('polish.sortOldest')}</option><option value="date_soonest">{t('polish.sortSoonest')}</option><option value="az">A – Z</option><option value="za">Z – A</option></select></div></div>
          {loading ? (
            <CatalogState loading title={t('search.loading')} />
          ) : error ? (
            <CatalogState title={t('polish.catalogUnavailable')} description={t('polish.catalogRetry')} onRetry={() => handleSearch()} />
          ) : events.length === 0 ? (
            <CatalogState title={t('search.noResult')} description={t('polish.emptyHint')} onRetry={resetFilters} actionLabel={t('polish.clearSearch')} />
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {paginatedEvents.map((evt) => {
                  const expired = isEventExpired(evt);
                  const displayStatus = evt.status === 'CANCELLED' ? 'CANCELLED' : expired ? 'FINISHED' : (evt.status || 'UPCOMING');

                  return (
                    <div key={evt.idEvent} className="search-event-card flex flex-col group">
                      <div className="search-event-poster relative overflow-hidden bg-surface-hover">
                        <EventPoster src={evt.picture} title={evt.eventName} category={evt.category} />
                        <span className="absolute top-4 left-4 bg-surface/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-brand border border-border">
                          {evt.category || 'Event'}
                        </span>
                        <span className={`absolute top-4 right-4 bg-surface/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-extrabold border ${
                          displayStatus === 'UPCOMING' ? 'text-brand border-border' : 
                          displayStatus === 'ONGOING' ? 'text-emerald-600 border-emerald-200 animate-pulse' :
                          displayStatus === 'CANCELLED' ? 'text-red-600 border-red-200' :
                          'text-fg-secondary border-border'
                        }`}>
                          {displayStatus}
                        </span>
                      </div>
                      <div className="search-event-info flex-1 flex flex-col">
                        <span className="text-[10px] text-brand uppercase tracking-widest font-bold mb-1 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-brand" /> {evt.city} • {evt.location || t('home.location')}
                        </span>
                        <h3 className="text-lg font-bold text-fg group-hover:text-brand transition-colors mb-2 leading-snug">
                          {evt.eventName}
                        </h3>
                        <p className="text-xs text-fg-secondary mb-6 flex-1 line-clamp-2">
                          {evt.description || t('search.noDesc')}
                        </p>
                        
                        <div className="flex items-center justify-between border-t border-border pt-4 mt-auto">
                          <div>
                            <span className="text-[10px] text-fg-muted uppercase tracking-wider block">{t('search.date')}</span>
                            <span className="text-xs font-semibold text-fg-secondary">{evt.eventDate}</span>
                          </div>
                          <Link 
                            to={`/events/${evt.slug || evt.idEvent}`}
                            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all duration-300 cursor-pointer ${
                              expired
                                ? 'bg-surface-hover text-fg-secondary border-border hover:bg-surface-hover'
                                : 'bg-brand/10 hover:bg-brand hover:text-white text-brand border-border hover:border-blue-600'
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

              <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-sm">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  totalItems={sortedEvents.length}
                  pageSize={pageSize}
                  onPageChange={setPage}
                  onPageSizeChange={(size) => { setPageSize(size); setPage(0); }}
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
