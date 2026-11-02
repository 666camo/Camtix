import { useState, useEffect, useRef, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import {
  Menu,
  X,
  LogOut,
  Music,
  Heart,
  Mail,
  Globe,
  Share2,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import LanguageSwitcher from './components/LanguageSwitcher';
import ThemeToggle from './components/ThemeToggle';

import Home from './pages/Home';
import SearchEvent from './pages/SearchEvent';
import EventDetail from './pages/EventDetail';
import Booking from './pages/Booking';
import Payment from './pages/Payment';
import OrderHistory from './pages/OrderHistory';

import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOtp from './pages/VerifyOtp';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import EventAdmin from './pages/admin/EventAdmin';
import TicketAdmin from './pages/admin/TicketAdmin';
import UserAdmin from './pages/admin/UserAdmin';
import VisitorAdmin from './pages/admin/VisitorAdmin';
import BookingAdmin from './pages/admin/BookingAdmin';
import PaymentAdmin from './pages/admin/PaymentAdmin';
import PaymentMethodAdmin from './pages/admin/PaymentMethodAdmin';

import NotFound from './pages/NotFound';
import Forbidden from './pages/Forbidden';
import Unauthorized from './pages/Unauthorized';
import ServerError from './pages/ServerError';
import ProtectedRoute from './components/ProtectedRoute';
import RouteTracker from './components/RouteTracker';
import ErrorBoundary from './layouts/ErrorBoundary';
import './App.css';

function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-[var(--bg-elevated)] text-fg-secondary pt-14 pb-10 border-t border-border">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-10 border-b border-border">

          <div className="lg:col-span-2 space-y-3">
            <Link to="/" className="inline-flex items-center gap-2 text-xl font-800 tracking-tight text-fg">
              <span className="p-1.5 rounded-lg bg-brand text-white">
                <Music className="w-4 h-4" />
              </span>
              <span>CAMTIX</span>
            </Link>
            <p className="text-xs text-fg-muted leading-relaxed max-w-xs">
              {t('footer.about')}
            </p>
            <div className="flex items-center gap-2 pt-1">
              {[Globe, Share2, Mail].map((Icon, i) => (
                <span key={i} className="p-2 rounded-lg bg-surface border border-border text-fg-muted hover:text-fg hover:border-border-strong transition-colors cursor-pointer">
                  <Icon className="w-3.5 h-3.5" />
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-[11px] font-700 uppercase tracking-widest text-fg">
              {t('footer.quickLinks')}
            </h4>
            <ul className="space-y-1.5 text-xs">
              {[
                { to: '/', label: t('footer.allConcerts') },
                { to: '/search', label: t('footer.searchConcerts') },
                { to: '/history', label: t('footer.ticketHistory') },
                { to: '/login', label: t('footer.myAccount') },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="hover:text-fg transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-[11px] font-700 uppercase tracking-widest text-fg">
              {t('footer.supportTitle')}
            </h4>
            <ul className="space-y-1.5 text-xs">
              {[t('footer.faq'), t('footer.paymentGuide'), t('footer.securityCheck'), t('footer.contactUs')].map((item) => (
                <li key={item}><span className="hover:text-fg transition-colors cursor-pointer">{item}</span></li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-[11px] font-700 uppercase tracking-widest text-fg">
              {t('footer.legalTitle')}
            </h4>
            <ul className="space-y-1.5 text-xs">
              {[t('footer.terms'), t('footer.privacy'), t('footer.refund')].map((item) => (
                <li key={item}><span className="hover:text-fg transition-colors cursor-pointer">{item}</span></li>
              ))}
            </ul>
          </div>

        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-fg-muted">
          <p>&copy; {new Date().getFullYear()} CamTix Ticketing Solutions. {t('footer.rights')}</p>
          <div className="flex items-center gap-1">
            <span>Crafted with</span>
            <Heart className="w-3 h-3 text-red-500 fill-red-500" />
            <span>for Music Enthusiasts</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function PublicLayout() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const [navVisible, setNavVisible] = useState(true);
  const lastY = useRef(0);
  const ticking = useRef(false);

  const handleScroll = useCallback(() => {
    if (ticking.current) return;
    ticking.current = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      if (y < 60 || isOpen) {
        setNavVisible(true);
      } else if (y > lastY.current + 5) {
        setNavVisible(false);
      } else if (y < lastY.current - 5) {
        setNavVisible(true);
      }
      lastY.current = y;
      ticking.current = false;
    });
  }, [isOpen]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const navLinks = [
    { name: t('nav.catalog'), path: '/' },
    { name: t('nav.search'), path: '/search' },
  ];

  if (user) {
    navLinks.push({ name: t('nav.history'), path: '/history' });
    if (['ADMIN_CAMTIX', 'ADMIN_APLIKASI'].includes(user.role)) {
      navLinks.push({ name: t('nav.admin'), path: '/admin' });
    }
  }

  const handleLogout = () => {
    logout();
    toast.success(t('auth.logoutSuccess'));
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <nav className={`glass-nav fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-3 transition-transform duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)] ${navVisible ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">

          <Link to="/" onClick={() => setIsOpen(false)} className="flex items-center gap-2 font-800 tracking-tight text-lg sm:text-xl text-fg group">
            <span className="p-1.5 rounded-lg bg-brand text-white group-hover:scale-105 transition-transform">
              <Music className="w-4 h-4" />
            </span>
            <span>CAMTIX</span>
          </Link>

          <div className="hidden md:flex items-center gap-5">
            <div className="flex items-center gap-0.5 bg-surface p-1 rounded-full border border-border">
              {navLinks.map((link) => {
                const active = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-600 transition-all ${
                      active
                        ? 'bg-brand text-white'
                        : 'text-fg-secondary hover:text-fg'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>

            <LanguageSwitcher />
            <ThemeToggle />

            {user ? (
              <div className="flex items-center gap-2.5 border-l border-border pl-4">
                <div className="w-7 h-7 rounded-full bg-brand text-white flex items-center justify-center text-xs font-700">
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="text-xs font-600 text-fg max-w-[100px] truncate">{user.fullName || 'User'}</span>
                <button
                  onClick={handleLogout}
                  title={t('nav.logout')}
                  className="p-1.5 rounded-lg bg-surface text-fg-muted hover:text-red-500 border border-border hover:border-red-200 dark:hover:border-red-900 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 border-l border-border pl-4">
                <Link to="/login" className="px-3 py-1.5 text-xs font-600 text-fg-secondary hover:text-fg transition-colors">
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-brand hover:bg-brand-hover text-white text-xs font-600 rounded-xl transition-colors"
                >
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>

          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-fg hover:bg-surface transition-colors cursor-pointer"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: [0.25, 0.8, 0.25, 1] }}
              className="md:hidden overflow-hidden bg-surface border-t border-border mt-3 -mx-4 px-6 py-4 space-y-3"
            >
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="block text-sm font-600 text-fg-secondary hover:text-fg py-1.5 border-b border-border transition-colors"
                >
                  {link.name}
                </Link>
              ))}

              <div className="pt-1 flex justify-between items-center">
                <span className="text-xs text-fg-muted font-600">Language:</span>
                <LanguageSwitcher />
              </div>

              {user ? (
                <div className="pt-1 space-y-2">
                  <div className="text-sm text-fg-secondary">
                    {t('nav.hello')}, <strong className="text-fg">{user.fullName || 'User'}</strong>
                  </div>
                  <button
                    onClick={() => { handleLogout(); setIsOpen(false); }}
                    className="w-full py-2.5 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/50 text-red-600 dark:text-red-400 text-sm font-600 rounded-xl border border-red-200 dark:border-red-900 transition-colors flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" /> {t('nav.logout')}
                  </button>
                </div>
              ) : (
                <div className="pt-1 flex flex-col gap-2">
                  <Link to="/login" onClick={() => setIsOpen(false)} className="text-center py-2.5 bg-surface-hover text-fg text-sm font-600 rounded-xl">
                    {t('nav.login')}
                  </Link>
                  <Link to="/register" onClick={() => setIsOpen(false)} className="text-center py-2.5 bg-brand hover:bg-brand-hover text-white text-sm font-600 rounded-xl">
                    {t('nav.register')}
                  </Link>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <div className="public-shell flex-1">
        <Outlet />
      </div>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <RouteTracker />
          <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<SearchEvent />} />
            <Route path="/events/:slug" element={<EventDetail />} />
            <Route path="/booking" element={<ProtectedRoute><Booking /></ProtectedRoute>} />
            <Route path="/payment/:bookingId" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN_CAMTIX', 'ADMIN_APLIKASI']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="events" element={<EventAdmin />} />
            <Route path="tickets" element={<TicketAdmin />} />
            <Route path="visitors" element={<VisitorAdmin />} />
            <Route path="users" element={<UserAdmin />} />
            <Route path="bookings" element={<BookingAdmin />} />
            <Route path="payments" element={<PaymentAdmin />} />
            <Route path="payment-methods" element={<PaymentMethodAdmin />} />
          </Route>

          <Route path="/401" element={<Unauthorized />} />
          <Route path="/403" element={<Forbidden />} />
          <Route path="/500" element={<ServerError />} />
          <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}
