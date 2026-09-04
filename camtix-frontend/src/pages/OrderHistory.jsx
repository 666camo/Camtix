import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import html2pdf from 'html2pdf.js';
import QRCode from 'qrcode';
import { useAuth } from '../context/AuthContext';
import bookingService from '../services/bookingService';
import paymentService from '../services/paymentService';
import eventService from '../services/eventService';
import { 
  RefreshCw, 
  AlertCircle, 
  ClipboardList, 
  MapPin, 
  Calendar, 
  Clock, 
  User, 
  Mail, 
  ShieldCheck, 
  Music, 
  Sparkles, 
  Ticket,
  Download,
  Printer,
  Loader2,
  Eye,
  X,
  Share2,
  CheckCircle2
} from 'lucide-react';

export default function OrderHistory() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [eventsMap, setEventsMap] = useState({});
  const [paymentsMap, setPaymentsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  
  // Modal & Ticket View State
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [activePrintBooking, setActivePrintBooking] = useState(null);
  const [activeQrDataUrl, setActiveQrDataUrl] = useState('');
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [sendingEmailId, setSendingEmailId] = useState(null);

  const ticketContentRef = useRef(null);

  // Generate Base64 QR code locally
  const generateQrCode = async (text) => {
    try {
      return await QRCode.toDataURL(text, {
        width: 300,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      });
    } catch (err) {
      console.error('QR code generation failed:', err);
      return '';
    }
  };

  // Open interactive ticket modal
  const openTicketModal = async (booking) => {
    setActivePrintBooking(booking);
    const qr = await generateQrCode(booking.bookingCode || `CTX-${booking.idBooking}`);
    setActiveQrDataUrl(qr);
    setTicketModalOpen(true);
  };

  // Resend E-Ticket Email handler
  const handleResendEmail = async (booking) => {
    setSendingEmailId(booking.idBooking);
    const toastId = toast.loading(t('history.sendingEmail'));
    try {
      await paymentService.resendETicketEmail(booking.idBooking);
      toast.success(t('history.sendEmailSuccess'), { id: toastId });
    } catch (err) {
      console.error('Failed to send e-ticket email:', err);
      const msg = err.response?.data?.message || t('history.sendEmailFail');
      toast.error(msg, { id: toastId });
    } finally {
      setSendingEmailId(null);
    }
  };

  // Direct PDF Download handler from visible DOM element
  const downloadTicketPdf = async (bookingToDownload) => {
    const targetBooking = bookingToDownload || activePrintBooking;
    if (!targetBooking) return;

    setDownloadingPdf(true);
    const toastId = toast.loading(t('history.downloadingPdf'));

    try {
      if (!ticketModalOpen) {
        await openTicketModal(targetBooking);
        await new Promise((r) => setTimeout(r, 400));
      }

      const element = document.getElementById('ticket-pdf-rendered-card');
      if (!element) {
        throw new Error('Ticket modal element not found');
      }

      const html2pdfFn = typeof html2pdf === 'function' ? html2pdf : (html2pdf.default || window.html2pdf);
      if (!html2pdfFn) {
        throw new Error('html2pdf module could not be initialized');
      }

      const opt = {
        margin: [4, 4, 4, 4],
        filename: `CamTix-Ticket-${targetBooking.bookingCode}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true, 
          logging: false,
          scrollY: 0,
          scrollX: 0,
          letterRendering: true,
          backgroundColor: '#ffffff'
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      await html2pdfFn().set(opt).from(element).save();
      toast.success(t('history.downloadSuccess'), { id: toastId });
    } catch (err) {
      console.error('PDF generation error, triggering browser print dialog:', err);
      toast.error(t('history.downloadFail'), { id: toastId });
      window.print();
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const fetchHistory = async (showToast = false) => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      // 1. Fetch user bookings
      const bookingsRes = await bookingService.getBookingsByUserId(user.idUser);
      const bookingsData = bookingsRes?.data || [];
      setBookings(bookingsData);

      // 2. Fetch all events for catalog mapping
      try {
        const eventsRes = await eventService.getAllEvents();
        if (eventsRes && eventsRes.data) {
          const mapping = {};
          eventsRes.data.forEach((evt) => {
            mapping[evt.idEvent] = evt;
          });
          setEventsMap(mapping);
        }
      } catch (evtErr) {
        console.log("Offline catalog event mapper loaded fallback.");
      }

      // 3. Fetch payment details for all user bookings concurrently
      if (bookingsData.length > 0) {
        try {
          const paymentResults = await Promise.allSettled(
            bookingsData.map((b) => paymentService.getPaymentByBookingId(b.idBooking))
          );
          const payMap = {};
          paymentResults.forEach((res, index) => {
            if (res.status === 'fulfilled' && res.value?.data) {
              const bId = bookingsData[index].idBooking;
              payMap[bId] = res.value.data;
            }
          });
          setPaymentsMap(payMap);
        } catch (payFetchErr) {
          console.warn("Could not fetch payment mappings:", payFetchErr);
        }
      }

      if (showToast) {
        toast.success(t('history.syncSuccess'));
      }
    } catch (err) {
      console.error(err);
      setError(t('history.errorLoad'));
      if (showToast) {
        toast.error(t('history.errorLoad'));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchHistory();
  }, [user]);

  const formatRupiah = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (isoString) => {
    if (!isoString) return '-';
    try {
      const date = new Date(isoString);
      const locale = i18n.language === 'en' ? 'en-US' : 'id-ID';
      const tzSuffix = ' WIB';
      return date.toLocaleDateString(locale, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) + tzSuffix;
    } catch (e) {
      return isoString;
    }
  };

  const getBookingState = (b) => {
    const payment = paymentsMap[b.idBooking];
    const isWaitingApproval = b.bookingStatus === 'PENDING' && (payment?.paymentStatus === 'WAITING_CONFIRMATION' || !!payment?.paymentProof);
    const isPaidConfirmed = b.bookingStatus === 'CONFIRMED' || payment?.paymentStatus === 'PAID';
    const isCancelled = b.bookingStatus === 'CANCELLED' || payment?.paymentStatus === 'REJECTED' || payment?.paymentStatus === 'EXPIRED';

    return {
      payment,
      isWaitingApproval,
      isPaidConfirmed,
      isCancelled,
      isPendingPayment: b.bookingStatus === 'PENDING' && !isWaitingApproval && !isPaidConfirmed && !isCancelled
    };
  };

  const filteredBookings = bookings.filter((b) => {
    const code = (b.bookingCode || '').toLowerCase();
    const eventName = eventsMap[b.eventId] ? eventsMap[b.eventId].eventName.toLowerCase() : '';
    const query = searchQuery.toLowerCase();
    const matchesSearch = code.includes(query) || eventName.includes(query);

    if (!matchesSearch) return false;
    if (filterStatus === 'ALL') return true;

    const { isWaitingApproval, isPaidConfirmed, isCancelled, isPendingPayment } = getBookingState(b);

    if (filterStatus === 'WAITING_CONFIRMATION') return isWaitingApproval;
    if (filterStatus === 'CONFIRMED') return isPaidConfirmed;
    if (filterStatus === 'CANCELLED') return isCancelled;
    if (filterStatus === 'PENDING') return isPendingPayment;

    return true;
  });

  if (loading) {
    return (
      <div className="gradient-bg min-h-screen text-slate-800 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-blue-100 border-t-blue-500 animate-spin"></div>
          <p className="text-slate-500 text-sm font-medium">{t('history.loading')}</p>
        </div>
      </div>
    );
  }

  const printEvent = activePrintBooking ? eventsMap[activePrintBooking.eventId] : null;

  return (
    <div className="gradient-bg min-h-screen text-slate-800 pb-20 pt-28 px-6 md:px-12">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Title */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              {t('history.badge')}
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight mt-2 text-slate-800">
              {t('history.title')} <span className="gradient-text">{t('history.titleHighlight')}</span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {t('history.subtitle')}
            </p>
          </div>
          
          <button
            onClick={() => fetchHistory(true)}
            className="px-4 py-2.5 bg-white rounded-xl text-xs font-bold hover:bg-slate-50 border border-slate-200 text-slate-700 transition-colors flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
            <span>{t('history.syncStatus')}</span>
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-600 text-xs flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="flex-1">{error}</p>
          </div>
        )}

        {/* Content Table Area */}
        <div className="glass-effect rounded-2xl p-6 border border-slate-200 space-y-6">
          
          {/* Filters */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800">
              <ClipboardList className="w-5 h-5 text-slate-700" /> {t('history.transactionList')}
            </h3>
            
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('history.searchPlaceholder')}
                className="w-full md:w-64 bg-slate-50 border border-slate-200 focus:border-blue-400 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none transition-colors"
              />
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-50 border border-slate-200 focus:border-blue-400 rounded-xl px-4 py-2.5 text-xs text-slate-700 focus:outline-none transition-colors"
              >
                <option value="ALL">{t('history.allStatus')}</option>
                <option value="PENDING">{t('history.pendingStatus')}</option>
                <option value="WAITING_CONFIRMATION">{t('history.waitingConfirmationStatus')}</option>
                <option value="CONFIRMED">{t('history.confirmedStatus')}</option>
                <option value="CANCELLED">{t('history.cancelledStatus')}</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            {filteredBookings.length === 0 ? (
              <div className="py-16 text-center text-slate-500 text-sm font-semibold">
                {t('history.noData')}
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                    <th className="px-6 py-4">{t('history.bookingCode')}</th>
                    <th className="px-6 py-4">{t('history.concertDetail')}</th>
                    <th className="px-6 py-4">{t('history.bookingTime')}</th>
                    <th className="px-6 py-4">{t('history.tickets')}</th>
                    <th className="px-6 py-4">{t('history.totalPrice')}</th>
                    <th className="px-6 py-4">{t('history.status')}</th>
                    <th className="px-6 py-4 text-right">{t('history.action')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredBookings.map((b) => {
                    const evtDetails = eventsMap[b.eventId];
                    const { isWaitingApproval, isPaidConfirmed, isCancelled } = getBookingState(b);
                    
                    return (
                      <tr key={b.idBooking} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-blue-600">
                          {b.bookingCode}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-extrabold text-slate-800">
                            {evtDetails?.eventName || `Event ID: ${b.eventId}`}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{evtDetails?.city || '-'} • {t('history.categoryPrefix')} #{b.ticketId}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-500 font-medium">
                          {formatDate(b.bookingDate)}
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-700">
                          {b.numberOfTicket} {t('history.ticketsUnit')}
                        </td>
                        <td className="px-6 py-4 font-bold text-blue-600">
                          {formatRupiah(b.totalPrice)}
                        </td>
                        <td className="px-6 py-4">
                          {isPaidConfirmed ? (
                            <span className="px-2.5 py-1 rounded-full text-[9px] font-extrabold border bg-emerald-50 text-emerald-600 border-emerald-200 whitespace-nowrap">
                              CONFIRMED
                            </span>
                          ) : isWaitingApproval ? (
                            <span className="px-2.5 py-1 rounded-full text-[9px] font-extrabold border bg-blue-50 text-blue-700 border-blue-200 animate-pulse whitespace-nowrap">
                              MENUNGGU VERIFIKASI
                            </span>
                          ) : isCancelled ? (
                            <span className="px-2.5 py-1 rounded-full text-[9px] font-extrabold border bg-red-50 text-red-600 border-red-200 whitespace-nowrap">
                              {b.bookingStatus}
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[9px] font-extrabold border bg-amber-50 text-amber-600 border-amber-200 whitespace-nowrap">
                              MENUNGGU BAYAR
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          {isPaidConfirmed ? (
                            <div className="inline-flex items-center gap-1.5">
                              {/* Open Ticket Modal Button */}
                              <button
                                onClick={() => openTicketModal(b)}
                                title="Lihat E-Tiket & Cetak"
                                className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-lg transition-all inline-flex items-center gap-1.5 shadow-sm shadow-blue-500/20 active:scale-95 cursor-pointer text-xs"
                              >
                                <Ticket className="w-3.5 h-3.5" />
                                <span>Lihat Tiket</span>
                              </button>

                              {/* Send to Email Button */}
                              <button
                                onClick={() => handleResendEmail(b)}
                                disabled={sendingEmailId === b.idBooking}
                                title={t('history.sendEmail')}
                                className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                              >
                                {sendingEmailId === b.idBooking ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Mail className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          ) : isWaitingApproval ? (
                            <Link
                              to={`/payment/${b.idBooking}`}
                              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold rounded-lg transition-all inline-block shadow-sm"
                            >
                              {t('history.viewStatus')}
                            </Link>
                          ) : isCancelled ? (
                            <span className="text-[10px] text-slate-400 italic font-semibold">{t('history.closed')}</span>
                          ) : (
                            <Link
                              to={`/payment/${b.idBooking}`}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all inline-block shadow-sm"
                            >
                              {t('history.payNow')}
                            </Link>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>

      {/* ── PRINT MEDIA STYLING FOR BROWSER PRINT ── */}
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            #ticket-pdf-rendered-card, #ticket-pdf-rendered-card * {
              visibility: visible !important;
            }
            #ticket-pdf-rendered-card {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              background: #ffffff !important;
              padding: 0 !important;
              margin: 0 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              box-shadow: none !important;
            }
            @page {
              size: landscape;
              margin: 8mm;
            }
          }
        `}
      </style>

      {/* ── INTERACTIVE E-TICKET PREVIEW MODAL ── */}
      {ticketModalOpen && activePrintBooking && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-md overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) setTicketModalOpen(false); }}
        >
          <div className="relative w-full max-w-4xl my-auto space-y-4 animate-fadeIn">
            
            {/* Modal Control Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4 bg-white/90 backdrop-blur-md rounded-2xl border border-white/40 shadow-xl">
              <div className="flex items-center gap-2 pl-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-800">Pratinjau E-Tiket Resmi CamTix</span>
              </div>

              <div className="flex items-center gap-2">
                {/* Download PDF Button */}
                <button
                  onClick={() => downloadTicketPdf(activePrintBooking)}
                  disabled={downloadingPdf}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-md shadow-indigo-500/20 active:scale-95 cursor-pointer"
                >
                  {downloadingPdf ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Membuat PDF...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh PDF</span>
                    </>
                  )}
                </button>

                {/* Print Dialog Button */}
                <button
                  onClick={handlePrint}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak</span>
                </button>

                {/* Send Email Button */}
                <button
                  onClick={() => handleResendEmail(activePrintBooking)}
                  disabled={sendingEmailId === activePrintBooking.idBooking}
                  className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Kirim Email</span>
                </button>

                {/* Close Button */}
                <button
                  onClick={() => setTicketModalOpen(false)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ── ACTUAL VIP CONCERT BOARDING PASS (CAPTURED FOR PDF) ── */}
            <div 
              id="ticket-pdf-rendered-card"
              ref={ticketContentRef}
              className="border-2 border-slate-900 rounded-3xl overflow-hidden shadow-2xl bg-white text-slate-900 w-full"
            >
              {/* Header */}
              <div className="bg-slate-950 text-white p-5 sm:p-6 flex items-center justify-between border-b-2 border-slate-900">
                <div className="flex items-center gap-3">
                  <span className="p-2 rounded-xl bg-indigo-600 text-white shadow-md">
                    <Music className="w-5 h-5" />
                  </span>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black tracking-wider uppercase text-white flex items-center gap-2">
                      CAMTIX <span className="text-[10px] bg-indigo-500/30 text-indigo-300 border border-indigo-400/40 px-2 py-0.5 rounded-full font-bold tracking-widest">OFFICIAL E-TICKET</span>
                    </h1>
                    <p className="text-[10px] text-slate-400 tracking-widest font-semibold uppercase mt-0.5">
                      Verified Digital Concert Admission Pass
                    </p>
                  </div>
                </div>

                <div className="text-right hidden sm:block">
                  <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[11px] font-black uppercase tracking-wider">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    AUTHENTIC & VALID
                  </span>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">ID: #{activePrintBooking.idBooking}</p>
                </div>
              </div>

              {/* Main Ticket Grid */}
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_240px]">
                
                {/* Left info column */}
                <div className="p-5 sm:p-6 space-y-4">
                  
                  {/* Event Title & Poster Preview */}
                  <div className="flex items-start gap-4">
                    {printEvent?.picture ? (
                      <img 
                        src={printEvent.picture} 
                        alt={printEvent.eventName}
                        crossOrigin="anonymous"
                        className="w-20 h-24 rounded-2xl object-cover border border-slate-200 flex-shrink-0 shadow-sm"
                      />
                    ) : (
                      <div className="w-20 h-24 rounded-2xl bg-indigo-50 border border-indigo-100 flex flex-col items-center justify-center text-indigo-500 flex-shrink-0">
                        <Music className="w-7 h-7" />
                        <span className="text-[8px] font-bold uppercase mt-1">CamTix</span>
                      </div>
                    )}

                    <div className="space-y-1">
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-black uppercase tracking-wider">
                        {printEvent?.category || 'Live Concert'} • VIP Pass
                      </span>
                      <h2 className="text-lg sm:text-xl font-black text-slate-950 leading-tight">
                        {printEvent?.eventName || `Concert Event #${activePrintBooking.eventId}`}
                      </h2>
                      {printEvent?.artistName && (
                        <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
                          By {printEvent.artistName}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Event Schedule & Location Card */}
                  <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-indigo-600" /> TANGGAL EVENT
                      </span>
                      <strong className="text-xs font-black text-slate-900 block">
                        {printEvent?.eventDate || '-'}
                      </strong>
                      <span className="text-[10px] text-slate-500 font-semibold block">
                        Waktu: {printEvent?.eventTime || '19:00'} WIB
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-rose-500" /> LOKASI VENUE
                      </span>
                      <strong className="text-xs font-black text-slate-900 block">
                        {printEvent?.city || 'Jakarta'}
                      </strong>
                      <span className="text-[10px] text-slate-500 font-semibold block line-clamp-1">
                        {printEvent?.location || 'Stadium Arena'}
                      </span>
                    </div>
                  </div>

                  {/* Customer Details & Pricing */}
                  <div className="grid grid-cols-3 gap-2 pt-2 text-xs border-t border-slate-100">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">PEMESAN</span>
                      <strong className="text-slate-800 font-bold block truncate text-[11px]">{user?.fullName || 'Customer'}</strong>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">KUANTITAS</span>
                      <strong className="text-slate-800 font-bold block text-[11px]">{activePrintBooking.numberOfTicket} Tiket</strong>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">TOTAL BAYAR</span>
                      <strong className="text-indigo-600 font-black block text-[11px]">{formatRupiah(activePrintBooking.totalPrice)}</strong>
                    </div>
                  </div>
                </div>

                {/* Perforated Divider */}
                <div className="border-t-2 md:border-t-0 md:border-l-2 border-dashed border-slate-300 relative flex md:flex-col justify-between" />

                {/* Right QR Stub */}
                <div className="bg-slate-50/90 p-5 flex flex-col items-center justify-between text-center space-y-3">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 block">
                      GATE CHECKPOINT PASS
                    </span>
                    <p className="text-xs font-mono font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-200">
                      {activePrintBooking.bookingCode}
                    </p>
                  </div>

                  {/* High-res Base64 QR Code */}
                  <div className="p-2 bg-white rounded-2xl border-2 border-slate-900 shadow-sm flex flex-col items-center">
                    {activeQrDataUrl ? (
                      <img 
                        src={activeQrDataUrl} 
                        alt="Entry QR Code"
                        className="w-28 h-28 object-contain"
                      />
                    ) : (
                      <div className="w-28 h-28 bg-slate-100 flex items-center justify-center text-[10px] text-slate-400">
                        Generating QR...
                      </div>
                    )}
                    <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                      Scan at Gate Checkpoint
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase">
                      CONFIRMED (PAID)
                    </span>
                    <p className="text-[8px] text-slate-400">Tgl: {formatDate(activePrintBooking.bookingDate)}</p>
                  </div>
                </div>

              </div>

              {/* Ticket Footer Disclaimer */}
              <div className="bg-slate-100 p-3 border-t-2 border-slate-900 text-center text-[9px] text-slate-500 leading-tight">
                <p className="font-semibold text-slate-700">
                  Tunjukkan QR Code ini pada scanner gate masuk venue. Tiket ini sah dan dilindungi hak cipta oleh CamTix Ticketing Solutions.
                </p>
                <p className="text-[8px] text-slate-400 mt-0.5">
                  Dilarang membagikan barcode/QR kepada pihak lain. 1 Tiket berlaku untuk 1 kali scan masuk gate.
                </p>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
