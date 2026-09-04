import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const setLanguage = (lang) => {
    if (i18n.language !== lang) {
      i18n.changeLanguage(lang);
      localStorage.setItem('camtix-lang', lang);
    }
  };

  const isID = i18n.language === 'id';

  return (
    <div 
      className="inline-flex items-center gap-1 p-1 bg-slate-100/90 hover:bg-slate-100 rounded-full border border-slate-200/90 shadow-sm transition-all select-none"
      title="Pilih Bahasa / Choose Language"
    >
      <div className="pl-1.5 pr-0.5 text-slate-400">
        <Globe className="w-3.5 h-3.5 text-indigo-500" />
      </div>
      
      <button
        type="button"
        onClick={() => setLanguage('id')}
        className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold transition-all cursor-pointer flex items-center gap-1 ${
          isID
            ? 'bg-white text-indigo-600 shadow-sm shadow-indigo-950/5 scale-100'
            : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <span>🇮🇩</span>
        <span>ID</span>
      </button>

      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold transition-all cursor-pointer flex items-center gap-1 ${
          !isID
            ? 'bg-white text-indigo-600 shadow-sm shadow-indigo-950/5 scale-100'
            : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <span>🇬🇧</span>
        <span>EN</span>
      </button>
    </div>
  );
}
