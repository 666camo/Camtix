import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, AlertTriangle } from 'lucide-react';

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center px-6">
      {/* Background decoration */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="text-center max-w-lg mx-auto">
        {/* Animated 404 number */}
        <div className="relative mb-8 select-none">
          <p className="text-[10rem] md:text-[12rem] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-blue-200 via-indigo-200 to-slate-200">
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-white shadow-xl border border-slate-100 flex items-center justify-center animate-pulse">
              <AlertTriangle className="w-10 h-10 text-amber-500" />
            </div>
          </div>
        </div>

        {/* Text content */}
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 mb-4">
          {t('notFound.title')}
        </h1>
        <p className="text-slate-500 text-base mb-10 leading-relaxed">
          {t('notFound.subtitle')}
        </p>

        {/* CTA Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-300"
        >
          <Home className="w-4 h-4" />
          {t('notFound.backHome')}
        </Link>

        {/* Decorative tiles */}
        <div className="mt-14 flex justify-center gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-slate-300 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
