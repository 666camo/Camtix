import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import userService from '../services/userService';

const getActivityName = (pathname) => {
  if (pathname === '/') return 'Mengakses Halaman Beranda / Katalog';
  if (pathname === '/search') return 'Mengakses Pencarian Konser';
  if (pathname === '/login') return 'Mengakses Halaman Login';
  if (pathname === '/register') return 'Mengakses Halaman Registrasi';
  if (pathname === '/history') return 'Melihat Riwayat Pemesanan';
  
  if (pathname.startsWith('/events/')) {
    return 'Melihat Detail Event Konser';
  }
  if (pathname.startsWith('/booking')) {
    return 'Melakukan Pemesanan Tiket (Checkout)';
  }
  if (pathname.startsWith('/payment/')) {
    return 'Membuka Halaman Pembayaran';
  }
  if (pathname.startsWith('/admin')) {
    return 'Mengakses Panel Admin';
  }

  return `Mengakses halaman ${pathname}`;
};

export default function RouteTracker() {
  const location = useLocation();

  useEffect(() => {
    // We can avoid logging API calls or static assets if they ever hit router, 
    // but react-router only handles app routes.
    
    // Determine activity string based on path
    const activity = getActivityName(location.pathname);
    
    // Send to backend
    userService.logVisitor(activity);

  }, [location]);

  return null; // This component doesn't render anything
}
