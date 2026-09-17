import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import userService from '../../services/userService';
import { Eye, EyeOff, RefreshCw, AlertTriangle } from 'lucide-react';
import Pagination from '../../components/Pagination';

export default function VisitorAdmin() {
  const { t, i18n } = useTranslation();
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const fetchVisitors = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await userService.getAllVisitors();
      if (res && res.data) {
        setVisitors(res.data);
      } else if (Array.isArray(res)) {
        setVisitors(res);
      } else {
        setVisitors([]);
      }
    } catch (err) {
      console.error(err);
      setError(t('admin.loadVisitorFail'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVisitors(); }, []);

  const formatDate = (isoString) => {
    if (!isoString) return '-';
    try {
      const date = new Date(isoString);
      const locale = i18n.language === 'en' ? 'en-US' : 'id-ID';
      const tzSuffix = i18n.language === 'en' ? ' WIB' : ' WIB';
      return date.toLocaleDateString(locale, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }) + tzSuffix;
    } catch {
      return isoString;
    }
  };

  const filtered = visitors.filter((v) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const activity = (v.activity || '').toLowerCase();
    const userId = v.userId != null ? String(v.userId) : (v.idUser != null ? String(v.idUser) : '');
    return activity.includes(q) || userId.includes(q);
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'newest') return (b.idVisitor || 0) - (a.idVisitor || 0);
    if (sortBy === 'oldest') return (a.idVisitor || 0) - (b.idVisitor || 0);
    if (sortBy === 'az') return (a.activity || '').localeCompare(b.activity || '');
    if (sortBy === 'za') return (b.activity || '').localeCompare(a.activity || '');
    return 0;
  });

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paginatedVisitors = sorted.slice(page * pageSize, (page + 1) * pageSize);

  useEffect(() => {
    setPage(0);
  }, [searchQuery, sortBy, pageSize]);

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
            <Eye className="w-6 h-6 text-slate-700" /> {t('admin.visitorLog')}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {visitors.length} {t('admin.visitorSubtitle')}
          </p>
        </div>
        <button
          onClick={fetchVisitors}
          className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" /> {t('common.refresh')}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 rounded-xl border border-red-200 bg-red-50 text-red-600 text-xs flex items-center gap-2 font-medium">
          <AlertTriangle className="w-4 h-4 text-red-500" /> {error}
          <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600 font-bold cursor-pointer">✕</button>
        </div>
      )}

      {/* Search & Sort */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('admin.searchVisitorPlaceholder')}
          className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 transition-colors shadow-sm"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-blue-400 transition-colors shadow-sm"
        >
          <option value="newest">Terbaru</option>
          <option value="oldest">Terlama</option>
          <option value="az">Aktivitas: A - Z</option>
          <option value="za">Aktivitas: Z - A</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm overflow-x-auto">
        <div className="grid grid-cols-[auto_2fr_1fr_auto] gap-4 px-5 py-3 border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold text-slate-500 uppercase tracking-widest min-w-[500px]">
          <span>No</span>
          <span>Aktivitas</span>
          <span>User</span>
          <span className="text-right">Waktu</span>
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <svg className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            <p className="text-sm text-slate-500 font-medium">{t('admin.loadingVisitors')}</p>
          </div>
        ) : sorted.length === 0 ? (
          <div className="py-16 text-center">
            <EyeOff className="w-10 h-10 mx-auto mb-3 text-slate-400 opacity-60" />
            <p className="text-sm font-bold text-slate-600">
              {searchQuery ? t('admin.noVisitorMatch') : t('admin.noVisitorYet')}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {paginatedVisitors.map((v, index) => (
              <div
                key={v.idVisitor || index}
                className="grid grid-cols-[auto_2fr_1fr_auto] gap-4 items-center px-5 py-4 hover:bg-slate-50 transition-colors min-w-[500px]"
              >
                {/* No */}
                <span className="text-xs font-bold text-slate-400">
                  {page * pageSize + index + 1}
                </span>

                {/* Activity */}
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">
                    {v.activity || t('admin.unknownActivity')}
                  </p>
                </div>

                {/* User */}
                <div>
                  {(v.userId || v.idUser) ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-xs font-extrabold">
                      User #{v.userId || v.idUser}
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-500 text-xs font-semibold italic">
                      Guest
                    </span>
                  )}
                </div>

                {/* Date */}
                <span className="text-xs font-semibold text-slate-500 text-right whitespace-nowrap">
                  {formatDate(v.visitDate || v.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={sorted.length}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[5, 10, 20, 50]}
        />
      </div>

      {/* Summary */}
      {!loading && sorted.length > 0 && (
        <p className="text-xs font-semibold text-slate-500 text-center">
          {t('admin.showingVisitors', { filtered: sorted.length, total: visitors.length })}
        </p>
      )}
    </div>
  );
}
