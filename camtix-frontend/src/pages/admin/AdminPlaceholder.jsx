import React from 'react';
import { useTranslation } from 'react-i18next';

export default function AdminPlaceholder({ title }) {
  const { t } = useTranslation();
  const displayTitle = title || t('admin.adminModule');

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">
            {displayTitle}
          </h1>
          <p className="text-sm text-slate-500 mt-1">{t('admin.adminModuleSub')}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
        <span className="text-4xl block mb-4 opacity-50">🚧</span>
        <h3 className="text-lg font-bold text-slate-800 mb-2">{t('admin.featureNotReady')}</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          {t('admin.featureUnderConstruction', { module: displayTitle })}
        </p>
      </div>
    </div>
  );
}
