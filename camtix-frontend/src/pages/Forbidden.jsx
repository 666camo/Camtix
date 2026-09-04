import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, ShieldAlert, LogIn } from 'lucide-react';

export default function Forbidden() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center px-6">
      {/* Ambient glow decoration */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-100/50 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="text-center max-w-lg mx-auto">
        {/* Animated 403 number with shield badge */}
        <div className="relative mb-8 select-none">
          <p className="text-[10rem] md:text-[12rem] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-red-200 via-rose-200 to-slate-200">
            403
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-white shadow-xl border border-red-100 flex items-center justify-center animate-pulse">
              <ShieldAlert className="w-10 h-10 text-red-500" />
            </div>
          </div>
        </div>

        {/* Text content */}
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 mb-4">
          {t('forbidden.title')}
        </h1>
        <p className="text-slate-500 text-base mb-10 leading-relaxed">
          {t('forbidden.subtitle')}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-300"
          >
            <Home className="w-4 h-4" />
            {t('forbidden.backHome')}
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl border border-slate-200 shadow-sm hover:-translate-y-0.5 transition-all duration-300"
          >
            <LogIn className="w-4 h-4 text-slate-500" />
            {t('forbidden.loginOther')}
          </Link>
        </div>

        {/* Decorative indicator dots */}
        <div className="mt-14 flex justify-center gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-red-300 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
