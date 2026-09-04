import React, { useState, useEffect, useRef } from 'react';
import eventService from '../../services/eventService';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Calendar, Plus, AlertCircle, Trash2, Edit, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

// ── Constants ──────────────────────────────────────────────────────
const STATUS_OPTIONS = ['UPCOMING', 'ONGOING', 'FINISHED', 'CANCELLED'];
const CATEGORY_OPTIONS = ['Konser', 'Festival', 'Stand-Up Comedy', 'Olahraga', 'Seni & Budaya', 'Seminar', 'Lainnya'];

const EMPTY_FORM = {
  eventName: '',
  artistName: '',
  city: '',
  location: '',
  eventDate: '',
  eventTime: '',
  category: '',
  description: '',
  picture: '',
  status: 'UPCOMING',
};

// ── Helpers ────────────────────────────────────────────────────────
function statusBadge(status) {
  const map = {
    UPCOMING:  'text-blue-600 bg-blue-50 border-blue-200',
    ONGOING:   'text-emerald-600 bg-emerald-50 border-emerald-200 animate-pulse',
    FINISHED:  'text-slate-600 bg-slate-100 border-slate-300',
    CANCELLED: 'text-red-600 bg-red-50 border-red-200',
  };
  return map[status] || 'text-slate-500 bg-slate-100 border-slate-200';
}

// ── Modal Component ────────────────────────────────────────────────
function EventModal({ open, mode, form, setForm, onSubmit, onClose, loading, serverError }) {
  const { t } = useTranslation();
  const firstInputRef = useRef(null);

  useEffect(() => {
    if (open && firstInputRef.current) firstInputRef.current.focus();
  }, [open]);

  if (!open) return null;

  const handle = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('admin.uploadMaxSize'));
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({ ...prev, picture: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const isEdit = mode === 'edit';
  const inputClass = "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl shadow-slate-200/50">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            {isEdit ? <Edit className="w-5 h-5 text-blue-600" /> : <Sparkles className="w-5 h-5 text-blue-600" />}
            {isEdit ? t('admin.editEvent') : t('admin.createEvent')}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          {serverError && (
            <div className="p-3 rounded-xl border border-red-200 bg-red-50 text-red-600 text-xs font-medium flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="flex-1">{serverError}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Event Name */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">{t('admin.eventName')} <span className="text-red-500">*</span></label>
              <input
                ref={firstInputRef}
                name="eventName"
                value={form.eventName}
                onChange={handle}
                placeholder="Contoh: Coldplay: Music of the Spheres"
                className={inputClass}
              />
            </div>

            {/* Artist Name */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">{t('admin.artistName')}</label>
              <input
                name="artistName"
                value={form.artistName}
                onChange={handle}
                placeholder="Contoh: Coldplay"
                className={inputClass}
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">{t('admin.category')}</label>
              <select
                name="category"
                value={form.category}
                onChange={handle}
                className={inputClass}
              >
                <option value="">{t('admin.selectCategory')}</option>
                {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* City */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">{t('admin.city')} <span className="text-red-500">*</span></label>
              <input
                name="city"
                value={form.city}
                onChange={handle}
                placeholder="Contoh: Jakarta"
                className={inputClass}
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">{t('admin.locationVenue')}</label>
              <input
                name="location"
                value={form.location}
                onChange={handle}
                placeholder="Contoh: Gelora Bung Karno"
                className={inputClass}
              />
            </div>

            {/* Event Date */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">{t('admin.eventDate')} <span className="text-red-500">*</span></label>
              <input
                type="date"
                name="eventDate"
                value={form.eventDate}
                onChange={handle}
                className={inputClass}
              />
            </div>

            {/* Event Time */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">{t('admin.eventTime')}</label>
              <input
                type="time"
                name="eventTime"
                value={form.eventTime}
                onChange={handle}
                className={inputClass}
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">{t('admin.status')}</label>
              <select
                name="status"
                value={form.status}
                onChange={handle}
                className={inputClass}
              >
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Picture Upload */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">{t('admin.uploadPoster')} <span className="text-[9px] text-slate-400 font-normal lowercase">(Max 5MB)</span></label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-400 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none transition-colors file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              />
              {form.picture && (
                <div className="mt-3 rounded-xl overflow-hidden border border-slate-200 h-32 bg-slate-100 flex items-center justify-center">
                  <img src={form.picture} alt="Preview" className="h-full w-auto object-contain" onError={(e) => { e.target.style.display='none'; }} />
                </div>
              )}
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">{t('admin.description')}</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handle}
                rows={4}
                placeholder="Deskripsi lengkap event..."
                className={`${inputClass} resize-none`}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer bg-white"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={onSubmit}
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-500 text-sm font-bold text-white transition-colors cursor-pointer flex items-center gap-2 shadow-sm"
          >
            {loading && (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            )}
            {isEdit ? t('admin.saveChanges') : t('admin.createEventBtn')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Delete Confirm Modal ───────────────────────────────────────────
function ConfirmDeleteModal({ open, onConfirm, onCancel, loading, eventName }) {
  const { t } = useTranslation();
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)' }}
    >
      <div className="bg-white border border-red-200 rounded-2xl w-full max-w-sm p-6 text-center shadow-xl">
        <Trash2 className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-800 mb-2">{t('admin.deleteEventTitle')}</h3>
        <p className="text-sm text-slate-500 mb-6">
          {t('admin.deleteEventConfirm', { name: eventName })}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-slate-300 disabled:text-slate-500 text-sm font-bold text-white transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
          >
            {loading && <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>}
            {t('admin.yesDelete')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────
export default function EventAdmin() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isOperationalAdmin = user?.role === 'ADMIN_CAMTIX';

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [pageError, setPageError] = useState('');

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [serverError, setServerError] = useState('');

  // Delete confirm
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null, name: '' });

  // Search / filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // ── Fetch all events ─────────────────────────────────────────────
  const fetchEvents = async () => {
    setLoading(true);
    setPageError('');
    try {
      const res = await eventService.getAllEvents();
      const list = Array.isArray(res) ? res : (res?.data ?? []);
      setEvents(list);
    } catch (err) {
      setPageError(t('admin.loadEventsFail'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  // ── Open modals ──────────────────────────────────────────────────
  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setServerError('');
    setModalMode('create');
    setModalOpen(true);
  };

  const openEdit = (event) => {
    setForm({
      eventName:   event.eventName   || '',
      artistName:  event.artistName  || '',
      city:        event.city        || '',
      location:    event.location    || '',
      eventDate:   event.eventDate   || '',
      eventTime:   event.eventTime   || '',
      category:    event.category    || '',
      description: event.description || '',
      picture:     event.picture     || '',
      status:      event.status      || 'UPCOMING',
    });
    setEditId(event.idEvent);
    setServerError('');
    setModalMode('edit');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setServerError('');
  };

  // ── Submit create / edit ─────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.eventName.trim()) { setServerError(t('admin.nameRequired')); return; }
    if (!form.city.trim())       { setServerError(t('admin.cityRequired')); return; }
    if (!form.eventDate)         { setServerError(t('admin.dateRequired')); return; }

    setActionLoading(true);
    setServerError('');
    try {
      const payload = { ...form };
      if (modalMode === 'create') {
        await eventService.createEvent(payload);
        toast.success(t('admin.eventCreateSuccess'));
      } else {
        await eventService.updateEvent(editId, payload);
        toast.success(t('admin.eventUpdateSuccess'));
      }
      closeModal();
      await fetchEvents();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data || t('common.error');
      setServerError(typeof msg === 'object' ? JSON.stringify(msg) : String(msg));
      toast.error(typeof msg === 'object' ? JSON.stringify(msg) : String(msg));
    } finally {
      setActionLoading(false);
    }
  };

  // ── Delete ───────────────────────────────────────────────────────
  const confirmDelete = (event) => {
    setDeleteModal({ open: true, id: event.idEvent, name: event.eventName });
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await eventService.deleteEvent(deleteModal.id);
      setDeleteModal({ open: false, id: null, name: '' });
      toast.success(t('admin.eventDeleteSuccess'));
      await fetchEvents();
    } catch (err) {
      setPageError(t('admin.deleteEventFail'));
      toast.error(t('admin.deleteEventFail'));
    } finally {
      setActionLoading(false);
    }
  };

  // ── Filter events client-side ────────────────────────────────────
  const filtered = events.filter((e) => {
    const q = searchQuery.toLowerCase();
    const matchQ = !q || [e.eventName, e.artistName, e.city, e.category].some(
      (v) => v && v.toLowerCase().includes(q)
    );
    const matchS = !filterStatus || e.status === filterStatus;
    return matchQ && matchS;
  });

  // ── Render ───────────────────────────────────────────────────────
  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-600" /> {t('admin.eventManagement')}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {events.length} {t('admin.eventsRegistered')}
          </p>
        </div>
        {isOperationalAdmin && (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-sm font-bold text-white rounded-xl transition-all shadow-sm cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" /> {t('admin.addEvent')}
          </button>
        )}
      </div>

      {/* Error banner */}
      {pageError && (
        <div className="p-3 rounded-xl border border-red-200 bg-red-50 text-red-600 text-xs flex items-center gap-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="flex-1">{pageError}</p>
          <button onClick={() => setPageError('')} className="ml-auto text-red-400 hover:text-red-600 font-bold cursor-pointer">✕</button>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('admin.searchEventPlaceholder')}
          className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 transition-colors shadow-sm"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-blue-400 transition-colors shadow-sm"
        >
          <option value="">{t('admin.allStatus')}</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button
          onClick={fetchEvents}
          className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 transition-colors cursor-pointer flex items-center gap-2 shadow-sm"
        >
          <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {t('common.refresh')}
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm overflow-x-auto">
        {/* Table Header */}
        <div className={`grid ${isOperationalAdmin ? 'grid-cols-[1fr_auto_auto_auto_auto]' : 'grid-cols-[1fr_auto_auto_auto]'} gap-4 px-5 py-3 border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold text-slate-500 uppercase tracking-widest min-w-[600px]`}>
          <span>Event</span>
          <span className="text-center">{t('detail.eventDate')}</span>
          <span className="text-center">{t('admin.category')}</span>
          <span className="text-center">{t('admin.status')}</span>
          {isOperationalAdmin && <span className="text-center">{t('history.action')}</span>}
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <svg className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            <p className="text-sm text-slate-500 font-medium">{t('admin.loadingEvents')}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center animate-fadeIn">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-600">
              {searchQuery || filterStatus ? t('admin.noEventsMatch') : t('admin.noEventsYet')}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((ev) => (
              <div
                key={ev.idEvent}
                className={`grid ${isOperationalAdmin ? 'grid-cols-[1fr_auto_auto_auto_auto]' : 'grid-cols-[1fr_auto_auto_auto]'} gap-4 items-center px-5 py-4 hover:bg-slate-50 transition-colors min-w-[600px]`}
              >
                {/* Event info */}
                <div className="flex items-center gap-3 min-w-0">
                  {ev.picture ? (
                    <img
                      src={ev.picture}
                      alt={ev.eventName}
                      className="w-10 h-10 rounded-xl object-cover flex-shrink-0 border border-slate-200 shadow-sm"
                      onError={(e) => { e.target.style.display='none'; }}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-sm flex-shrink-0 font-bold">
                      {ev.eventName.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{ev.eventName}</p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5 flex items-center gap-0.5">
                      {ev.artistName && <span className="font-semibold text-slate-600">{ev.artistName} · </span>}
                      <MapPin className="w-3 h-3 text-slate-400 inline" /> {ev.city}
                    </p>
                  </div>
                </div>

                {/* Date */}
                <span className="text-xs font-semibold text-slate-600 text-center whitespace-nowrap">
                  {ev.eventDate || '—'}
                  {ev.eventTime && <span className="block text-[10px] text-slate-400 mt-0.5">{ev.eventTime}</span>}
                </span>

                {/* Category */}
                <span className="text-xs font-semibold text-slate-600 text-center whitespace-nowrap">
                  {ev.category || '—'}
                </span>

                {/* Status */}
                <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border whitespace-nowrap ${statusBadge(ev.status)}`}>
                  {ev.status}
                </span>

                {/* Actions */}
                {isOperationalAdmin && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(ev)}
                      title={t('admin.editEvent')}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-white hover:bg-blue-50 hover:text-blue-600 text-slate-400 border border-slate-200 hover:border-blue-200 transition-all cursor-pointer text-sm shadow-sm active:scale-95"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => confirmDelete(ev)}
                      title={t('common.delete')}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-white hover:bg-red-50 hover:text-red-600 text-slate-400 border border-slate-200 hover:border-red-200 transition-all cursor-pointer text-sm shadow-sm active:scale-95"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary bar */}
      {!loading && filtered.length > 0 && (
        <p className="text-xs font-semibold text-slate-500 text-center">
          {t('admin.showingEvents', { filtered: filtered.length, total: events.length })}
        </p>
      )}

      {/* Modals */}
      <EventModal
        open={modalOpen}
        mode={modalMode}
        form={form}
        setForm={setForm}
        onSubmit={handleSubmit}
        onClose={closeModal}
        loading={actionLoading}
        serverError={serverError}
      />
      <ConfirmDeleteModal
        open={deleteModal.open}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal({ open: false, id: null, name: '' })}
        loading={actionLoading}
        eventName={deleteModal.name}
      />
    </div>
  );
}
