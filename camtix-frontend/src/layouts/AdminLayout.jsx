import React, { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { 
  LayoutDashboard, 
  Calendar, 
  Ticket, 
  Users, 
  Eye, 
  FileText, 
  CreditCard, 
  LogOut, 
  Settings,
  Menu,
  X
} from 'lucide-react';

export default function AdminLayout() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success(t('auth.logoutSuccess'));
    navigate('/login');
  };

  const navItems = [
    { name: t('admin.dashboard'), path: '/admin', icon: LayoutDashboard, exact: true },
    { name: t('admin.events'), path: '/admin/events', icon: Calendar },
    { name: t('admin.tickets'), path: '/admin/tickets', icon: Ticket },
    { name: t('admin.users'), path: '/admin/users', icon: Users },
    { name: t('admin.visitors'), path: '/admin/visitors', icon: Eye },
    { name: t('admin.bookings'), path: '/admin/bookings', icon: FileText },
    { name: t('admin.payments'), path: '/admin/payments', icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`w-72 bg-white border-r border-slate-200 flex flex-col fixed inset-y-0 shadow-sm z-30 transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <Link to="/" className="text-2xl font-extrabold tracking-wider gradient-text">
            CAMTIX <span className="text-xs text-blue-600 border border-blue-200 bg-blue-50 px-2 py-0.5 rounded-full ml-1">ADMIN</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-2 mt-2">
            {t('admin.navMenu')}
          </div>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-100 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-blue-600'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </NavLink>
          ))}
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 font-bold text-sm">
              {user?.fullName?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold text-slate-800 truncate">{user?.fullName || t('admin.administrator')}</p>
              <p className="text-[10px] text-slate-500 truncate">{user?.role || 'ADMIN'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full py-2.5 bg-white border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-600 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <LogOut className="w-4 h-4" /> {t('admin.logoutSystem')}
          </button>
        </div>
      </aside>

      <main className="flex-1 lg:ml-72 flex flex-col min-h-screen bg-slate-50/50">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 lg:px-8 py-4 sticky top-0 z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg">
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Settings className="w-4 h-4 text-slate-500" /> {t('admin.portalTitle')}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500/50"></span>
              <span className="text-xs font-semibold text-slate-500 hidden sm:inline">{t('admin.systemOnline')}</span>
            </div>
          </div>
        </header>

        <div className="p-2 flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
