import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import authService from '../services/authService';
import Aurora from '../components/Aurora';
import Magnet from '../components/Magnet';
import { AlertCircle } from 'lucide-react';

export default function Register() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    age: '',
    address: '',
    phone: '',
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.password.length < 6) {
      setError(t('auth.passwordMinLength'));
      toast.error(t('auth.passwordMinLength'));
      setLoading(false);
      return;
    }

    try {
      const parsedAge = parseInt(formData.age, 10);
      const payload = {
        ...formData,
        age: isNaN(parsedAge) ? 0 : parsedAge,
      };

      await authService.register(payload);
      toast.success(t('auth.registerSuccess'));
      navigate(`/verify-otp?email=${encodeURIComponent(formData.email)}`);
    } catch (err) {
      const msg = err.response?.data?.message || t('auth.registerFail');
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-slate-50 border border-slate-200 focus:border-blue-400 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all";

  return (
    <Aurora className="pt-28 pb-16 px-6">
      <div className="glass-effect rounded-2xl p-8 max-w-xl w-full border border-slate-200 relative overflow-hidden shadow-2xl">
        {/* Accent */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-100/50 rounded-full blur-2xl -z-10"></div>
        
        <h2 className="text-3xl font-extrabold text-center mb-2 tracking-tight text-slate-800">{t('auth.registerTitle')} <span className="gradient-text">CamTix</span></h2>
        <p className="text-slate-500 text-sm text-center mb-8">{t('auth.registerSubtitle')}</p>

        {error && (
          <div className="mb-6 p-4 rounded-xl border border-red-200 bg-red-50 text-red-600 text-sm flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t('auth.firstName')}</label>
              <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required className={inputClass} placeholder="John" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t('auth.lastName')}</label>
              <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required className={inputClass} placeholder="Doe" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t('auth.age')}</label>
              <input type="number" name="age" value={formData.age} onChange={handleChange} required min="1" className={inputClass} placeholder="25" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t('auth.phone')}</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className={inputClass} placeholder="0812XXXXXXXX" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t('auth.address')}</label>
            <textarea name="address" value={formData.address} onChange={handleChange} required rows="2" className={`${inputClass} resize-none`} placeholder="Jl. Raya Konser No. 10, Jakarta" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t('auth.email')}</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required className={inputClass} placeholder="johndoe@example.com" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t('auth.passwordMin6')}</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required className={inputClass} placeholder="••••••••" />
          </div>

          <Magnet className="w-full">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-xl shadow-sm shadow-blue-500/20 hover:shadow-blue-500/30 active:scale-[0.98] transition-all mt-6 text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                  <span>{t('auth.registering')}</span>
                </>
              ) : (
                <span>{t('auth.registerBtn')}</span>
              )}
            </button>
          </Magnet>
        </form>

        <p className="text-center text-xs text-slate-500 mt-6 leading-relaxed">
          {t('auth.hasAccount')} <Link to="/login" className="text-blue-600 hover:text-blue-700 font-bold transition-colors">{t('auth.loginLink')}</Link>
        </p>
      </div>
    </Aurora>
  );
}
