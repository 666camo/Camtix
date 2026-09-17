import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import authService from '../services/authService';
import Aurora from '../components/Aurora';
import Magnet from '../components/Magnet';
import { AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

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
    confirmPassword: '',
  });

  const [touched, setTouched] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Real-time validation rules
  const validate = () => {
    const errors = {};
    if (!formData.firstName.trim()) {
      errors.firstName = 'Nama depan wajib diisi';
    } else if (formData.firstName.trim().length < 2) {
      errors.firstName = 'Minimal 2 karakter';
    } else if (formData.firstName.trim().length > 50) {
      errors.firstName = 'Maksimal 50 karakter';
    }

    if (!formData.lastName.trim()) {
      errors.lastName = 'Nama belakang wajib diisi';
    } else if (formData.lastName.trim().length > 50) {
      errors.lastName = 'Maksimal 50 karakter';
    }

    if (!formData.age) {
      errors.age = 'Umur wajib diisi';
    } else {
      const ageNum = parseInt(formData.age, 10);
      if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
        errors.age = 'Umur harus antara 1-120 tahun';
      }
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Nomor telepon wajib diisi';
    } else if (!/^(\+62|62|0)8[1-9][0-9]{6,11}$/.test(formData.phone.trim().replace(/[\s-]/g, ''))) {
      errors.phone = 'Format nomor HP Indonesia tidak valid (contoh: 081234567890)';
    }

    if (!formData.address.trim()) {
      errors.address = 'Alamat lengkap wajib diisi';
    } else if (formData.address.trim().length < 5) {
      errors.address = 'Alamat minimal 5 karakter';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email wajib diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Format email tidak valid';
    }

    if (!formData.password) {
      errors.password = 'Password wajib diisi';
    } else if (formData.password.length < 6) {
      errors.password = 'Password minimal 6 karakter';
    } else if (formData.password.length > 50) {
      errors.password = 'Password maksimal 50 karakter';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Konfirmasi password wajib diisi';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Konfirmasi password tidak cocok';
    }

    return errors;
  };

  const validationErrors = validate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleBlur = (e) => {
    setTouched({
      ...touched,
      [e.target.name]: true,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({
      firstName: true,
      lastName: true,
      age: true,
      address: true,
      phone: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

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
      const parsedAge = parseInt(formData.age, 10);
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        age: isNaN(parsedAge) ? 0 : parsedAge,
        address: formData.address.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
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
    <Aurora className="pt-28 pb-16 px-6">
      <div className="glass-effect rounded-2xl p-8 max-w-xl w-full border border-slate-200 relative overflow-hidden shadow-2xl">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-100/50 rounded-full blur-2xl -z-10"></div>

        <h2 className="text-3xl font-extrabold text-center mb-2 tracking-tight text-slate-800">
          {t('auth.registerTitle')} <span className="gradient-text">CamTix</span>
        </h2>
        <p className="text-slate-500 text-sm text-center mb-8">{t('auth.registerSubtitle')}</p>

        {error && (
          <div className="mb-6 p-4 rounded-xl border border-red-200 bg-red-50 text-red-600 text-sm flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                {t('auth.firstName')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getInputClass('firstName')}
                placeholder="John"
              />
              {touched.firstName && validationErrors.firstName && (
                <p className="text-[11px] text-red-500 font-medium mt-1 animate-fadeIn">{validationErrors.firstName}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                {t('auth.lastName')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getInputClass('lastName')}
                placeholder="Doe"
              />
              {touched.lastName && validationErrors.lastName && (
                <p className="text-[11px] text-red-500 font-medium mt-1 animate-fadeIn">{validationErrors.lastName}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                {t('auth.age')} <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                onBlur={handleBlur}
                min="1"
                max="120"
                className={getInputClass('age')}
                placeholder="25"
              />
              {touched.age && validationErrors.age && (
                <p className="text-[11px] text-red-500 font-medium mt-1 animate-fadeIn">{validationErrors.age}</p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                {t('auth.phone')} <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getInputClass('phone')}
                placeholder="081234567890"
              />
              {touched.phone && validationErrors.phone && (
                <p className="text-[11px] text-red-500 font-medium mt-1 animate-fadeIn">{validationErrors.phone}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              {t('auth.address')} <span className="text-red-500">*</span>
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              onBlur={handleBlur}
              rows="2"
              className={`${getInputClass('address')} resize-none`}
              placeholder="Jl. Raya Konser No. 10, Jakarta"
            />
            {touched.address && validationErrors.address && (
              <p className="text-[11px] text-red-500 font-medium mt-1 animate-fadeIn">{validationErrors.address}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              {t('auth.email')} <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={getInputClass('email')}
              placeholder="johndoe@example.com"
            />
            {touched.email && validationErrors.email && (
              <p className="text-[11px] text-red-500 font-medium mt-1 animate-fadeIn">{validationErrors.email}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                {t('auth.passwordMin6')} <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getInputClass('password')}
                placeholder="••••••••"
              />
              {touched.password && validationErrors.password && (
                <p className="text-[11px] text-red-500 font-medium mt-1 animate-fadeIn">{validationErrors.password}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Konfirmasi Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getInputClass('confirmPassword')}
                placeholder="••••••••"
              />
              {touched.confirmPassword && validationErrors.confirmPassword && (
                <p className="text-[11px] text-red-500 font-medium mt-1 animate-fadeIn">{validationErrors.confirmPassword}</p>
              )}
            </div>
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
