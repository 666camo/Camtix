import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import eventService from '../../services/eventService';
import userService from '../../services/userService';
import api from '../../services/api';
import SpotlightCard from '../../components/SpotlightCard';
import {
  Calendar,
  Users,
  FileText,
  CheckCircle2,
  DollarSign,
  Eye,
  CreditCard,
  Zap,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

function StatCard({ label, value, icon: Icon, colorClass, loading, sub, spotlightColor }) {
  return (
    <SpotlightCard 
      spotlightColor={spotlightColor || 'rgba(59, 130, 246, 0.08)'} 
      bgColor="bg-white" 
      borderClass="border-slate-200/80" 
      className="rounded-2xl"
    >
      <div className={`p-6 relative overflow-hidden group transition-all h-full ${colorClass}`}>
        <div className="absolute -top-4 -right-4 w-20 h-20 bg-slate-50 rounded-full group-hover:scale-125 transition-transform duration-500 -z-10"></div>
        <div className="flex items-start justify-between mb-4">
          <span className="text-slate-500"><Icon className="w-6 h-6" /></span>
        </div>
        <div className="text-3xl font-black text-slate-800 mb-1">
          {loading ? (
            <span className="inline-block w-16 h-8 bg-slate-200 rounded animate-pulse"></span>
          ) : value}
        </div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">{label}</p>
        {sub && <p className="text-[10px] text-slate-400 mt-1">{sub}</p>}
      </div>
    </SpotlightCard>
  );
}

function RecentCard({ title, icon: Icon, children, linkTo, linkLabel }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
        <h3 className="text-sm font-bold flex items-center gap-2 text-slate-800">
          <Icon className="w-4 h-4 text-slate-500" /> {title}
        </h3>
        {linkTo && (
          <Link to={linkTo} className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">
            {linkLabel} →
          </Link>
        )}
      </div>
      <div className="divide-y divide-slate-100">{children}</div>
    </div>
  );
}

export default function Dashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isOperationalAdmin = user?.role === 'ADMIN_CAMTIX';

  const [stats, setStats] = useState({
    totalEvents: 0,
    totalUsers: 0,
    totalBookings: 0,
    totalPaidPayments: 0,
    totalRevenue: 0,
    totalVisitors: 0,
  });

  const [recentBookings, setRecentBookings] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');

    try {
      const results = await Promise.allSettled([
        eventService.getAllEvents(),
        userService.getAllUsers(),
        api.get('/api/bookings'),
        api.get('/api/payments'),
        api.get('/api/visitors'),
      ]);

      const eventsData = results[0].status === 'fulfilled' && results[0].value?.data
        ? results[0].value.data : [];

      const usersData = results[1].status === 'fulfilled' && results[1].value?.data
        ? results[1].value.data : [];

      const bookingsData = results[2].status === 'fulfilled' && results[2].value?.data?.data
        ? results[2].value.data.data : [];

      const paymentsData = results[3].status === 'fulfilled' && results[3].value?.data?.data
        ? results[3].value.data.data : [];

      const visitorsData = results[4].status === 'fulfilled' && results[4].value?.data?.data
        ? results[4].value.data.data : [];

      const paidPayments = paymentsData.filter(p => p.paymentStatus === 'PAID');
      const totalRevenue = paidPayments.reduce((sum, p) => sum + (parseFloat(p.totalPayment) || 0), 0);

      setStats({
        totalEvents: eventsData.length,
        totalUsers: usersData.length,
        totalBookings: bookingsData.length,
        totalPaidPayments: paidPayments.length,
        totalRevenue,
        totalVisitors: visitorsData.length,
      });

      setRecentEvents([...eventsData].reverse().slice(0, 5));
      setRecentBookings([...bookingsData].reverse().slice(0, 5));
      setRecentPayments([...paymentsData].reverse().slice(0, 5));

    } catch (err) {
      console.error(err);
      setError(t('admin.loadError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatRupiah = (value) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

  const bookingStatusColor = (s) => {
    if (s === 'CONFIRMED') return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (s === 'PENDING') return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-red-700 bg-red-50 border-red-200';
  };

  const paymentStatusColor = (s) => {
    if (s === 'PAID') return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (s === 'WAITING_CONFIRMATION') return 'text-blue-700 bg-blue-50 border-blue-200';
    if (s === 'PENDING') return 'text-amber-700 bg-amber-50 border-amber-200';
    if (s === 'REJECTED') return 'text-red-700 bg-red-50 border-red-200';
    return 'text-slate-600 bg-slate-100 border-slate-300';
  };

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Page header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-800">
            {t('admin.welcomeBack')}{' '}
            <span className="text-blue-600">
              {user?.fullName?.split(' ')[0] || 'Admin'}
            </span>{' '}
            👋
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {t('admin.dashboardSubtitle')}
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 disabled:opacity-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-sm transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
          {t('admin.refreshData')}
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-xl border border-red-200 bg-red-50 text-red-600 text-xs flex items-center gap-2 font-medium">
          <AlertTriangle className="w-4 h-4 text-red-500" /> {error}
        </div>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
        <StatCard
          label={t('admin.totalEvents')}
          value={stats.totalEvents}
          icon={Calendar}
          loading={loading}
          colorClass="shadow-blue-100/50"
          sub={t('admin.eventsSub')}
          spotlightColor="rgba(59, 130, 246, 0.08)"
        />
        <StatCard
          label={t('admin.totalUsers')}
          value={stats.totalUsers}
          icon={Users}
          loading={loading}
          colorClass="shadow-blue-100/50"
          sub={t('admin.usersSub')}
          spotlightColor="rgba(59, 130, 246, 0.08)"
        />
        <StatCard
          label={t('admin.totalBookings')}
          value={stats.totalBookings}
          icon={FileText}
          loading={loading}
          colorClass="shadow-blue-100/50"
          sub={t('admin.bookingsSub')}
          spotlightColor="rgba(59, 130, 246, 0.08)"
        />
        <StatCard
          label={t('admin.paidPayments')}
          value={stats.totalPaidPayments}
          icon={CheckCircle2}
          loading={loading}
          colorClass="shadow-emerald-100/50"
          sub={t('admin.paidPaymentsSub')}
          spotlightColor="rgba(16, 185, 129, 0.08)"
        />
        <StatCard
          label={t('admin.totalRevenue')}
          value={loading ? '—' : formatRupiah(stats.totalRevenue)}
          icon={DollarSign}
          loading={false}
          colorClass="shadow-emerald-100/50"
          sub={t('admin.revenueSub')}
          spotlightColor="rgba(16, 185, 129, 0.08)"
        />
        <StatCard
          label={t('admin.totalVisitors')}
          value={stats.totalVisitors}
          icon={Eye}
          loading={loading}
          colorClass="shadow-slate-200/50"
          sub={t('admin.visitorsSub')}
          spotlightColor="rgba(100, 116, 139, 0.08)"
        />
      </div>

      {/* Event Status Breakdown */}
      {!loading && recentEvents.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['UPCOMING', 'ONGOING', 'FINISHED'].map((status) => {
            const count = recentEvents.filter(e => e.status === status).length;
            const colors = {
              UPCOMING: 'text-blue-700 border-blue-200 bg-blue-50',
              ONGOING: 'text-emerald-700 border-emerald-200 bg-emerald-50',
              FINISHED: 'text-slate-600 border-slate-200 bg-slate-50',
            };
            return (
              <div key={status} className={`flex items-center justify-between px-5 py-3.5 rounded-xl border ${colors[status]}`}>
                <span className="text-xs font-bold uppercase tracking-widest">{status}</span>
                <span className="text-2xl font-black">{count}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Recent activity tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Bookings */}
        <RecentCard
          title={t('admin.recentBookings')}
          icon={FileText}
          linkTo="/admin/bookings"
          linkLabel={t('admin.viewAll')}
        >
          {loading ? (
            <div className="p-6 text-center text-slate-400 text-sm">{t('common.loading')}</div>
          ) : recentBookings.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-sm">{t('admin.noBookingData')}</div>
          ) : (
            recentBookings.map((b) => (
              <div key={b.idBooking} className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50 transition-colors">
                <div>
                  <p className="text-xs font-bold font-mono text-blue-600">{b.bookingCode}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{b.numberOfTicket} {t('history.ticketsUnit')} • {formatRupiah(b.totalPrice)}</p>
                </div>
                <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${bookingStatusColor(b.bookingStatus)}`}>
                  {b.bookingStatus}
                </span>
              </div>
            ))
          )}
        </RecentCard>

        {/* Recent Payments */}
        <RecentCard
          title={t('admin.recentPayments')}
          icon={CreditCard}
          linkTo="/admin/payments"
          linkLabel={t('admin.viewAll')}
        >
          {loading ? (
            <div className="p-6 text-center text-slate-400 text-sm">{t('common.loading')}</div>
          ) : recentPayments.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-sm">{t('admin.noPaymentData')}</div>
          ) : (
            recentPayments.map((p) => (
              <div key={p.idPayment} className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50 transition-colors">
                <div>
                  <p className="text-xs font-bold text-slate-700">Booking #{p.bookingId}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{formatRupiah(p.totalPayment)}</p>
                </div>
                <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${paymentStatusColor(p.paymentStatus)}`}>
                  {p.paymentStatus}
                </span>
              </div>
            ))
          )}
        </RecentCard>

        {/* Recent Events */}
        <RecentCard
          title={t('admin.registeredEvents')}
          icon={Calendar}
          linkTo="/admin/events"
          linkLabel={t('admin.manageEvents')}
        >
          {loading ? (
            <div className="p-6 text-center text-slate-400 text-sm">{t('common.loading')}</div>
          ) : recentEvents.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-sm">{t('admin.noEventData')}</div>
          ) : (
            recentEvents.map((e) => (
              <div key={e.idEvent} className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50 transition-colors">
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-slate-700 truncate">{e.eventName}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">📍 {e.city} • {e.eventDate}</p>
                </div>
                <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border flex-shrink-0 ml-3 ${
                  e.status === 'UPCOMING' ? 'text-blue-700 bg-blue-50 border-blue-200' :
                  e.status === 'ONGOING' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' :
                  'text-slate-600 bg-slate-100 border-slate-300'
                }`}>
                  {e.status}
                </span>
              </div>
            ))
          )}
        </RecentCard>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="text-sm font-bold flex items-center gap-2 text-slate-800">
            <Zap className="w-4 h-4 text-amber-500 animate-pulse" /> {t('admin.quickActions')}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: isOperationalAdmin ? t('admin.addEventAction') : t('admin.eventDataAction'), icon: Calendar, path: '/admin/events' },
              { label: isOperationalAdmin ? t('admin.verifyPaymentAction') : t('admin.paymentDataAction'), icon: CheckCircle2, path: '/admin/payments' },
              { label: isOperationalAdmin ? t('admin.manageUserAction') : t('admin.userDataAction'), icon: Users, path: '/admin/users' },
              { label: t('admin.viewBookingAction'), icon: FileText, path: '/admin/bookings' },
            ].map((action) => (
              <Link
                key={action.path}
                to={action.path}
                className="flex flex-col items-center justify-center gap-2 p-4 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-xl text-xs font-bold text-slate-600 hover:text-blue-700 transition-all text-center cursor-pointer"
              >
                <action.icon className="w-5 h-5 text-slate-500 group-hover:text-blue-600" />
                <span>{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
