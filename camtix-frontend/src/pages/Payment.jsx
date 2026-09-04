import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import bookingService from '../services/bookingService';
import paymentService from '../services/paymentService';
import eventService from '../services/eventService';
import { 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  XCircle, 
  ClipboardList, 
  FileText, 
  Calendar, 
  MapPin, 
  Zap, 
  CreditCard, 
  Building2,
  Mail,
  Loader2
} from 'lucide-react';

export default function Payment() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [event, setEvent] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethodId, setSelectedMethodId] = useState('');
  
  const [paymentProofDataUrl, setPaymentProofDataUrl] = useState('');
  const [payment, setPayment] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleResendETicketEmail = async () => {
    if (!bookingId) return;
    setResendingEmail(true);
    const toastId = toast.loading(t('history.sendingEmail'));
    try {
      await paymentService.resendETicketEmail(bookingId);
      toast.success(t('history.sendEmailSuccess'), { id: toastId });
    } catch (err) {
      console.error('Failed to send e-ticket email:', err);
      const msg = err.response?.data?.message || t('history.sendEmailFail');
      toast.error(msg, { id: toastId });
    } finally {
      setResendingEmail(false);
    }
  };

  const fetchPaymentDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const bookingRes = await bookingService.getBookingById(bookingId);
      if (bookingRes && bookingRes.data) {
        setBooking(bookingRes.data);
        
        const eventRes = await eventService.getEventById(bookingRes.data.eventId);
        if (eventRes && eventRes.data) {
          setEvent(eventRes.data);
        }
      }

      const methodsRes = await paymentService.getPaymentMethods();
      if (methodsRes && methodsRes.data) {
        let list = methodsRes.data;
        // Fallback: If MIDTRANS not in database yet, prepend virtual Midtrans method option
        if (!list.some(m => m.provider?.toUpperCase() === 'MIDTRANS')) {
          list = [
            {
              idPaymentMethod: 20,
              methodName: 'Midtrans Payment Gateway (QRIS, VA, E-Wallet, Card)',
              provider: 'MIDTRANS',
              accountNumber: '-',
              accountName: 'Midtrans Sandbox Gateway',
              isActive: true
            },
            ...list
          ];
        }
        setPaymentMethods(list);
        if (list.length > 0 && !selectedMethodId) {
          setSelectedMethodId(list[0].idPaymentMethod.toString());
        }
      }

      try {
        const paymentRes = await paymentService.getPaymentByBookingId(bookingId);
        if (paymentRes && paymentRes.data) {
          setPayment(paymentRes.data);
          if (paymentRes.data.paymentMethodId) {
            setSelectedMethodId(paymentRes.data.paymentMethodId.toString());
          }
          if (paymentRes.data.paymentProof) {
            setPaymentProofDataUrl(paymentRes.data.paymentProof);
          }
        }
      } catch (payErr) {
        console.log("No payment record located yet. It will be created on checkout.");
      }

    } catch (err) {
      console.error(err);
      setError(t('payment.loadFail'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchPaymentDetails();

    // Ensure Midtrans Snap script is loaded
    const midtransClientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY || 'SB-Mid-client-camtix';
    const existingScript = document.getElementById('midtrans-snap-script');
    if (!existingScript && !window.snap) {
      const script = document.createElement('script');
      script.id = 'midtrans-snap-script';
      script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
      script.setAttribute('data-client-key', midtransClientKey);
      script.async = true;
      document.body.appendChild(script);
    }
  }, [user, bookingId]);

  const handleMethodSelect = (e) => {
    setSelectedMethodId(e.target.value);
  };

  const handleFileChange = (e) => {
    setError('');
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError(t('payment.fileSizeError'));
      toast.error(t('payment.fileSizeError'));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPaymentProofDataUrl(reader.result);
    };
    reader.onerror = () => {
      setError(t('payment.fileReadError'));
    };
    reader.readAsDataURL(file);
  };

  const selectedMethod = paymentMethods.find(
    (m) => m.idPaymentMethod === parseInt(selectedMethodId, 10)
  );
  const isMidtransSelected = selectedMethod?.provider?.toUpperCase() === 'MIDTRANS';

  // 1. Pay with Midtrans Action
  const handlePayWithMidtrans = async () => {
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      let activePayment = payment;

      if (!activePayment || !activePayment.snapToken) {
        const payPayload = {
          bookingId: parseInt(bookingId, 10),
          paymentMethodId: parseInt(selectedMethodId, 10),
          totalPayment: booking.totalPrice,
          useMidtrans: true
        };
        const createRes = await paymentService.createPayment(payPayload);
        if (createRes && createRes.data) {
          activePayment = createRes.data;
          setPayment(createRes.data);
        }
      }

      if (activePayment?.snapToken) {
        setSuccess(t('payment.midtransOpening'));
        if (window.snap && window.snap.pay) {
          window.snap.pay(activePayment.snapToken, {
            onSuccess: (result) => {
              setSuccess(t('payment.midtransSuccess'));
              toast.success(t('payment.midtransSuccess'));
              fetchPaymentDetails();
            },
            onPending: (result) => {
              setError(t('payment.midtransPending'));
              toast(t('payment.midtransPending'), { icon: '⏳' });
              fetchPaymentDetails();
            },
            onError: (result) => {
              setError(t('payment.midtransFail'));
              toast.error(t('payment.midtransFail'));
            },
            onClose: () => {
              setSubmitting(false);
            }
          });
        } else {
          setError(t('payment.midtransLoadFail'));
          toast.error(t('payment.midtransLoadFail'));
        }
      } else {
        setError(t('payment.midtransFail'));
        toast.error(t('payment.midtransFail'));
      }
    } catch (err) {
      const msg = err.response?.data?.message || t('payment.midtransFail');
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // 2. Submit Manual Proof Action
  const handleSubmitProof = async (e) => {
    e.preventDefault();
    if (!selectedMethodId) {
      setError(t('payment.selectMethodError'));
      toast.error(t('payment.selectMethodError'));
      return;
    }
    if (!paymentProofDataUrl || paymentProofDataUrl.trim() === '') {
      setError(t('payment.selectProofError'));
      toast.error(t('payment.selectProofError'));
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      let activePayment = payment;

      if (!activePayment) {
        const payPayload = {
          bookingId: parseInt(bookingId, 10),
          paymentMethodId: parseInt(selectedMethodId, 10),
          totalPayment: booking.totalPrice,
          useMidtrans: false
        };
        const createRes = await paymentService.createPayment(payPayload);
        if (createRes && createRes.data) {
          activePayment = createRes.data;
          setPayment(createRes.data);
        }
      }

      const uploadRes = await paymentService.uploadPaymentProof(
        activePayment.idPayment,
        paymentProofDataUrl
      );

      if (uploadRes && uploadRes.data) {
        setPayment(uploadRes.data);
        const msg = t('payment.uploadSuccess');
        setSuccess(msg);
        toast.success(msg);
        setTimeout(() => fetchPaymentDetails(), 1500);
      }
    } catch (err) {
      const msg = err.response?.data?.message || t('payment.uploadFail');
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const formatRupiah = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  if (loading) {
    return (
      <div className="gradient-bg min-h-screen text-slate-800 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-blue-100 border-t-blue-500 animate-spin"></div>
          <p className="text-slate-500 text-sm font-medium">{t('payment.loading')}</p>
        </div>
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="gradient-bg min-h-screen text-slate-800 flex items-center justify-center px-6">
        <div className="glass-effect rounded-2xl p-8 max-w-md w-full border border-slate-200 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold text-red-600">{t('payment.errorTitle')}</h2>
          <p className="text-sm text-slate-500">{error}</p>
          <Link to="/" className="inline-block px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all">
            {t('payment.backCatalog')}
          </Link>
        </div>
      </div>
    );
  }

  const isExpiredOrCancelled = booking?.bookingStatus === 'CANCELLED' || payment?.paymentStatus === 'EXPIRED';
  const isPaid = payment?.paymentStatus === 'PAID' || booking?.bookingStatus === 'CONFIRMED';
  const isWaiting = payment?.paymentStatus === 'WAITING_CONFIRMATION';

  return (
    <div className="gradient-bg min-h-screen text-slate-800 pb-20 pt-28 px-6 md:px-12">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center md:text-left">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            {t('payment.badge')}
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight mt-2 text-slate-800">
            {t('payment.title')} <span className="gradient-text">{t('payment.titleHighlight')}</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {t('payment.subtitle')}
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-600 text-sm flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="flex-1">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-600 text-sm flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <p className="flex-1">{success}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Main payment actions */}
          <div className="md:col-span-2 space-y-6">
            
            {/* If paid already */}
            {isPaid && (
              <div className="glass-effect rounded-2xl p-8 border border-emerald-200 bg-emerald-50 text-center space-y-4">
                <Sparkles className="w-12 h-12 text-emerald-500 mx-auto" />
                <h3 className="text-xl font-bold text-emerald-600">{t('payment.paidTitle')}</h3>
                <p className="text-sm text-slate-600 leading-relaxed font-normal">
                  {t('payment.paidDesc')}
                </p>
                <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                  <Link to="/history" className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all inline-block shadow-md">
                    {t('payment.viewOrderHistory')}
                  </Link>

                  <button
                    onClick={handleResendETicketEmail}
                    disabled={resendingEmail}
                    className="px-5 py-2.5 bg-white hover:bg-slate-50 border border-emerald-300 text-emerald-800 font-bold rounded-xl text-sm transition-all shadow-sm inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {resendingEmail ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                        <span>Mengirim...</span>
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 text-emerald-600" />
                        <span>{t('payment.sendTicketToEmail')}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* If waiting approval */}
            {!isPaid && isWaiting && (
              <div className="glass-effect rounded-2xl p-8 border border-amber-200 bg-amber-50 text-center space-y-4">
                <Clock className="w-12 h-12 text-amber-500 mx-auto animate-pulse" />
                <h3 className="text-xl font-bold text-amber-600">{t('payment.waitingTitle')}</h3>
                <p className="text-sm text-slate-600 leading-relaxed font-normal">
                  {t('payment.waitingDesc')}
                </p>
                {payment?.paymentProof && (
                  <div className="mt-4 flex flex-col items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">{t('payment.previewProof')}</span>
                    <img 
                      src={payment.paymentProof} 
                      alt="Bukti Transfer" 
                      className="w-48 h-auto border border-slate-200 rounded-xl shadow-sm"
                    />
                  </div>
                )}
                <div className="pt-4">
                  <Link to="/history" className="px-6 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-sm transition-all inline-block">
                    {t('payment.viewHistoryBtn')}
                  </Link>
                </div>
              </div>
            )}

            {/* If expired or cancelled */}
            {!isPaid && !isWaiting && isExpiredOrCancelled && (
              <div className="glass-effect rounded-2xl p-8 border border-red-200 bg-red-50 text-center space-y-4">
                <XCircle className="w-12 h-12 text-red-500 mx-auto" />
                <h3 className="text-xl font-bold text-red-600">{t('payment.expiredTitle')}</h3>
                <p className="text-sm text-slate-600 leading-relaxed font-normal">
                  {t('payment.expiredDesc')}
                </p>
                {payment?.adminNote && (
                  <div className="p-3 bg-white border border-red-100 rounded-xl text-left text-xs text-slate-600">
                    <strong className="text-red-500">{t('payment.adminNote')}</strong> {payment.adminNote}
                  </div>
                )}
                <div className="pt-2">
                  <Link to="/" className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm transition-all inline-block">
                    {t('payment.backHome')}
                  </Link>
                </div>
              </div>
            )}

            {/* Form Input if Pending */}
            {!isPaid && !isWaiting && !isExpiredOrCancelled && (
              <div className="glass-effect rounded-2xl p-6 md:p-8 border border-slate-200 space-y-6">
                
                {/* Method selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                    {t('payment.selectTransferAccount')}
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    {paymentMethods.map((m) => {
                      const isMidtrans = m.provider?.toUpperCase() === 'MIDTRANS';
                      const isSelected = selectedMethodId === m.idPaymentMethod.toString();

                      return (
                        <label
                          key={m.idPaymentMethod}
                          className={`flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50/60 shadow-sm ring-2 ring-blue-200'
                              : 'border-slate-200 bg-white hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="paymentMethodId"
                            value={m.idPaymentMethod}
                            checked={isSelected}
                            onChange={handleMethodSelect}
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                          />
                          <div className="flex-1 text-sm">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-extrabold text-slate-800 flex items-center gap-2">
                                {isMidtrans ? <Zap className="w-4 h-4 text-amber-500 fill-amber-500" /> : <Building2 className="w-4 h-4 text-slate-500" />}
                                {m.methodName}
                              </span>
                              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                                isMidtrans 
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-slate-100 text-slate-600 border-slate-200'
                              }`}>
                                {isMidtrans ? t('payment.instantPaymentBadge') : t('payment.manualPaymentBadge')}
                              </span>
                            </div>
                            <div className="text-xs text-slate-500 font-medium mt-1">
                              {isMidtrans ? (
                                <span className="text-blue-600 font-semibold">QRIS, GoPay, ShopeePay, Virtual Account, Kartu Kredit</span>
                              ) : (
                                <>
                                  {t('payment.accountNo')} <span className="font-mono text-blue-600 font-bold">{m.accountNumber}</span> {t('payment.accountHolder')} {m.accountName}
                                </>
                              )}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* ── BRANCH 1: MIDTRANS INSTANT PAYMENT ── */}
                {isMidtransSelected ? (
                  <div className="p-6 bg-gradient-to-br from-blue-50 via-indigo-50/40 to-slate-50 rounded-2xl border border-blue-200 space-y-5 animate-fadeIn">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-md flex-shrink-0">
                        <Zap className="w-5 h-5 fill-white" />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-800">Pembayaran Instan via Midtrans</h4>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          {t('payment.midtransNotice')}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-blue-100 flex flex-col gap-3">
                      <button
                        type="button"
                        onClick={handlePayWithMidtrans}
                        disabled={submitting}
                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 hover:shadow-blue-500/40 active:scale-95 transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {submitting ? (
                          <>
                            <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                            <span>{t('payment.midtransOpening')}</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4 fill-white" />
                            <span>{t('payment.payWithMidtrans')}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ── BRANCH 2: MANUAL TRANSFER (WITH PROOF UPLOAD) ── */
                  <div className="space-y-6 animate-fadeIn">
                    {/* Account details instructions card */}
                    {selectedMethod && (
                      <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                        <span className="text-xs font-bold text-blue-600 uppercase block tracking-wider flex items-center gap-1.5">
                          <ClipboardList className="w-4 h-4 text-blue-600" /> {t('payment.transferInstructions')}
                        </span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium">
                          <div className="space-y-1.5">
                            <span className="text-slate-500 block">{t('payment.bankProvider')}</span>
                            <strong className="text-slate-800 text-sm font-black">{selectedMethod.provider}</strong>
                          </div>
                          <div className="space-y-1.5">
                            <span className="text-slate-500 block">{t('payment.accountNumberLabel')}</span>
                            <strong className="text-slate-800 text-sm font-mono font-black">{selectedMethod.accountNumber}</strong>
                          </div>
                          <div className="space-y-1.5">
                            <span className="text-slate-500 block">{t('payment.ownerName')}</span>
                            <strong className="text-slate-800 text-sm font-black">{selectedMethod.accountName}</strong>
                          </div>
                          <div className="space-y-1.5">
                            <span className="text-slate-500 block">{t('payment.transferAmount')}</span>
                            <strong className="text-blue-600 text-sm font-black">{formatRupiah(booking?.totalPrice || 0)}</strong>
                          </div>
                        </div>

                        {selectedMethod.qrImage && (
                          <div className="pt-3 border-t border-slate-200 text-center flex flex-col items-center gap-2">
                            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">{t('payment.scanQris')}</span>
                            <img
                              src={selectedMethod.qrImage}
                              alt="QR Code"
                              className="w-32 h-32 rounded-lg border border-slate-200 object-cover p-1 bg-white"
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Upload proof form (File Picker) */}
                    <form onSubmit={handleSubmitProof} className="space-y-6 pt-2 border-t border-slate-200">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t('payment.uploadProofLabel')}</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          required
                          className="w-full bg-slate-50 border border-slate-200 focus:border-blue-400 rounded-xl px-4 py-3 text-sm text-slate-700 focus:outline-none transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        {paymentProofDataUrl && (
                          <div className="mt-4">
                            <p className="text-xs text-slate-500 mb-2">{t('payment.preview')}</p>
                            <img 
                              src={paymentProofDataUrl} 
                              alt="Preview" 
                              className="h-32 w-auto border border-slate-200 rounded-lg object-contain bg-white" 
                            />
                          </div>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-500 text-white font-bold rounded-xl shadow-sm shadow-blue-500/20 hover:shadow-blue-500/30 active:scale-95 transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {submitting ? (
                          <>
                            <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                            <span>{t('payment.sendingProof')}</span>
                          </>
                        ) : (
                          <span>{t('payment.sendProofBtn')}</span>
                        )}
                      </button>
                    </form>
                  </div>
                )}

              </div>
            )}

          </div>

          {/* Pricing summary */}
          <div className="space-y-6">
            <div className="glass-effect rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-slate-500" /> {t('payment.billingSummary')}
              </h3>
              
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">{t('payment.bookingCode')}</span>
                <span className="text-base font-mono font-extrabold text-slate-800">{booking?.bookingCode}</span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">{t('payment.concertName')}</span>
                <span className="text-sm font-bold text-slate-700">{event?.eventName || t('payment.loadingText')}</span>
                <span className="text-[10px] text-slate-500 block mt-0.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> {event?.eventDate} • <MapPin className="w-3.5 h-3.5 text-slate-400" /> {event?.city}
                </span>
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-500">
                  <span>{t('payment.ticketQuantity')}</span>
                  <span className="font-bold text-slate-800">x {booking?.numberOfTicket}</span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>{t('payment.bookingStatus')}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${
                    booking?.bookingStatus === 'PENDING' ? 'text-amber-600 bg-amber-50 border-amber-200 animate-pulse' :
                    booking?.bookingStatus === 'CONFIRMED' ? 'text-emerald-600 bg-emerald-50 border-emerald-200' :
                    'text-red-600 bg-red-50 border-red-200'
                  }`}>
                    {booking?.bookingStatus}
                  </span>
                </div>
                
                <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-sm font-extrabold">
                  <span className="text-slate-800">{t('payment.totalBill')}</span>
                  <span className="text-blue-600 text-base">{formatRupiah(booking?.totalPrice || 0)}</span>
                </div>
              </div>
            </div>

            {/* Redirect link history */}
            <div className="text-center pt-2">
              <Link to="/history" className="text-xs text-blue-600 hover:text-blue-700 font-bold transition-colors">
                {t('payment.viewAllHistory')}
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
