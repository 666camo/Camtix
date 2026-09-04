import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import bookingService from '../../services/bookingService';
import eventService from '../../services/eventService';
import userService from '../../services/userService';
import { ClipboardList, RefreshCw } from 'lucide-react';

function statusBadge(status) {
  const map = {
    CONFIRMED: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    PENDING:   'text-amber-600 bg-amber-50 border-amber-200',
    CANCELLED: 'text-red-600 bg-red-50 border-red-200',
  };
  return map[status] || 'text-slate-500 bg-slate-100 border-slate-200';
}

export default function BookingAdmin() {
  const { t } = useTranslation();
  const [bookings, setBookings] = useState([]);
  const [eventsMap, setEventsMap] = useState({});
  const [usersMap, setUsersMap] = useState({});
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const bRes = await bookingService.getAllBookings().catch(() => null);
      if (bRes && bRes.data) {
        setBookings(bRes.data);
      }

      const eRes = await eventService.getAllEvents().catch(() => null);
      if (eRes && eRes.data) {
        const map = {};
        eRes.data.forEach(e => { map[e.idEvent] = e.eventName; });
        setEventsMap(map);
      }

      const uRes = await userService.getAllUsers().catch(() => null);
      if (uRes && uRes.data) {
        const map = {};
        uRes.data.forEach(u => { map[u.idUser] = `${u.firstName} ${u.lastName}`; });
        setUsersMap(map);
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const formatRupiah = (value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

  const filtered = bookings.filter((b) => {
    const q = searchQuery.toLowerCase();
    const eventName = (eventsMap[b.eventId] || '').toLowerCase();
    const userName = (usersMap[b.userId] || '').toLowerCase();
    
    const matchQ = !q || b.bookingCode.toLowerCase().includes(q) || eventName.includes(q) || userName.includes(q);
    const matchS = !filterStatus || b.bookingStatus === filterStatus;
    
    return matchQ && matchS;
  });

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-slate-700" /> {t('admin.bookingDataTitle')}
          </h1>
          <p className="text-sm text-slate-500 mt-1">{t('admin.bookingDataSubtitle')}</p>
        </div>
        <button onClick={fetchData} className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center gap-2 active:scale-95">
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          <span>{t('common.refresh')}</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('admin.searchBookingPlaceholder')}
          className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-blue-400 shadow-sm"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-blue-400 shadow-sm"
        >
          <option value="">{t('admin.allStatus')}</option>
          <option value="PENDING">PENDING</option>
          <option value="CONFIRMED">CONFIRMED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm overflow-x-auto">
        <div className="grid grid-cols-[auto_1fr_1fr_auto_auto_auto] gap-4 px-5 py-3 border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold text-slate-500 uppercase tracking-widest min-w-[700px]">
          <span>{t('admin.colBookingDate')}</span>
          <span>{t('admin.colBookingInfo')}</span>
          <span>{t('admin.colCustomer')}</span>
          <span className="text-right">{t('admin.colTotalTickets')}</span>
          <span className="text-right">{t('admin.colPrice')}</span>
          <span className="text-center">{t('admin.colStatus')}</span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-500 text-sm font-medium">{t('admin.loadingBookingData')}</div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm font-bold">{t('admin.noBookingDataFound')}</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((b) => (
              <div key={b.idBooking} className="grid grid-cols-[auto_1fr_1fr_auto_auto_auto] gap-4 items-center px-5 py-4 hover:bg-slate-50 transition-colors min-w-[700px]">
                <span className="text-xs font-semibold text-slate-500">
                  {b.bookingDate ? b.bookingDate.replace('T', ' ').substring(0, 16) : '-'}
                </span>
                
                <div className="min-w-0">
                  <p className="text-sm font-bold text-blue-600 font-mono truncate">{b.bookingCode}</p>
                  <p className="text-[11px] text-slate-600 truncate mt-0.5 font-semibold">
                    Evt: {eventsMap[b.eventId] || `#${b.eventId}`}
                  </p>
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{usersMap[b.userId] || `User #${b.userId}`}</p>
                </div>

                <span className="text-sm font-extrabold text-slate-700 text-right">{b.numberOfTicket}</span>
                <span className="text-sm font-bold text-slate-800 text-right">{formatRupiah(b.totalPrice)}</span>

                <div className="flex justify-center">
                  <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${statusBadge(b.bookingStatus)}`}>
                    {b.bookingStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
