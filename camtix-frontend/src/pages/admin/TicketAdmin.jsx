import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import eventService from '../../services/eventService';
import { useAuth } from '../../context/AuthContext';
import { Ticket, Plus, AlertCircle, Trash2, Edit } from 'lucide-react';
import Pagination from '../../components/Pagination';

// ── Helpers ────────────────────────────────────────────────────────
const EMPTY_FORM = {
  ticketType:  '',
  price:       '',
  stock:       '',
  description: '',
  eventId:     '',
};

const formatRupiah = (val) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(val) || 0);

// ── Ticket Modal ───────────────────────────────────────────────────
function TicketModal({ open, mode, form, setForm, onSubmit, onClose, loading, serverError, events }) {
  const { t } = useTranslation();
  const firstInputRef = useRef(null);
  useEffect(() => { if (open && firstInputRef.current) firstInputRef.current.focus(); }, [open]);
  if (!open) return null;

  const handle = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const isEdit = mode === 'edit';

  const inputClass = "w-full px-4 py-2.5 bg-surface-hover border border-border rounded-xl text-sm text-fg placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-surface border border-border rounded-2xl w-full max-w-lg shadow-card shadow-slate-200/50 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-surface rounded-t-2xl">
          <h2 className="text-lg font-bold text-fg flex items-center gap-2">
            {isEdit ? <Edit className="w-5 h-5 text-brand" /> : <Ticket className="w-5 h-5 text-brand" />}
            {isEdit ? t('admin.editTicket') : t('admin.createTicket')}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-200 text-fg-muted hover:text-fg-secondary transition-colors cursor-pointer"
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

          {/* Event selector */}
          <div>
            <label className="block text-xs font-bold text-fg-secondary mb-1.5 uppercase tracking-wider">{t('admin.eventLabel')} <span className="text-red-500">*</span></label>
            <select
              ref={firstInputRef}
              name="eventId"
              value={form.eventId}
              onChange={handle}
              className={inputClass}
            >
              <option value="">{t('admin.selectEvent')}</option>
              {events.map((ev) => (
                <option key={ev.idEvent} value={ev.idEvent}>
                  {ev.eventName} ({ev.city})
                </option>
              ))}
            </select>
          </div>

          {/* Ticket Type */}
          <div>
            <label className="block text-xs font-bold text-fg-secondary mb-1.5 uppercase tracking-wider">{t('admin.ticketType')} <span className="text-red-500">*</span></label>
            <input
              name="ticketType"
              value={form.ticketType}
              onChange={handle}
              placeholder="Contoh: VVIP, VIP, CAT 1, Reguler..."
              className={inputClass}
            />
          </div>

          {/* Price & Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-fg-secondary mb-1.5 uppercase tracking-wider">{t('admin.priceRp')} <span className="text-red-500">*</span></label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handle}
                min="0"
                step="1000"
                placeholder="0"
                className={inputClass}
              />
              {form.price && (
                <p className="text-[10px] text-brand font-semibold mt-1">{formatRupiah(form.price)}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-bold text-fg-secondary mb-1.5 uppercase tracking-wider">{t('admin.stock')} <span className="text-red-500">*</span></label>
              <input
                type="number"
                name="stock"
                value={form.stock}
                onChange={handle}
                min="0"
                placeholder="0"
                className={inputClass}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-fg-secondary mb-1.5 uppercase tracking-wider">{t('admin.description')}</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handle}
              rows={3}
              placeholder="Fasilitas atau keterangan tambahan ticket..."
              className={`${inputClass} resize-none`}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-surface rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-border text-sm font-bold text-fg-secondary hover:bg-slate-100 hover:text-fg transition-colors cursor-pointer bg-surface"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={onSubmit}
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-brand hover:bg-brand-hover disabled:bg-slate-300 disabled:text-fg-muted text-sm font-bold text-white transition-colors cursor-pointer flex items-center gap-2 shadow-card"
          >
            {loading && (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            )}
            {isEdit ? t('admin.saveTicketChanges') : t('admin.createTicketBtn')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Delete Confirm Modal ───────────────────────────────────────────
function ConfirmDeleteModal({ open, onConfirm, onCancel, loading, ticketType }) {
  const { t } = useTranslation();
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)' }}
    >
      <div className="bg-surface border border-red-200 rounded-2xl w-full max-w-sm p-6 text-center shadow-card">
        <Trash2 className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-fg mb-2">{t('admin.deleteTicketTitle')}</h3>
        <p className="text-sm text-fg-muted mb-6">
          {t('admin.deleteTicketConfirm', { name: ticketType })}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-border bg-surface text-sm font-bold text-fg-secondary hover:bg-surface-hover transition-colors cursor-pointer"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-slate-300 disabled:text-fg-muted text-sm font-bold text-white transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-card"
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
export default function TicketAdmin() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isOperationalAdmin = user?.role === 'ADMIN_CAMTIX';

  const [tickets, setTickets] = useState([]);
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

  // Delete modal
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null, type: '' });

  // Search / filter / sort / pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [filterEventId, setFilterEventId] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // ── Fetch data ────────────────────────────────────────────────────
  const fetchData = async () => {
    setLoading(true);
    setPageError('');
    try {
      const [ticketRes, eventRes] = await Promise.all([
        eventService.getAllTickets(),
        eventService.getAllEvents(),
      ]);
      const ticketList = Array.isArray(ticketRes) ? ticketRes : (ticketRes?.data ?? []);
      const eventList  = Array.isArray(eventRes)  ? eventRes  : (eventRes?.data  ?? []);
      setTickets(ticketList);
      setEvents(eventList);
    } catch (err) {
      setPageError(t('admin.loadTicketFail'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Helper: get event name by id
  const getEventName = (id) => {
    const ev = events.find(e => String(e.idEvent) === String(id));
    return ev ? ev.eventName : `Event #${id}`;
  };

  // ── Open modals ──────────────────────────────────────────────────
  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setServerError('');
    setModalMode('create');
    setModalOpen(true);
  };

  const openEdit = (ticket) => {
    setForm({
      ticketType:  ticket.ticketType  || '',
      price:       String(ticket.price       ?? ''),
      stock:       String(ticket.stock       ?? ''),
      description: ticket.description || '',
      eventId:     String(ticket.eventId     ?? ''),
    });
    setEditId(ticket.idTicket);
    setServerError('');
    setModalMode('edit');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setServerError('');
  };

  // ── Submit ───────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.eventId)              { setServerError(t('admin.eventRequired')); return; }
    if (!form.ticketType.trim())    { setServerError(t('admin.typeRequired')); return; }
    if (form.price === '')          { setServerError(t('admin.priceRequired')); return; }
    if (form.stock === '')          { setServerError(t('admin.stockRequired')); return; }
    if (Number(form.price) < 0)     { setServerError(t('admin.priceNegative')); return; }
    if (Number(form.stock) < 0)     { setServerError(t('admin.stockNegative')); return; }

    setActionLoading(true);
    setServerError('');
    try {
      const payload = {
        ticketType:  form.ticketType,
        price:       Number(form.price),
        stock:       Number(form.stock),
        description: form.description,
        eventId:     Number(form.eventId),
      };
      if (modalMode === 'create') {
        await eventService.createTicket(payload);
        toast.success(t('admin.ticketCreateSuccess'));
      } else {
        await eventService.updateTicket(editId, payload);
        toast.success(t('admin.ticketUpdateSuccess'));
      }
      closeModal();
      await fetchData();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data || t('common.error');
      setServerError(typeof msg === 'object' ? JSON.stringify(msg) : String(msg));
      toast.error(typeof msg === 'object' ? JSON.stringify(msg) : String(msg));
    } finally {
      setActionLoading(false);
    }
  };

  // ── Delete ───────────────────────────────────────────────────────
  const confirmDelete = (ticket) => {
    setDeleteModal({ open: true, id: ticket.idTicket, type: ticket.ticketType });
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await eventService.deleteTicket(deleteModal.id);
      setDeleteModal({ open: false, id: null, type: '' });
      toast.success(t('admin.ticketDeleteSuccess'));
      await fetchData();
    } catch (err) {
      setPageError(t('admin.deleteTicketFail'));
      toast.error(t('admin.deleteTicketFail'));
    } finally {
      setActionLoading(false);
    }
  };

  // ── Filter & sort client-side ────────────────────────────────────
  const filtered = tickets.filter((t) => {
    const q = searchQuery.toLowerCase();
    const matchQ = !q || [t.ticketType, t.description, getEventName(t.eventId)].some(
      (v) => v && v.toLowerCase().includes(q)
    );
    const matchE = !filterEventId || String(t.eventId) === filterEventId;
    return matchQ && matchE;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'newest') return (b.idTicket || 0) - (a.idTicket || 0);
    if (sortBy === 'oldest') return (a.idTicket || 0) - (b.idTicket || 0);
    if (sortBy === 'az') return (a.ticketType || '').localeCompare(b.ticketType || '');
    if (sortBy === 'za') return (b.ticketType || '').localeCompare(a.ticketType || '');
    if (sortBy === 'price_low') return (Number(a.price) || 0) - (Number(b.price) || 0);
    if (sortBy === 'price_high') return (Number(b.price) || 0) - (Number(a.price) || 0);
    return 0;
  });

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paginatedTickets = sorted.slice(page * pageSize, (page + 1) * pageSize);

  useEffect(() => {
    setPage(0);
  }, [searchQuery, filterEventId, sortBy, pageSize]);

  // ── Render ───────────────────────────────────────────────────────
  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-fg flex items-center gap-2">
            <Ticket className="w-6 h-6 text-brand" /> {t('admin.ticketManagement')}
          </h1>
          <p className="text-sm text-fg-muted mt-1">
            {t('admin.ticketsRegistered', { count: events.length })}
          </p>
        </div>
        {isOperationalAdmin && (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand hover:bg-brand-hover text-sm font-bold text-white rounded-xl transition-all shadow-card cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" /> {t('admin.addTicket')}
          </button>
        )}
      </div>

      {/* Error banner */}
      {pageError && (
        <div className="p-3 rounded-xl border border-red-200 bg-red-50 text-red-600 text-xs flex items-center gap-2 font-medium animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="flex-1">{pageError}</p>
          <button onClick={() => setPageError('')} className="ml-auto text-red-400 hover:text-red-600 font-bold cursor-pointer">✕</button>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-3">
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('admin.searchTicketPlaceholder')}
          className="flex-1 min-w-[200px] px-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-fg placeholder-slate-400 focus:outline-none focus:border-blue-400 transition-colors shadow-card"
        />
        <select
          value={filterEventId}
          onChange={(e) => setFilterEventId(e.target.value)}
          className="px-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-fg-secondary focus:outline-none focus:border-blue-400 transition-colors min-w-[180px] shadow-card"
        >
          <option value="">{t('admin.allEvents')}</option>
          {events.map((ev) => (
             <option key={ev.idEvent} value={String(ev.idEvent)}>
               {ev.eventName}
             </option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-fg-secondary focus:outline-none focus:border-blue-400 transition-colors shadow-card"
        >
          <option value="newest">Terbaru</option>
          <option value="oldest">Terlama</option>
          <option value="az">A - Z</option>
          <option value="za">Z - A</option>
          <option value="price_low">Harga: Termurah</option>
          <option value="price_high">Harga: Termahal</option>
        </select>
        <button
          onClick={fetchData}
          className="px-4 py-2.5 bg-surface hover:bg-surface-hover border border-border rounded-xl text-xs font-bold text-fg-secondary transition-colors cursor-pointer flex items-center gap-2 shadow-card"
        >
          <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {t('common.refresh')}
        </button>
      </div>

      {/* Table */}
      <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-card overflow-x-auto">
        {/* Header row */}
        <div className={`grid ${isOperationalAdmin ? 'grid-cols-[2fr_1fr_auto_auto_auto_auto]' : 'grid-cols-[2fr_1fr_auto_auto_auto]'} gap-4 px-5 py-3 border-b border-border bg-surface text-[10px] font-bold text-fg-muted uppercase tracking-widest min-w-[600px]`}>
          <span>Ticket</span>
          <span>Event</span>
          <span className="text-center">{t('admin.priceRp')}</span>
          <span className="text-center">{t('admin.stock')}</span>
          <span className="text-center">ID</span>
          {isOperationalAdmin && <span className="text-center">{t('history.action')}</span>}
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <svg className="w-8 h-8 animate-spin text-brand mx-auto mb-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            <p className="text-sm text-fg-muted font-medium">{t('admin.loadingTickets')}</p>
          </div>
        ) : sorted.length === 0 ? (
          <div className="py-16 text-center animate-fadeIn">
            <Ticket className="w-12 h-12 text-fg-muted mx-auto mb-3" />
            <p className="text-sm font-bold text-fg-secondary">
              {searchQuery || filterEventId
                ? t('admin.noTicketsMatch')
                : t('admin.noTicketsYet')}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {paginatedTickets.map((tk) => (
              <div
                key={tk.idTicket}
                className={`grid ${isOperationalAdmin ? 'grid-cols-[2fr_1fr_auto_auto_auto_auto]' : 'grid-cols-[2fr_1fr_auto_auto_auto]'} gap-4 items-center px-5 py-4 hover:bg-surface-hover transition-colors min-w-[600px]`}
              >
                {/* Ticket info */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-brand-subtle border border-border text-brand text-xs font-extrabold">
                      {tk.ticketType}
                    </span>
                  </div>
                  {tk.description && (
                    <p className="text-[11px] text-fg-muted mt-1 truncate">{tk.description}</p>
                  )}
                </div>

                {/* Event name */}
                <span className="text-xs font-semibold text-fg-secondary truncate">{getEventName(tk.eventId)}</span>

                {/* Price */}
                <span className="text-xs font-bold text-fg text-right whitespace-nowrap">
                  {formatRupiah(tk.price)}
                </span>

                {/* Stock */}
                <span className={`text-xs font-bold text-center ${tk.stock === 0 ? 'text-red-600' : tk.stock < 10 ? 'text-amber-600' : 'text-fg-secondary'}`}>
                  {tk.stock}
                  {tk.stock === 0 && <span className="block text-[9px] text-red-500 mt-0.5">{t('admin.outOfStockBadge')}</span>}
                  {tk.stock > 0 && tk.stock < 10 && <span className="block text-[9px] text-amber-500 mt-0.5">{t('admin.lowStockBadge')}</span>}
                </span>

                {/* ID */}
                <span className="text-[10px] font-mono font-semibold text-fg-muted text-center">
                  #{tk.idTicket}
                </span>

                {/* Actions */}
                {isOperationalAdmin && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(tk)}
                      title={t('admin.editTicket')}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface hover:bg-brand-subtle hover:text-brand text-fg-muted border border-border hover:border-border transition-all cursor-pointer text-sm shadow-card active:scale-95"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => confirmDelete(tk)}
                      title={t('common.delete')}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface hover:bg-red-50 hover:text-red-600 text-fg-muted border border-border hover:border-red-200 transition-all cursor-pointer text-sm shadow-card active:scale-95"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
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
        <p className="text-xs font-semibold text-fg-muted text-center">
          {t('admin.showingTickets', { filtered: sorted.length, total: tickets.length })}
        </p>
      )}

      {/* Modals */}
      <TicketModal
        open={modalOpen}
        mode={modalMode}
        form={form}
        setForm={setForm}
        onSubmit={handleSubmit}
        onClose={closeModal}
        loading={actionLoading}
        serverError={serverError}
        events={events}
      />
      <ConfirmDeleteModal
        open={deleteModal.open}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal({ open: false, id: null, type: '' })}
        loading={actionLoading}
        ticketType={deleteModal.type}
      />
    </div>
  );
}
