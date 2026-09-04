import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import eventService from '../services/eventService';
import bookingService from '../services/bookingService';
import { AlertCircle, User, Calendar, MapPin } from 'lucide-react';

export default function Booking() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const eventIdParam = searchParams.get('eventId');
  const ticketIdParam = searchParams.get('ticketId');

  const [event, setEvent] = useState(null);
  const [ticket, setTicket] = useState(null);
  const [numberOfTicket, setNumberOfTicket] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

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

  useEffect(() => {
    if (!user) {
      navigate(`/login?redirect=/booking?eventId=${eventIdParam}&ticketId=${ticketIdParam}`);
      return;
    }

    if (['ADMIN_CAMTIX', 'ADMIN_APLIKASI'].includes(user.role)) {
      setError(t('booking.adminBlocked'));
      setLoading(false);
      return;
    }

    if (!eventIdParam || !ticketIdParam) {
      setError(t('booking.incompleteCriteria'));
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const eventRes = await eventService.getEventById(eventIdParam);
        if (eventRes && eventRes.data) {
          const evData = eventRes.data;
          setEvent(evData);

          if (evData.status === 'CANCELLED') {
            setError(t('booking.eventCancelled'));
            setLoading(false);
            return;
          }

          if (isEventExpired(evData)) {
            setError(t('booking.eventExpired'));
            setLoading(false);
            return;
          }
        }

        const ticketRes = await eventService.getTicketsByEventId(eventIdParam);
        if (ticketRes && ticketRes.data) {
          const selectedTicket = ticketRes.data.find(
            (tItem) => tItem.idTicket === parseInt(ticketIdParam, 10)
          );
          if (selectedTicket) {
            setTicket(selectedTicket);
            setTotalPrice(selectedTicket.price);
          } else {
            setError(t('booking.ticketNotFound'));
          }
        }
      } catch (err) {
        console.error(err);
        setError(t('booking.loadParamFail'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, eventIdParam, ticketIdParam]);

  useEffect(() => {
    if (ticket) {
      setTotalPrice(ticket.price * numberOfTicket);
    }
  }, [numberOfTicket, ticket]);

  const handleQtyChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (isNaN(value) || value < 1) {
      setNumberOfTicket(1);
    } else if (ticket && value > ticket.stock) {
      setNumberOfTicket(ticket.stock);
    } else {
      setNumberOfTicket(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError(t('booking.sessionExpired'));
      return;
    }
    if (!ticket) {
      setError(t('booking.invalidCategory'));
      return;
    }
    if (isEventExpired(event)) {
      setError(t('booking.eventExpired'));
      toast.error(t('booking.eventExpired'));
      return;
    }

    setSubmitting(true);
    setError('');

    const payload = {
      userId: user.idUser,
      eventId: event.idEvent,
      ticketId: ticket.idTicket,
      numberOfTicket: numberOfTicket,
      totalPrice: totalPrice
    };

    try {
      const response = await bookingService.createBooking(payload);
      if (response && response.data) {
        toast.success(t('booking.bookingSuccess'));
        navigate(`/payment/${response.data.idBooking}`);
      } else {
        setError(t('booking.emptyResponse'));
        toast.error(t('booking.emptyResponse'));
      }
    } catch (err) {
      const msg = err.response?.data?.message || t('booking.createFail');
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
          <p className="text-slate-500 text-sm font-medium">{t('booking.loading')}</p>
        </div>
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="gradient-bg min-h-screen text-slate-800 flex items-center justify-center px-6">
        <div className="glass-effect rounded-2xl p-8 max-w-md w-full border border-slate-200 text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold text-red-600">{t('booking.errorTitle')}</h2>
          <p className="text-sm text-slate-500">{error}</p>
          <Link to="/" className="inline-block px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all">
            {t('booking.backCatalog')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="gradient-bg min-h-screen text-slate-800 pb-20 pt-28 px-6 md:px-12">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Title */}
        <div className="text-center md:text-left">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            {t('booking.badge')}
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight mt-2 text-slate-800">
            {t('booking.title')} <span className="gradient-text">{t('booking.titleHighlight')}</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {t('booking.subtitle')}
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-600 text-sm flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <p className="flex-1">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Booking Config Form */}
          <div className="md:col-span-2 space-y-6">
            <div className="glass-effect rounded-2xl p-6 md:p-8 border border-slate-200">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2 border-b border-slate-100 pb-3 text-slate-800">
                <User className="w-5 h-5 text-slate-700" /> {t('booking.userData')}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6 text-sm">
                <div>
                  <span className="text-xs text-slate-500 font-semibold block uppercase tracking-wider">{t('booking.fullName')}</span>
                  <span className="font-bold text-slate-800 mt-1 block">{user?.fullName || '-'}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-semibold block uppercase tracking-wider">{t('booking.email')}</span>
                  <span className="font-bold text-slate-800 mt-1 block">{user?.email || '-'}</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">{t('booking.ticketQty')}</label>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      disabled={numberOfTicket <= 1}
                      onClick={() => setNumberOfTicket((prev) => Math.max(1, prev - 1))}
                      className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center font-black text-xl hover:bg-slate-100 cursor-pointer disabled:opacity-40 transition-colors text-slate-700"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={numberOfTicket}
                      onChange={handleQtyChange}
                      required
                      min="1"
                      max={ticket?.stock || 10}
                      className="w-20 text-center bg-white border border-slate-200 focus:border-blue-400 rounded-xl py-3 text-lg font-bold focus:outline-none transition-colors text-slate-800"
                    />
                    <button
                      type="button"
                      disabled={ticket && numberOfTicket >= ticket.stock}
                      onClick={() => setNumberOfTicket((prev) => Math.min(ticket ? ticket.stock : 10, prev + 1))}
                      className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center font-black text-xl hover:bg-slate-100 cursor-pointer disabled:opacity-40 transition-colors text-slate-700"
                    >
                      +
                    </button>
                    
                    {ticket && (
                      <span className="text-xs text-slate-500 font-medium">
                        {t('booking.remainingQuota')} <strong className="text-blue-600 font-bold">{ticket.stock} {t('booking.ticketsUnit')}</strong>
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex flex-col gap-2">
                  <span className="text-[11px] text-slate-500 font-medium flex items-start gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" /> {t('booking.sessionNotice')}
                  </span>
                  
                  <button
                    type="submit"
                    disabled={submitting || (ticket && ticket.stock <= 0)}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-500 text-white font-bold rounded-xl shadow-sm shadow-blue-500/20 hover:shadow-blue-500/30 active:scale-95 transition-all text-sm flex items-center justify-center gap-2 cursor-pointer mt-4"
                  >
                    {submitting ? (
                      <>
                        <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                        <span>{t('booking.creatingBooking')}</span>
                      </>
                    ) : (
                      <span>{t('booking.confirmBooking')}</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Pricing Details Panel */}
          <div className="space-y-6">
            <div className="glass-effect rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
              <div className="h-28 overflow-hidden bg-slate-100 relative">
                {event?.picture && (
                  <img
                    src={event.picture}
                    alt={event.eventName}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                <span className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md border border-white/20 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {t('booking.category')} {ticket?.ticketType}
                </span>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-800">{event?.eventName}</h4>
                  <span className="text-[10px] text-slate-500 mt-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" /> {event?.eventDate} • <MapPin className="w-3.5 h-3.5 text-slate-400" /> {event?.city}
                  </span>
                </div>
                
                <div className="border-t border-slate-100 pt-4 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-slate-500">
                    <span>{t('booking.categoryPrice')}</span>
                    <span className="font-semibold text-slate-700">{formatRupiah(ticket?.price || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-500">
                    <span>{t('booking.totalTickets')}</span>
                    <span className="font-semibold text-slate-700">x {numberOfTicket}</span>
                  </div>
                  
                  <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-sm font-extrabold">
                    <span className="text-slate-800">{t('booking.totalPrice')}</span>
                    <span className="text-blue-600 text-base">{formatRupiah(totalPrice)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
