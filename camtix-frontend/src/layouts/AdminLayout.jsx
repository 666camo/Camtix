import { useEffect, useRef, useState } from 'react';
import { Outlet, NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { LayoutDashboard, Calendar, Ticket, Users, Eye, FileText, CreditCard, LogOut, Settings, Menu, X, ArrowUpRight, Music } from 'lucide-react';
import '../Admin.css';

export default function AdminLayout() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const menuRef = useRef(null);
  const english = i18n.language.startsWith('en');
  const groups = [
    { label: english ? 'Overview' : 'Ringkasan', items: [{ name: t('admin.dashboard'), path: '/admin', icon: LayoutDashboard, exact: true }] },
    { label: english ? 'Shows & tickets' : 'Panggung & tiket', items: [
      { name: t('admin.events'), path: '/admin/events', icon: Calendar },
      { name: t('admin.tickets'), path: '/admin/tickets', icon: Ticket },
    ] },
    { label: english ? 'Transactions' : 'Transaksi', items: [
      { name: t('admin.bookings'), path: '/admin/bookings', icon: FileText },
      { name: t('admin.payments'), path: '/admin/payments', icon: CreditCard },
      { name: english ? 'Payment methods' : 'Metode pembayaran', path: '/admin/payment-methods', icon: Settings },
    ] },
    { label: english ? 'People & activity' : 'Pengguna & aktivitas', items: [
      { name: t('admin.users'), path: '/admin/users', icon: Users },
      { name: t('admin.visitors'), path: '/admin/visitors', icon: Eye },
    ] },
  ];
  const active = groups.flatMap(group => group.items).find(item => item.path === location.pathname);

  useEffect(() => {
    if (!sidebarOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusable = () => [...sidebarRef.current.querySelectorAll('a, button')];
    const focusFrame = requestAnimationFrame(() => focusable()[0]?.focus());
    const onKey = (event) => {
      if (event.key === 'Escape') { setSidebarOpen(false); menuRef.current?.focus(); }
      if (event.key !== 'Tab') return;
      const items = focusable();
      if (event.shiftKey && document.activeElement === items[0]) { event.preventDefault(); items.at(-1)?.focus(); }
      else if (!event.shiftKey && document.activeElement === items.at(-1)) { event.preventDefault(); items[0]?.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => { cancelAnimationFrame(focusFrame); document.body.style.overflow = previousOverflow; document.removeEventListener('keydown', onKey); };
  }, [sidebarOpen]);

  const handleLogout = () => { logout(); toast.success(t('auth.logoutSuccess')); navigate('/login'); };

  return (
    <div className="admin-shell light admin-workspace">
      {sidebarOpen && <button type="button" className="admin-scrim" aria-label={english ? 'Close navigation' : 'Tutup navigasi'} onClick={() => setSidebarOpen(false)} />}
      <aside id="admin-navigation" ref={sidebarRef} className={`admin-sidebar ${sidebarOpen ? 'is-open' : ''}`}>
        <div className="admin-brand-row">
          <Link to="/" className="admin-brand"><Music size={22} aria-hidden="true" /><span>CAMTIX<small>BACKSTAGE / ADMIN</small></span></Link>
          <button type="button" className="admin-sidebar-close" aria-label={english ? 'Close navigation' : 'Tutup navigasi'} onClick={() => { setSidebarOpen(false); menuRef.current?.focus(); }}><X size={20} /></button>
        </div>
        <nav className="admin-navigation" aria-label={t('admin.navMenu')}>
          {groups.map(group => <div className="admin-nav-group" key={group.label}>
            <p>{group.label}</p>
            {group.items.map(item => <NavLink key={item.path} to={item.path} end={item.exact} onClick={() => setSidebarOpen(false)} className={({isActive}) => `admin-nav-link ${isActive ? 'is-active' : ''}`}><item.icon size={18} aria-hidden="true" /><span>{item.name}</span></NavLink>)}
          </div>)}
        </nav>
        <div className="admin-sidebar-footer">
          <div className="admin-profile"><span>{user?.fullName?.charAt(0) || 'A'}</span><div><strong>{user?.fullName || t('admin.administrator')}</strong><small>{user?.role || 'ADMIN'}</small></div></div>
          <button type="button" onClick={handleLogout}><LogOut size={16} aria-hidden="true" />{t('admin.logoutSystem')}</button>
        </div>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-title"><button type="button" ref={menuRef} className="admin-menu-button" aria-label={english ? 'Open navigation' : 'Buka navigasi'} aria-controls="admin-navigation" aria-expanded={sidebarOpen} onClick={() => setSidebarOpen(true)}><Menu size={21} /></button><span>BACKSTAGE <span className="admin-breadcrumb-slash">/</span> <strong>{active?.name || t('admin.dashboard')}</strong></span></div>
          <div className="admin-topbar-actions"><LanguageSwitcher /><Link to="/" className="admin-view-site"><span>{english ? 'View site' : 'Lihat situs'}</span><ArrowUpRight size={17} aria-hidden="true" /></Link></div>
        </header>
        <main id="admin-content" className="admin-content"><Outlet /></main>
        <footer className="admin-workspace-footer"><span>CAMTIX / BACKSTAGE</span><span>LIVE LOUD TOGETHER.</span></footer>
      </div>
    </div>
  );
}
