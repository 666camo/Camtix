import AuthLayout from '../components/AuthLayout';
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import authService from '../services/authService';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function VerifyOtp() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get('email') || '';

  const [email, setEmail] = useState(emailParam);
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  
  const [timer, setTimer] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [emailParam]);

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (otpCode.length !== 6) {
      setError(t('auth.otpLength'));
      toast.error(t('auth.otpLength'));
      setLoading(false);
      return;
    }

    try {
      await authService.verifyOtp(email, otpCode);
      const msg = t('auth.otpSuccess');
      setSuccess(msg);
      toast.success(msg);
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      const msg = err.response?.data?.message || t('auth.otpFail');
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError(t('auth.enterEmailFirst'));
      toast.error(t('auth.enterEmailFirst'));
      return;
    }
    setError('');
    setSuccess('');
    setResendLoading(true);

    try {
      await authService.resendOtp(email);
      const msg = t('auth.otpResent');
      setSuccess(msg);
      toast.success(msg);
      setTimer(60);
    } catch (err) {
      const msg = err.response?.data?.message || t('auth.resendFail');
      setError(msg);
      toast.error(msg);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-form glass-effect rounded-2xl p-8 max-w-md w-full border border-border relative overflow-hidden">
        {/* Accent */}
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-brand/10 rounded-full blur-2xl -z-10"></div>
        
        <h1 className="text-3xl font-extrabold text-center mb-2 tracking-tight text-fg">{t('auth.otpTitle')} <span className="gradient-text">OTP</span></h1>
        <p className="text-fg-secondary text-sm text-center mb-8">{t('auth.otpSubtitle')}</p>

        {error && (
          <div className="mb-6 p-4 rounded-xl border border-red-200 bg-red-50 text-red-600 text-sm flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 text-sm flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <p>{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="verifyotp-field-1" className="block text-xs font-semibold text-fg-secondary uppercase tracking-wider mb-2">{t('auth.email')}</label>
            <input id="verifyotp-field-1"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-surface border border-border focus:border-brand rounded-xl px-4 py-3 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
              placeholder="name@example.com"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-fg-secondary uppercase tracking-wider">{t('auth.otpCode')}</label>
              <button
                type="button"
                onClick={handleResend}
                disabled={timer > 0 || resendLoading}
                className="text-xs font-bold text-brand hover:text-brand disabled:text-fg-muted transition-colors"
              >
                {timer > 0 ? t('auth.resendOtpTimer', { timer }) : t('auth.resendOtp')}
              </button>
            </div>
            <input
              type="text"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              required
              className="w-full bg-surface border border-border focus:border-brand rounded-xl px-4 py-3 text-center text-xl font-bold tracking-widest text-fg focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
              placeholder="000000"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-brand hover:bg-brand-hover disabled:bg-surface-hover disabled:text-fg-muted text-white font-bold rounded-xl shadow-sm shadow-card hover:shadow-card active:scale-[0.98] transition-all mt-6 text-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                <span>{t('auth.verifying')}</span>
              </>
            ) : (
              <span>{t('auth.verifyBtn')}</span>
            )}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}
