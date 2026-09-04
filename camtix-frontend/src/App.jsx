import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { 
  Menu, 
  X, 
  LogOut, 
  Music, 
  Ticket, 
  ShieldCheck, 
  Sparkles, 
  Heart, 
  Mail, 
  MapPin, 
  Globe, 
  Share2, 
  ArrowUpRight 
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import LanguageSwitcher from './components/LanguageSwitcher';

// Public pages
import Home from './pages/Home';
import SearchEvent from './pages/SearchEvent';
import EventDetail from './pages/EventDetail';
import Booking from './pages/Booking';
import Payment from './pages/Payment';
import OrderHistory from './pages/OrderHistory';

// Auth pages
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOtp from './pages/VerifyOtp';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Admin layout & pages
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import EventAdmin from './pages/admin/EventAdmin';
import TicketAdmin from './pages/admin/TicketAdmin';
import UserAdmin from './pages/admin/UserAdmin';
import VisitorAdmin from './pages/admin/VisitorAdmin';
import BookingAdmin from './pages/admin/BookingAdmin';
import PaymentAdmin from './pages/admin/PaymentAdmin';
import AdminPlaceholder from './pages/admin/AdminPlaceholder';

import NotFound from './pages/NotFound';
import Forbidden from './pages/Forbidden';
import ServerError from './pages/ServerError';
import ProtectedRoute from './components/ProtectedRoute';
import RouteTracker from './components/RouteTracker';
import ErrorBoundary from './layouts/ErrorBoundary';
import './App.css';

// ── Shared Footer Component ─────────────────────────────────────────
function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-slate-950 text-slate-400 pt-16 pb-12 border-t border-slate-800/80 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800/80">
          
          {/* Brand Info (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2 text-2xl font-black tracking-wider text-white">
              <span className="p-1.5 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md">
                <Music className="w-5 h-5" />
              </span>
              <span>CAMTIX</span>
            </Link>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              {t('footer.about')}
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors cursor-pointer">
                <Globe className="w-4 h-4" />
              </span>
              <span className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors cursor-pointer">
                <Share2 className="w-4 h-4" />
              </span>
              <span className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors cursor-pointer">
                <Mail className="w-4 h-4" />
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white">
              {t('footer.quickLinks')}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  {t('footer.allConcerts')}
                </Link>
              </li>
              <li>
                <Link to="/search" className="hover:text-white transition-colors">
                  {t('footer.searchConcerts')}
                </Link>
              </li>
              <li>
                <Link to="/history" className="hover:text-white transition-colors">
                  {t('footer.ticketHistory')}
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  {t('footer.myAccount')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Services */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white">
              {t('footer.supportTitle')}
            </h4>
            <ul className="space-y-2 text-xs">
              <li><span className="hover:text-white transition-colors cursor-pointer">{t('footer.faq')}</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">{t('footer.paymentGuide')}</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">{t('footer.securityCheck')}</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">{t('footer.contactUs')}</span></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white">
              {t('footer.legalTitle')}
            </h4>
            <ul className="space-y-2 text-xs">
              <li><span className="hover:text-white transition-colors cursor-pointer">{t('footer.terms')}</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">{t('footer.privacy')}</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">{t('footer.refund')}</span></li>
            </ul>
          </div>

        </div>

        {/* Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} CamTix Ticketing Solutions. {t('footer.rights')}</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>for Music Enthusiasts</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ── Public layout wrapper with floating glass navbar ─────────────────
function PublicLayout() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);

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
      {/* Floating Glass Navbar */}
      <nav className="glass-nav fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo Brand */}
          <Link to="/" onClick={() => setIsOpen(false)} className="flex items-center gap-2 font-black tracking-tight text-xl sm:text-2xl text-slate-900 group">
            <span className="p-1.5 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Music className="w-4 h-4 sm:w-5 sm:h-5" />
            </span>
            <span className="tracking-wider">CAMTIX</span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-full border border-slate-200/60">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>

            <LanguageSwitcher />

            {user ? (
              <div className="flex items-center gap-3 border-l border-slate-200/80 pl-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="text-xs font-bold text-slate-700 max-w-[120px] truncate">
                    {user.fullName || 'User'}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  title={t('nav.logout')}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 border border-slate-200 hover:border-red-200 transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 border-l border-slate-200/80 pl-4">
                <Link 
                  to="/login" 
                  className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-indigo-600 transition-colors"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-500/20 active:scale-95 transition-all"
                >
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Icon */}
          <button
            onClick={toggleMenu}
            className="flex md:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Panel */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="md:hidden overflow-hidden bg-white/95 backdrop-blur-md border-t border-slate-100 mt-3 -mx-4 px-6 py-4 space-y-4 shadow-xl"
            >
              <div className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className="text-sm font-bold text-slate-700 hover:text-indigo-600 py-2 border-b border-slate-50 transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}

                <div className="pt-2 flex justify-between items-center">
                  <span className="text-xs text-slate-400 font-bold uppercase">Language:</span>
                  <LanguageSwitcher />
                </div>

                {user ? (
                  <div className="pt-2 space-y-3">
                    <div className="text-sm text-slate-600">
                      {t('nav.hello')}, <strong className="text-slate-800">{user.fullName || 'User'}</strong>
                    </div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsOpen(false);
                      }}
                      className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-bold rounded-xl border border-red-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <LogOut className="w-4 h-4" /> {t('nav.logout')}
                    </button>
                  </div>
                ) : (
                  <div className="pt-2 flex flex-col gap-2">
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="text-center py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-bold rounded-xl"
                    >
                      {t('nav.login')}
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsOpen(false)}
                      className="text-center py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-md"
                    >
                      {t('nav.register')}
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Routed Content */}
      <div className="flex-1">
        <Outlet />
      </div>

      {/* Global Modern Footer */}
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
          {/* ── Public routes with top navbar and footer ────────── */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<SearchEvent />} />
            <Route path="/events/:slug" element={<EventDetail />} />

            {/* Protected customer routes */}
            <Route
              path="/booking"
              element={<ProtectedRoute><Booking /></ProtectedRoute>}
            />
            <Route
              path="/payment/:bookingId"
              element={<ProtectedRoute><Payment /></ProtectedRoute>}
            />
            <Route
              path="/history"
              element={<ProtectedRoute><OrderHistory /></ProtectedRoute>}
            />

            {/* Auth routes (no role restriction) */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>

          {/* ── Admin routes – sidebar layout, no top navbar ─── */}
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
          </Route>

          {/* ── Error pages ──────────────────────────────────────── */}
          <Route path="/403" element={<Forbidden />} />
          <Route path="/500" element={<ServerError />} />

          {/* ── 404 catch-all ─────────────────────────────────────── */}
          <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}
