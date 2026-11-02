import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import authService from '../services/authService';
import AuthLayout from '../components/AuthLayout';
import Magnet from '../components/Magnet';
import { AlertCircle, CheckCircle, ArrowRight, KeyRound } from 'lucide-react';

export default function ForgotPassword() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await authService.forgotPassword(email);
      const msg = t('auth.forgotSuccess');
      setSuccess(msg);
      toast.success(msg);
    } catch (err) {
      const msg = err.response?.data?.message || t('auth.forgotFail');
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-form glass-effect rounded-2xl p-8 max-w-md w-full border border-border relative overflow-hidden shadow-2xl">
        <h1 className="text-3xl font-extrabold text-center mb-2 tracking-tight text-fg">{t('auth.forgotTitle')}</h1>
        <p className="text-fg-secondary text-sm text-center mb-8">{t('auth.forgotSubtitle')}</p>

        {error && (
          <div className="mb-6 p-4 rounded-xl border border-red-200 bg-red-50 text-red-600 text-sm flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {success ? (
          <div className="space-y-6 animate-fadeIn">
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-sm space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-900">
                <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>{success}</span>
              </div>
              <p className="text-xs text-emerald-700 leading-relaxed pl-7">
                {t('auth.forgotNextSteps')}
              </p>
            </div>

            <div className="space-y-3">
              <Link
                to="/reset-password"
                className="w-full py-3.5 bg-brand hover:bg-brand-hover text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <KeyRound className="w-4 h-4" />
                {t('auth.openResetPage')}
              </Link>
              
              <Link
                to="/login"
                className="w-full py-3.5 bg-surface hover:bg-surface border border-border text-fg-secondary font-bold rounded-xl text-sm transition-all flex items-center justify-center shadow-sm"
              >
                {t('auth.backToLogin')}
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="forgotpassword-field-1" className="block text-xs font-semibold text-fg-secondary uppercase tracking-wider mb-2">{t('auth.accountEmail')}</label>
              <input id="forgotpassword-field-1"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-surface border border-border focus:border-brand rounded-xl px-4 py-3 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
                placeholder="name@example.com"
              />
            </div>

            <Magnet className="w-full">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-brand hover:bg-brand-hover disabled:bg-surface-hover disabled:text-fg-muted text-white font-bold rounded-xl active:scale-[0.98] transition-all mt-4 text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                {loading ? t('auth.sending') : t('auth.sendResetLink')}
              </button>
            </Magnet>

            <div className="pt-2 text-center space-y-2">
              <p className="text-xs text-fg-secondary">
                {t('auth.hasTokenQuestion')}{' '}
                <Link to="/reset-password" className="text-brand hover:text-brand font-bold transition-colors inline-flex items-center gap-0.5">
                  {t('auth.resetPasswordNow')} <ArrowRight className="w-3 h-3" />
                </Link>
              </p>
              <p className="text-xs text-fg-muted">
                {t('auth.rememberPassword')}{' '}
                <Link to="/login" className="text-fg-secondary hover:text-brand font-bold transition-colors">
                  {t('auth.loginBtn')}
                </Link>
              </p>
            </div>
          </form>
        )}
      </div>
    </AuthLayout>
  );
}
