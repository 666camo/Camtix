import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import eventService from '../../services/eventService';
import userService from '../../services/userService';
import api from '../../services/api';
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

function StatCard({ label, value, icon: Icon, loading, sub }) {
  return <article className="admin-stat">
    <div className="admin-stat-top"><span>{label}</span><Icon size={19} aria-hidden="true" /></div>
    <div className="admin-stat-value" aria-live="polite">{loading ? <span className="admin-stat-skeleton" /> : (value ?? '—')}</div>
    {sub && <p>{sub}</p>}
  </article>;
}

function RecentCard({ title, icon: Icon, children, linkTo, linkLabel }) {
  return (
    <div className="admin-recent bg-surface border border-border overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface">
        <h3 className="text-sm font-bold flex items-center gap-2 text-fg">
          <Icon className="w-4 h-4 text-fg-muted" /> {title}
        </h3>
        {linkTo && (
          <Link to={linkTo} className="text-xs font-bold text-brand hover:text-brand transition-colors">
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
  const [eventCounts, setEventCounts] = useState({});
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

      if (results.some(result => result.status === 'rejected')) setError(t('admin.loadError'));

      const eventsData = results[0].status === 'fulfilled' && results[0].value?.data
        ? results[0].value.data : [];

      const usersPayload = results[1].status === 'fulfilled' ? results[1].value?.data : null;
      const usersData = Array.isArray(usersPayload) ? usersPayload : (usersPayload?.content || []);

      const bookingsData = results[2].status === 'fulfilled' && results[2].value?.data?.data
        ? results[2].value.data.data : [];

      const paymentsData = results[3].status === 'fulfilled' && results[3].value?.data?.data
        ? results[3].value.data.data : [];

      const visitorsData = results[4].status === 'fulfilled' && results[4].value?.data?.data
        ? results[4].value.data.data : [];

      const paidPayments = paymentsData.filter(p => p.paymentStatus === 'PAID');
      const totalRevenue = paidPayments.reduce((sum, p) => sum + (parseFloat(p.totalPayment) || 0), 0);

      setStats({
        totalEvents: results[0].status === 'fulfilled' ? eventsData.length : null,
        totalUsers: results[1].status === 'fulfilled' ? (usersPayload?.totalElements ?? usersData.length) : null,
        totalBookings: results[2].status === 'fulfilled' ? bookingsData.length : null,
        totalPaidPayments: results[3].status === 'fulfilled' ? paidPayments.length : null,
        totalRevenue: results[3].status === 'fulfilled' ? totalRevenue : null,
        totalVisitors: results[4].status === 'fulfilled' ? visitorsData.length : null,
      });

      setEventCounts(Object.fromEntries(['UPCOMING', 'ONGOING', 'FINISHED'].map(status => [status, eventsData.filter(event => event.status === status).length])));
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
    if (s === 'WAITING_CONFIRMATION') return 'text-brand bg-brand-subtle border-border';
    if (s === 'PENDING') return 'text-amber-700 bg-amber-50 border-amber-200';
    if (s === 'REJECTED') return 'text-red-700 bg-red-50 border-red-200';
    return 'text-fg-secondary bg-slate-100 border-slate-300';
  };

  return (
    <div className="admin-page admin-dashboard space-y-8">
      {/* Page header */}
      <div className="admin-page-header flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-fg">
            {t('admin.welcomeBack')}{' '}
            <span className="text-brand">
              {user?.fullName?.split(' ')[0] || 'Admin'}
            </span>{' '}

          </h1>
          <p className="text-sm text-fg-muted mt-1">
            {t('admin.dashboardSubtitle')}
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-surface hover:bg-surface-hover disabled:opacity-50 border border-border rounded-xl text-xs font-bold text-fg-secondary shadow-card transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-brand' : 'text-fg-muted'}`} />
          {t('admin.refreshData')}
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-xl border border-red-200 bg-red-50 text-red-600 text-xs flex items-center gap-2 font-medium">
          <AlertTriangle className="w-4 h-4 text-red-500" /> {error}
        </div>
      )}

      {/* KPI Grid */}
      <div className="admin-stats-grid">
        <StatCard
          label={t('admin.totalEvents')}
          value={stats.totalEvents}
          icon={Calendar}
          loading={loading}
          sub={t('admin.eventsSub')}
        />
        <StatCard
          label={t('admin.totalUsers')}
          value={stats.totalUsers}
          icon={Users}
          loading={loading}
          sub={t('admin.usersSub')}
        />
        <StatCard
          label={t('admin.totalBookings')}
          value={stats.totalBookings}
          icon={FileText}
          loading={loading}
          sub={t('admin.bookingsSub')}
        />
        <StatCard
          label={t('admin.paidPayments')}
          value={stats.totalPaidPayments}
          icon={CheckCircle2}
          loading={loading}
          sub={t('admin.paidPaymentsSub')}
        />
        <StatCard
          label={t('admin.totalRevenue')}
          value={loading || stats.totalRevenue === null ? '—' : formatRupiah(stats.totalRevenue)}
          icon={DollarSign}
          loading={false}
          sub={t('admin.revenueSub')}
        />
        <StatCard
          label={t('admin.totalVisitors')}
          value={stats.totalVisitors}
          icon={Eye}
          loading={loading}
          sub={t('admin.visitorsSub')}
        />
      </div>

      {/* Event Status Breakdown */}
      {!loading && recentEvents.length > 0 && (
        <div className="admin-event-breakdown">
          {['UPCOMING', 'ONGOING', 'FINISHED'].map((status) => {
            const count = eventCounts[status] || 0;
            const colors = {
              UPCOMING: 'text-brand border-border bg-brand-subtle',
              ONGOING: 'text-emerald-700 border-emerald-200 bg-emerald-50',
              FINISHED: 'text-fg-secondary border-border bg-surface-hover',
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
      <div className="admin-recent-grid">

        {/* Recent Bookings */}
        <RecentCard
          title={t('admin.recentBookings')}
          icon={FileText}
          linkTo="/admin/bookings"
          linkLabel={t('admin.viewAll')}
        >
          {loading ? (
            <div className="p-6 text-center text-fg-muted text-sm">{t('common.loading')}</div>
          ) : recentBookings.length === 0 ? (
            <div className="p-6 text-center text-fg-muted text-sm">{t('admin.noBookingData')}</div>
          ) : (
            recentBookings.map((b) => (
              <div key={b.idBooking} className="flex items-center justify-between px-6 py-3.5 hover:bg-surface-hover transition-colors">
                <div>
                  <p className="text-xs font-bold font-mono text-brand">{b.bookingCode}</p>
                  <p className="text-[10px] text-fg-muted mt-0.5">{b.numberOfTicket} {t('history.ticketsUnit')} • {formatRupiah(b.totalPrice)}</p>
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
            <div className="p-6 text-center text-fg-muted text-sm">{t('common.loading')}</div>
          ) : recentPayments.length === 0 ? (
            <div className="p-6 text-center text-fg-muted text-sm">{t('admin.noPaymentData')}</div>
          ) : (
            recentPayments.map((p) => (
              <div key={p.idPayment} className="flex items-center justify-between px-6 py-3.5 hover:bg-surface-hover transition-colors">
                <div>
                  <p className="text-xs font-bold text-fg-secondary">Booking #{p.bookingId}</p>
                  <p className="text-[10px] text-fg-muted mt-0.5">{formatRupiah(p.totalPayment)}</p>
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
            <div className="p-6 text-center text-fg-muted text-sm">{t('common.loading')}</div>
          ) : recentEvents.length === 0 ? (
            <div className="p-6 text-center text-fg-muted text-sm">{t('admin.noEventData')}</div>
          ) : (
            recentEvents.map((e) => (
              <div key={e.idEvent} className="flex items-center justify-between px-6 py-3.5 hover:bg-surface-hover transition-colors">
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-fg-secondary truncate">{e.eventName}</p>
                  <p className="text-[10px] text-fg-muted mt-0.5">{e.city} • {e.eventDate}</p>
                </div>
                <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border flex-shrink-0 ml-3 ${
                  e.status === 'UPCOMING' ? 'text-brand bg-brand-subtle border-border' :
                  e.status === 'ONGOING' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' :
                  'text-fg-secondary bg-slate-100 border-slate-300'
                }`}>
                  {e.status}
                </span>
              </div>
            ))
          )}
        </RecentCard>

        {/* Quick Actions */}
        <div className="admin-quick-actions bg-surface border border-border p-6 space-y-4">
          <h3 className="text-sm font-bold flex items-center gap-2 text-fg">
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
                className="flex flex-col items-center justify-center gap-2 p-4 bg-surface-hover hover:bg-brand-subtle border border-border hover:border-border rounded-xl text-xs font-bold text-fg-secondary hover:text-brand transition-all text-center cursor-pointer"
              >
                <action.icon className="w-5 h-5 text-fg-muted group-hover:text-brand" />
                <span>{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
