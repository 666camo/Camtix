import ETicket from '../components/ETicket';
import useDialogFocus from '../components/useDialogFocus';
import PageHeading from '../components/PageHeading';
import { useCallback, useState, useEffect, useRef } from 'react';
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
  Mail, 
  Ticket,
  Download,
  Printer,
  Loader2,
  X,
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
  useDialogFocus(ticketModalOpen, () => setTicketModalOpen(false), '.ticket-dialog');

  // Generate Base64 QR code locally
  const generateQrCode = async (text) => {
    try {
      return await QRCode.toDataURL(text, {
        width: 300,
        margin: 4,
        color: {
          dark: '#191a20',
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
          backgroundColor: '#ffffff',
          windowWidth: 1200,
          onclone: (document) => document.getElementById('ticket-pdf-rendered-card')?.classList.add('ticket-export')
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

  const fetchHistory = useCallback(async (showToast = false) => {
    if (!user) return;
    try {
      // 1. Fetch user bookings
      const bookingsRes = await bookingService.getBookingsByUserId(user.idUser);
      setError('');
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
      } catch {
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
  }, [user, t]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Starts an async server request; responses update state.
    fetchHistory();
  }, [user, navigate, fetchHistory]);

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
    } catch {
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
      <div className="public-page orderhistory-page gradient-bg min-h-screen text-fg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-border border-t-blue-500 animate-spin"></div>
          <p className="text-fg-secondary text-sm font-medium">{t('history.loading')}</p>
        </div>
      </div>
    );
  }

  const printEvent = activePrintBooking ? eventsMap[activePrintBooking.eventId] : null;

  return (
    <div className="public-page orderhistory-page gradient-bg min-h-screen text-fg pb-20 pt-28 px-6 md:px-12">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Title */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6">
          <PageHeading variant="utility" eyebrow={t('history.badge')} title={t('history.title')} accent={t('history.titleHighlight')} description={t('history.subtitle')} />
          
          <button
            onClick={() => { setLoading(true); setError(''); fetchHistory(true); }}
            className="px-4 py-2.5 bg-surface rounded-xl text-xs font-bold hover:bg-surface border border-border text-fg-secondary transition-colors flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5 text-fg-secondary" />
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
        <div className="glass-effect rounded-2xl p-6 border border-border space-y-6">
          
          {/* Filters */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h3 className="text-lg font-bold flex items-center gap-2 text-fg">
              <ClipboardList className="w-5 h-5 text-fg-secondary" /> {t('history.transactionList')}
            </h3>
            
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('history.searchPlaceholder')}
                className="w-full md:w-64 bg-surface border border-border focus:border-brand rounded-xl px-4 py-2.5 text-xs text-fg focus:outline-none transition-colors"
              />
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-surface border border-border focus:border-brand rounded-xl px-4 py-2.5 text-xs text-fg-secondary focus:outline-none transition-colors"
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
          <div className="history-table overflow-x-auto border border-border bg-surface">
            {filteredBookings.length === 0 ? (
              <div className="py-16 text-center text-fg-secondary text-sm font-semibold">
                {t('history.noData')}
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface text-xs font-semibold text-fg-secondary uppercase tracking-wider border-b border-border">
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
                      <tr key={b.idBooking} className="hover:bg-surface/50 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-brand">
                          {b.bookingCode}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-extrabold text-fg">
                            {evtDetails?.eventName || `Event ID: ${b.eventId}`}
                          </div>
                          <div className="text-[10px] text-fg-secondary mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-fg-muted" />
                            <span>{evtDetails?.city || '-'} • {t('history.categoryPrefix')} #{b.ticketId}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-fg-secondary font-medium">
                          {formatDate(b.bookingDate)}
                        </td>
                        <td className="px-6 py-4 font-bold text-fg-secondary">
                          {b.numberOfTicket} {t('history.ticketsUnit')}
                        </td>
                        <td className="px-6 py-4 font-bold text-brand">
                          {formatRupiah(b.totalPrice)}
                        </td>
                        <td className="px-6 py-4">
                          {isPaidConfirmed ? (
                            <span className="px-2.5 py-1 rounded-full text-[9px] font-extrabold border bg-emerald-50 text-emerald-600 border-emerald-200 whitespace-nowrap">
                              CONFIRMED
                            </span>
                          ) : isWaitingApproval ? (
                            <span className="px-2.5 py-1 rounded-full text-[9px] font-extrabold border bg-brand/10 text-brand border-border animate-pulse whitespace-nowrap">
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
                                className="px-3 py-1.5 bg-brand hover:bg-brand-hover text-white font-bold rounded-lg transition-all inline-flex items-center gap-1.5 shadow-sm shadow-card active:scale-95 cursor-pointer text-xs"
                              >
                                <Ticket className="w-3.5 h-3.5" />
                                <span>Lihat Tiket</span>
                              </button>

                              {/* Send to Email Button */}
                              <button
                                onClick={() => handleResendEmail(b)}
                                disabled={sendingEmailId === b.idBooking}
                                title={t('history.sendEmail')}
                                className="p-1.5 bg-brand/10 hover:bg-brand/10 text-brand border border-border rounded-lg transition-colors cursor-pointer disabled:opacity-50"
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
                              className="px-3 py-1.5 bg-brand/10 hover:bg-brand/10 text-brand border border-border font-bold rounded-lg transition-all inline-block shadow-sm"
                            >
                              {t('history.viewStatus')}
                            </Link>
                          ) : isCancelled ? (
                            <span className="text-[10px] text-fg-muted italic font-semibold">{t('history.closed')}</span>
                          ) : (
                            <Link
                              to={`/payment/${b.idBooking}`}
                              className="px-3 py-1.5 bg-brand hover:bg-brand-hover text-white font-bold rounded-lg transition-all inline-block shadow-sm"
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
          role="dialog" aria-modal="true" aria-label="Pratinjau e-tiket CamTix"
          className="ticket-dialog fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-md overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) setTicketModalOpen(false); }}
        >
          <div className="ticket-modal relative w-full max-w-4xl my-auto space-y-4">
            
            {/* Modal Control Bar */}
            <div className="ticket-modal-toolbar">
              <div className="flex items-center gap-2 pl-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-fg">Pratinjau E-Tiket Resmi CamTix</span>
              </div>

              <div className="flex items-center gap-2">
                {/* Download PDF Button */}
                <button
                  onClick={() => downloadTicketPdf(activePrintBooking)}
                  disabled={downloadingPdf}
                  className="px-4 py-2 bg-brand hover:bg-brand-hover disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-md shadow-indigo-500/20 active:scale-95 cursor-pointer"
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
                  className="px-3.5 py-2 bg-surface-hover hover:bg-surface-hover text-fg-secondary font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak</span>
                </button>

                {/* Send Email Button */}
                <button
                  onClick={() => handleResendEmail(activePrintBooking)}
                  disabled={sendingEmailId === activePrintBooking.idBooking}
                  className="px-3.5 py-2 bg-brand/10 hover:bg-brand/10 text-brand border border-border font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Kirim Email</span>
                </button>

                {/* Close Button */}
                <button
                  aria-label="Tutup pratinjau tiket"
                  onClick={() => setTicketModalOpen(false)}
                  className="p-2 rounded-xl bg-surface-hover hover:bg-surface-hover text-fg-secondary transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <ETicket booking={activePrintBooking} event={printEvent} user={user} qr={activeQrDataUrl} confirmed={getBookingState(activePrintBooking).isPaidConfirmed} ticketRef={ticketContentRef} />

          </div>
        </div>
      )}

    </div>
  );
}
