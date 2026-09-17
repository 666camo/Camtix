import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import paymentService from '../../services/paymentService';
import { useAuth } from '../../context/AuthContext';
import Pagination from '../../components/Pagination';
import { CreditCard, Plus, AlertCircle, Trash2, Edit, CheckCircle, XCircle, ArrowUpDown } from 'lucide-react';

const EMPTY_FORM = {
  methodName: '',
  provider: '',
  accountNumber: '',
  accountName: '',
  qrImage: '',
  isActive: true,
};

function PaymentMethodModal({ open, mode, form, setForm, onSubmit, onClose, loading, serverError }) {
  const { t } = useTranslation();
  const firstInputRef = useRef(null);
  useEffect(() => { if (open && firstInputRef.current) firstInputRef.current.focus(); }, [open]);
  if (!open) return null;

  const handle = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const isEdit = mode === 'edit';
  const inputClass = "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl shadow-slate-200/50 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            {isEdit ? <Edit className="w-5 h-5 text-blue-600" /> : <CreditCard className="w-5 h-5 text-blue-600" />}
            {isEdit ? 'Edit Metode Pembayaran' : 'Tambah Metode Pembayaran'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          {serverError && (
            <div className="p-3 rounded-xl border border-red-200 bg-red-50 text-red-600 text-xs font-medium flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="flex-1">{serverError}</p>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
              Nama Metode <span className="text-red-500">*</span>
            </label>
            <input
              ref={firstInputRef}
              name="methodName"
              value={form.methodName}
              onChange={handle}
              placeholder="Contoh: Transfer Bank BCA, GoPay, QRIS..."
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
              Provider / Kategori <span className="text-red-500">*</span>
            </label>
            <input
              name="provider"
              value={form.provider}
              onChange={handle}
              placeholder="Contoh: BANK, EWALLET, QRIS, MIDTRANS..."
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                Nomor Rekening / Akun
              </label>
              <input
                name="accountNumber"
                value={form.accountNumber}
                onChange={handle}
                placeholder="1234567890"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                Atas Nama
              </label>
              <input
                name="accountName"
                value={form.accountName}
                onChange={handle}
                placeholder="PT CamTix Indonesia"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
              URL QR Image / Logo
            </label>
            <input
              name="qrImage"
              value={form.qrImage}
              onChange={handle}
              placeholder="https://..."
              className={inputClass}
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isActiveCheckbox"
              name="isActive"
              checked={form.isActive}
              onChange={handle}
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="isActiveCheckbox" className="text-sm font-semibold text-slate-700 cursor-pointer">
              Status Aktif
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer bg-white"
          >
            Batal
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
            {isEdit ? 'Simpan Perubahan' : 'Tambah Metode'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmDeleteModal({ open, onConfirm, onCancel, loading, methodName }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)' }}
    >
      <div className="bg-white border border-red-200 rounded-2xl w-full max-w-sm p-6 text-center shadow-xl">
        <Trash2 className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-800 mb-2">Hapus Metode Pembayaran</h3>
        <p className="text-sm text-slate-500 mb-6">
          Apakah Anda yakin ingin menghapus metode pembayaran <strong>{methodName}</strong>?
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-slate-300 disabled:text-slate-500 text-sm font-bold text-white transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
          >
            {loading && <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>}
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentMethodAdmin() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isOperationalAdmin = user?.role === 'ADMIN_CAMTIX' || user?.role === 'ADMIN_APLIKASI';

  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [pageError, setPageError] = useState('');

  // Pagination & Sorting state
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'az', 'za'

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActive, setFilterActive] = useState('');

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [serverError, setServerError] = useState('');
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null, name: '' });

  const fetchData = async () => {
    setLoading(true);
    setPageError('');
    try {
      const res = await paymentService.getAllPaymentMethodsAdmin();
      const list = Array.isArray(res) ? res : (res?.data ?? []);
      setMethods(list);
    } catch (err) {
      setPageError('Gagal memuat metode pembayaran');
      toast.error('Gagal memuat metode pembayaran');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setServerError('');
    setModalMode('create');
    setModalOpen(true);
  };

  const openEdit = (m) => {
    setForm({
      methodName: m.methodName || '',
      provider: m.provider || '',
      accountNumber: m.accountNumber || '',
      accountName: m.accountName || '',
      qrImage: m.qrImage || '',
      isActive: m.isActive ?? true,
    });
    setEditId(m.idPaymentMethod);
    setServerError('');
    setModalMode('edit');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setServerError('');
  };

  const handleSubmit = async () => {
    if (!form.methodName.trim()) { setServerError('Nama metode wajib diisi'); return; }
    if (!form.provider.trim()) { setServerError('Provider wajib diisi'); return; }

    setActionLoading(true);
    setServerError('');
    try {
      const payload = {
        methodName: form.methodName,
        provider: form.provider,
        accountNumber: form.accountNumber,
        accountName: form.accountName,
        qrImage: form.qrImage,
        isActive: form.isActive,
      };

      if (modalMode === 'create') {
        await paymentService.createPaymentMethod(payload);
        toast.success('Metode pembayaran berhasil ditambahkan!');
      } else {
        await paymentService.updatePaymentMethod(editId, payload);
        toast.success('Metode pembayaran berhasil diperbarui!');
      }
      closeModal();
      await fetchData();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Terjadi kesalahan';
      setServerError(typeof msg === 'object' ? JSON.stringify(msg) : String(msg));
      toast.error(typeof msg === 'object' ? JSON.stringify(msg) : String(msg));
    } finally {
      setActionLoading(false);
    }
  };

  const confirmDelete = (m) => {
    setDeleteModal({ open: true, id: m.idPaymentMethod, name: m.methodName });
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await paymentService.deletePaymentMethod(deleteModal.id);
      setDeleteModal({ open: false, id: null, name: '' });
      toast.success('Metode pembayaran berhasil dihapus!');
      await fetchData();
    } catch (err) {
      setPageError('Gagal menghapus metode pembayaran');
      toast.error('Gagal menghapus metode pembayaran');
    } finally {
      setActionLoading(false);
    }
  };

  // Client-side filtering & sorting
  const filteredAndSorted = methods
    .filter((m) => {
      const q = searchQuery.toLowerCase();
      const matchQ = !q || [m.methodName, m.provider, m.accountNumber, m.accountName].some(
        (v) => v && v.toLowerCase().includes(q)
      );
      const matchActive = filterActive === '' || String(m.isActive) === filterActive;
      return matchQ && matchActive;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest': return (b.idPaymentMethod || 0) - (a.idPaymentMethod || 0);
        case 'oldest': return (a.idPaymentMethod || 0) - (b.idPaymentMethod || 0);
        case 'az': return (a.methodName || '').localeCompare(b.methodName || '');
        case 'za': return (b.methodName || '').localeCompare(a.methodName || '');
        default: return 0;
      }
    });

  const totalPages = Math.ceil(filteredAndSorted.length / pageSize) || 1;
  const paginatedData = filteredAndSorted.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-blue-600" /> Metode Pembayaran
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola pilihan channel & rekening pembayaran ({methods.length} metode terdaftar)
          </p>
        </div>
        {isOperationalAdmin && (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-sm font-bold text-white rounded-xl transition-all shadow-sm cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" /> Tambah Metode
          </button>
        )}
      </div>

      {pageError && (
        <div className="p-3 rounded-xl border border-red-200 bg-red-50 text-red-600 text-xs flex items-center gap-2 font-medium animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="flex-1">{pageError}</p>
          <button onClick={() => setPageError('')} className="ml-auto text-red-400 hover:text-red-600 font-bold cursor-pointer">✕</button>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
          placeholder="Cari metode pembayaran atau nomor rekening..."
          className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 transition-colors shadow-sm"
        />
        <select
          value={filterActive}
          onChange={(e) => { setFilterActive(e.target.value); setPage(0); }}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-blue-400 transition-colors min-w-[150px] shadow-sm"
        >
          <option value="">Semua Status</option>
          <option value="true">Aktif</option>
          <option value="false">Nonaktif</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => { setSortBy(e.target.value); setPage(0); }}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-blue-400 transition-colors min-w-[150px] shadow-sm"
        >
          <option value="newest">Terbaru</option>
          <option value="oldest">Terlama</option>
          <option value="az">A - Z</option>
          <option value="za">Z - A</option>
        </select>
        <button
          onClick={fetchData}
          className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 transition-colors cursor-pointer flex items-center gap-2 shadow-sm"
        >
          <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm overflow-x-auto">
        <div className="grid grid-cols-[2fr_1fr_1.5fr_1fr_auto_auto] gap-4 px-5 py-3 border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold text-slate-500 uppercase tracking-widest min-w-[700px]">
          <span>Metode Pembayaran</span>
          <span>Provider</span>
          <span>No. Rekening / A.N.</span>
          <span className="text-center">Status</span>
          <span className="text-center">ID</span>
          {isOperationalAdmin && <span className="text-center">Aksi</span>}
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <svg className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            <p className="text-sm text-slate-500 font-medium">Memuat metode pembayaran...</p>
          </div>
        ) : paginatedData.length === 0 ? (
          <div className="py-16 text-center animate-fadeIn">
            <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-600">Tidak ada metode pembayaran yang ditemukan</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {paginatedData.map((m) => (
              <div
                key={m.idPaymentMethod}
                className="grid grid-cols-[2fr_1fr_1.5fr_1fr_auto_auto] gap-4 items-center px-5 py-4 hover:bg-slate-50 transition-colors min-w-[700px]"
              >
                <div>
                  <p className="text-xs font-bold text-slate-800">{m.methodName}</p>
                  {m.qrImage && <p className="text-[10px] text-blue-500 mt-0.5 truncate">QR Code attached</p>}
                </div>

                <span className="text-xs font-semibold text-slate-600 uppercase">{m.provider}</span>

                <div>
                  <p className="text-xs font-mono font-semibold text-slate-700">{m.accountNumber || '-'}</p>
                  <p className="text-[10px] text-slate-400">{m.accountName || '-'}</p>
                </div>

                <div className="text-center">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    m.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}>
                    {m.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {m.isActive ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>

                <span className="text-[10px] font-mono font-semibold text-slate-400 text-center">
                  #{m.idPaymentMethod}
                </span>

                {isOperationalAdmin && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(m)}
                      title="Edit"
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-white hover:bg-blue-50 hover:text-blue-600 text-slate-400 border border-slate-200 hover:border-blue-200 transition-all cursor-pointer text-sm shadow-sm active:scale-95"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => confirmDelete(m)}
                      title="Hapus"
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

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={filteredAndSorted.length}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(newSize) => { setPageSize(newSize); setPage(0); }}
        />
      </div>

      <PaymentMethodModal
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
        methodName={deleteModal.name}
      />
    </div>
  );
}
