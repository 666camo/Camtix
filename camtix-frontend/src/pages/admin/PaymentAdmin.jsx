import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import paymentService from '../../services/paymentService';
import bookingService from '../../services/bookingService';
import { useAuth } from '../../context/AuthContext';
import { CreditCard, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Pagination from '../../components/Pagination';

function statusBadge(status) {
  const map = {
    PAID: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    WAITING_CONFIRMATION: 'text-blue-600 bg-blue-50 border-blue-200 animate-pulse',
    PENDING: 'text-amber-600 bg-amber-50 border-amber-200',
    REJECTED: 'text-red-600 bg-red-50 border-red-200',
    EXPIRED: 'text-slate-500 bg-slate-100 border-slate-200',
  };
  return map[status] || 'text-slate-500 bg-slate-100 border-slate-200';
}

function ProofModal({ open, proofUrl, onClose }) {
  const { t } = useTranslation();
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl overflow-hidden max-w-2xl w-full flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
          <h3 className="font-bold text-slate-800 text-sm">{t('admin.transferProofModal')}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
        <div className="p-4 flex items-center justify-center bg-slate-100 min-h-[300px]">
          {proofUrl ? (
            <img src={proofUrl} alt="Bukti Pembayaran" className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-sm" />
          ) : (
            <span className="text-slate-400 text-sm">{t('admin.imageNotAvailable')}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function ActionModal({ open, title, type, onSubmit, onClose, loading }) {
  const { t } = useTranslation();
  const [note, setNote] = useState('');
  useEffect(() => { if (open) setNote(''); }, [open]);

  if (!open) return null;
  const isReject = type === 'reject';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)' }}
    >
      <div className={`bg-white border ${isReject ? 'border-red-200' : 'border-emerald-200'} rounded-2xl w-full max-w-sm p-6 shadow-xl`}>
        <div className="flex items-center gap-2 mb-4">
          {isReject ? <XCircle className="w-6 h-6 text-red-500" /> : <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
        </div>
        <div className="mb-6">
          <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wider">{t('admin.adminNoteOptional')}</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder={isReject ? t('admin.rejectReasonPlaceholder') : t('admin.approveNotePlaceholder')}
            className={`w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 transition-colors resize-none ${isReject ? 'focus:border-red-400 focus:ring-red-100' : 'focus:border-emerald-400 focus:ring-emerald-100'}`}
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={() => onSubmit(note)}
            disabled={loading}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-colors flex items-center justify-center gap-2 shadow-sm ${
              isReject ? 'bg-red-600 hover:bg-red-700 disabled:bg-red-300' : 'bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300'
            }`}
          >
            {loading ? t('auth.saving') : t('admin.confirmBtn')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentAdmin() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const isOperationalAdmin = user?.role === 'ADMIN_CAMTIX';

  const [payments, setPayments] = useState([]);
  const [bookingsMap, setBookingsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  // Search & filter & sort & pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('WAITING_CONFIRMATION');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Modals
  const [proofModal, setProofModal] = useState({ open: false, url: '' });
  const [actionModal, setActionModal] = useState({ open: false, type: '', title: '', paymentId: null });

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const payRes = await paymentService.getAllPayments().catch(() => null);
      if (payRes && payRes.data) {
        setPayments(payRes.data);
      }

      const bRes = await bookingService.getAllBookings().catch(() => null);
      if (bRes && bRes.data) {
        const map = {};
        bRes.data.forEach(b => { map[b.idBooking] = b; });
        setBookingsMap(map);
      }

    } catch (err) {
      setError(t('admin.loadPaymentFail'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const formatRupiah = (value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

  const handleActionSubmit = async (note) => {
    setActionLoading(true);
    try {
      if (actionModal.type === 'approve') {
        await paymentService.verifyPayment(actionModal.paymentId, note);
        toast.success(t('admin.paymentApproveSuccess'));
      } else {
        await paymentService.rejectPayment(actionModal.paymentId, note);
        toast.success(t('admin.paymentRejectSuccess'));
      }
      setActionModal({ open: false, type: '', title: '', paymentId: null });
      fetchData();
    } catch (err) {
      toast.error(t('admin.paymentFail'));
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = payments.filter((p) => {
    const code = (bookingsMap[p.bookingId]?.bookingCode || '').toLowerCase();
    const q = searchQuery.toLowerCase();
    const matchQ = !q || code.includes(q) || p.idPayment.toString().includes(q);
    const matchS = !filterStatus || p.paymentStatus === filterStatus;
    return matchQ && matchS;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'newest') return (b.idPayment || 0) - (a.idPayment || 0);
    if (sortBy === 'oldest') return (a.idPayment || 0) - (b.idPayment || 0);
    if (sortBy === 'amount_high') return (Number(b.totalPayment) || 0) - (Number(a.totalPayment) || 0);
    if (sortBy === 'amount_low') return (Number(a.totalPayment) || 0) - (Number(b.totalPayment) || 0);
    return 0;
  });

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paginatedPayments = sorted.slice(page * pageSize, (page + 1) * pageSize);

  useEffect(() => {
    setPage(0);
  }, [searchQuery, filterStatus, sortBy, pageSize]);

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-slate-700" /> {t('admin.paymentVerification')}
          </h1>
          <p className="text-sm text-slate-500 mt-1">{t('admin.paymentSubtitle')}</p>
        </div>
        <button onClick={fetchData} className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center gap-2 active:scale-95">
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          <span>{t('common.refresh')}</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row flex-wrap gap-3">
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('admin.searchPaymentPlaceholder')}
          className="flex-1 min-w-[200px] px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-blue-400 shadow-sm"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-blue-400 shadow-sm"
        >
          <option value="">{t('admin.allStatus')}</option>
          <option value="WAITING_CONFIRMATION">{t('admin.waitingReview')}</option>
          <option value="PAID">{t('admin.paidConfirmed')}</option>
          <option value="REJECTED">{t('admin.rejectedStatus')}</option>
          <option value="PENDING">{t('admin.pendingStatus')}</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-blue-400 shadow-sm"
        >
          <option value="newest">Terbaru</option>
          <option value="oldest">Terlama</option>
          <option value="amount_high">Nominal: Tertinggi</option>
          <option value="amount_low">Nominal: Terendah</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm overflow-x-auto">
        <div className={`grid ${isOperationalAdmin ? 'grid-cols-[auto_1fr_1fr_auto_auto_auto]' : 'grid-cols-[auto_1fr_1fr_auto_auto]'} gap-4 px-5 py-3 border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold text-slate-500 uppercase tracking-widest min-w-[700px]`}>
          <span>{t('admin.colPaymentId')}</span>
          <span>{t('admin.colPaymentInfo')}</span>
          <span>{t('admin.colPaymentAmount')}</span>
          <span className="text-center">{t('admin.colStatus')}</span>
          <span className="text-center">{t('admin.colPaymentProof')}</span>
          {isOperationalAdmin && <span className="text-right">{t('admin.colAction')}</span>}
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-500 text-sm">{t('admin.loadingPaymentData')}</div>
        ) : sorted.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm font-semibold">{t('admin.noPaymentDataFound')}</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {paginatedPayments.map((p) => {
              const code = bookingsMap[p.bookingId]?.bookingCode || `Booking #${p.bookingId}`;
              const isWaiting = p.paymentStatus === 'WAITING_CONFIRMATION';

              return (
                <div key={p.idPayment} className={`grid ${isOperationalAdmin ? 'grid-cols-[auto_1fr_1fr_auto_auto_auto]' : 'grid-cols-[auto_1fr_1fr_auto_auto]'} gap-4 items-center px-5 py-4 hover:bg-slate-50 transition-colors min-w-[700px]`}>
                  <span className="text-xs font-bold text-slate-400">#{p.idPayment}</span>
                  
                  <div>
                    <p className="text-sm font-bold text-blue-600 font-mono">{code}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Tgl: {p.paymentDate?.split('T')[0] || '-'}</p>
                  </div>

                  <div>
                    <p className="text-sm font-extrabold text-slate-800">{formatRupiah(p.totalPayment)}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Metode ID: {p.paymentMethodId}</p>
                  </div>

                  <div className="flex justify-center">
                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${statusBadge(p.paymentStatus)}`}>
                      {p.paymentStatus}
                    </span>
                  </div>

                  <div className="flex justify-center">
                    {p.paymentProof ? (
                      <button
                        onClick={() => setProofModal({ open: true, url: p.paymentProof })}
                        className="text-[10px] font-bold px-3 py-1 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        {t('admin.viewImage')}
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">{t('admin.notUploaded')}</span>
                    )}
                  </div>

                  {isOperationalAdmin && (
                    <div className="flex justify-end gap-2">
                      {isWaiting ? (
                        <>
                          <button
                            onClick={() => setActionModal({ open: true, type: 'approve', title: 'Terima Pembayaran?', paymentId: p.idPayment })}
                            className="px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white border border-emerald-200 rounded-lg text-xs font-bold transition-all shadow-sm"
                          >
                            {t('admin.approveBtn')}
                          </button>
                          <button
                            onClick={() => setActionModal({ open: true, type: 'reject', title: 'Tolak Pembayaran?', paymentId: p.idPayment })}
                            className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-200 rounded-lg text-xs font-bold transition-all shadow-sm"
                          >
                            {t('admin.rejectBtn')}
                          </button>
                        </>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-semibold italic">{t('admin.doneBtn')}</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
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

      <ProofModal open={proofModal.open} proofUrl={proofModal.url} onClose={() => setProofModal({ open: false, url: '' })} />
      <ActionModal open={actionModal.open} type={actionModal.type} title={actionModal.title} loading={actionLoading} onSubmit={handleActionSubmit} onClose={() => setActionModal({ open: false, type: '', title: '', paymentId: null })} />
    </div>
  );
}
