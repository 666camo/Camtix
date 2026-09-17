import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import Aurora from '../components/Aurora';
import Magnet from '../components/Magnet';
import { AlertCircle } from 'lucide-react';

export default function Login() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errors = {};
    if (!email.trim()) {
      errors.email = 'Email wajib diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Format email tidak valid';
    }

    if (!password) {
      errors.password = 'Password wajib diisi';
    } else if (password.length < 6) {
      errors.password = 'Password minimal 6 karakter';
    }
    return errors;
  };

  const validationErrors = validate();

  const handleGoogleLogin = async (googleResponse) => {
    setError('');
    setLoading(true);
    try {
      const response = await authService.googleLogin(googleResponse.credential);
      login({
        email: response.data.email,
        fullName: response.data.fullName,
        role: response.data.role,
        token: response.data.token,
        idUser: response.data.idUser
      });
      toast.success(t('auth.googleLoginSuccess'));
      navigate('/', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || t('auth.googleFail');
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    /* global google */
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "542247492193-n29h1r559pvt3uip49a9o69a4pco1i68.apps.googleusercontent.com";

    const initGoogle = () => {
      if (typeof google !== 'undefined' && googleClientId) {
        try {
          google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleGoogleLogin
          });
          const btnElem = document.getElementById("googleButton");
          if (btnElem) {
            google.accounts.id.renderButton(
              btnElem,
              { theme: "outline", size: "large", width: "100%" }
            );
          }
        } catch (e) {
          console.warn("Google GIS initialization error:", e);
        }
      }
    };

    if (typeof google !== 'undefined') {
      initGoogle();
    } else {
      const interval = setInterval(() => {
        if (typeof google !== 'undefined') {
          clearInterval(interval);
          initGoogle();
        }
      }, 300);
      return () => clearInterval(interval);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });

    const currentErrors = validate();
    if (Object.keys(currentErrors).length > 0) {
      const firstError = Object.values(currentErrors)[0];
      setError(firstError);
      toast.error(firstError);
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await authService.login(email.trim(), password);
      login({
        email: response.data.email,
        fullName: response.data.fullName,
        role: response.data.role,
        token: response.data.token,
        idUser: response.data.idUser
      });

      toast.success(t('auth.loginSuccess'));

      const role = response.data.role;
      if (role === 'ADMIN_CAMTIX' || role === 'ADMIN_APLIKASI') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      const msg = err.response?.data?.message || t('auth.loginFail');
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const getInputClass = (fieldName) => {
    const hasError = touched[fieldName] && validationErrors[fieldName];
    const isValid = touched[fieldName] && !validationErrors[fieldName];
    return `w-full bg-slate-50 border ${
      hasError
        ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
        : isValid
        ? 'border-emerald-400 focus:border-emerald-500 focus:ring-emerald-100'
        : 'border-slate-200 focus:border-blue-400 focus:ring-blue-100'
    } rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 transition-all`;
  };

  return (
    <Aurora className="px-6">
      <div className="glass-effect rounded-2xl p-8 max-w-md w-full border border-slate-200 relative overflow-hidden shadow-2xl">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-100/50 rounded-full blur-2xl -z-10"></div>

        <h2 className="text-3xl font-extrabold text-center mb-2 tracking-tight text-slate-800">
          {t('auth.loginTitle')} <span className="gradient-text">CamTix</span>
        </h2>
        <p className="text-slate-500 text-sm text-center mb-8">{t('auth.loginSubtitle')}</p>

        {error && (
          <div className="mb-6 p-4 rounded-xl border border-red-200 bg-red-50 text-red-600 text-sm flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              {t('auth.email')} <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
              className={getInputClass('email')}
              placeholder="name@example.com"
            />
            {touched.email && validationErrors.email && (
              <p className="text-[11px] text-red-500 font-medium mt-1 animate-fadeIn">{validationErrors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              {t('auth.password')} <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
              className={getInputClass('password')}
              placeholder="••••••••"
            />
            {touched.password && validationErrors.password && (
              <p className="text-[11px] text-red-500 font-medium mt-1 animate-fadeIn">{validationErrors.password}</p>
            )}
          </div>

          <div className="flex justify-between items-center text-xs">
            <span />
            <Link to="/forgot-password" className="text-blue-600 hover:text-blue-700 font-bold transition-colors">
              {t('auth.forgotPassword')}
            </Link>
          </div>

          <Magnet className="w-full">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-xl shadow-sm shadow-blue-500/20 hover:shadow-blue-500/30 active:scale-[0.98] transition-all mt-4 text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                  <span>{t('auth.loggingIn')}</span>
                </>
              ) : (
                <span>{t('auth.loginBtn')}</span>
              )}
            </button>
          </Magnet>
        </form>

        <div className="my-5 flex items-center justify-between">
          <span className="w-1/5 border-b border-slate-200"></span>
          <span className="text-xs text-slate-400 uppercase font-medium">{t('auth.orLoginWith')}</span>
          <span className="w-1/5 border-b border-slate-200"></span>
        </div>

        <div id="googleButton" className="w-full flex justify-center mb-6"></div>

        <p className="text-center text-xs text-slate-500 mt-2 leading-relaxed">
          {t('auth.noAccount')} <Link to="/register" className="text-blue-600 hover:text-blue-700 font-bold transition-colors">{t('auth.registerLink')}</Link>
        </p>
      </div>
    </Aurora>
  );
}
