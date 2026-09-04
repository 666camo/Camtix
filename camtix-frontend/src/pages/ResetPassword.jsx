import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import authService from '../services/authService';
import Aurora from '../components/Aurora';
import Magnet from '../components/Magnet';
import { AlertCircle, CheckCircle, KeyRound, Check } from 'lucide-react';

export default function ResetPassword() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const urlToken = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [tokenInput, setTokenInput] = useState(urlToken);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (urlToken) {
      setTokenInput(urlToken);
    }
  }, [urlToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const finalToken = tokenInput.trim();
    if (!finalToken) {
      setError(t('auth.tokenRequired'));
      toast.error(t('auth.tokenRequired'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('auth.passwordMismatch'));
      toast.error(t('auth.passwordMismatch'));
      return;
    }

    if (password.length < 6) {
      setError(t('auth.passwordMinLength'));
      toast.error(t('auth.passwordMinLength'));
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(finalToken, password);
      const msg = t('auth.resetSuccess');
      setSuccess(msg);
      toast.success(msg);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      const msg = err.response?.data?.message || t('auth.resetFail');
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Aurora className="px-6 py-20">
      <div className="glass-effect rounded-2xl p-8 max-w-md w-full border border-slate-200 relative overflow-hidden shadow-2xl">
        <h2 className="text-3xl font-extrabold text-center mb-2 tracking-tight text-slate-800">{t('auth.resetTitle')}</h2>
        <p className="text-slate-500 text-sm text-center mb-8">{t('auth.resetSubtitle')}</p>

        {error && (
          <div className="mb-6 p-4 rounded-xl border border-red-200 bg-red-50 text-red-600 text-sm flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {success ? (
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 text-sm flex items-center gap-2 text-center">
            <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            <p className="text-left">{success}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Token Code Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {t('auth.resetTokenLabel')}
                </label>
                {urlToken && tokenInput === urlToken && (
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Auto-filled
                  </span>
                )}
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-400 rounded-xl pl-10 pr-4 py-3 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                  placeholder={t('auth.resetTokenPlaceholder')}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t('auth.newPassword')}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-400 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                placeholder={t('auth.newPassPlaceholder')}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t('auth.confirmPassword')}</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-400 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                placeholder={t('auth.confirmPassPlaceholder')}
              />
            </div>

            <Magnet className="w-full">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-xl active:scale-[0.98] transition-all mt-4 text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                {loading ? t('auth.saving') : t('auth.savePassword')}
              </button>
            </Magnet>

            <p className="text-center text-xs text-slate-500 mt-4">
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-bold transition-colors">
                ← {t('auth.backToLogin')}
              </Link>
            </p>
          </form>
        )}
      </div>
    </Aurora>
  );
}
