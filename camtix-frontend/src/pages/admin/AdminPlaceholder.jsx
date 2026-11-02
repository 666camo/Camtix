import React from 'react';
import { useTranslation } from 'react-i18next';

export default function AdminPlaceholder({ title }) {
  const { t } = useTranslation();
  const displayTitle = title || t('admin.adminModule');

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-fg">
            {displayTitle}
          </h1>
          <p className="text-sm text-fg-muted mt-1">{t('admin.adminModuleSub')}</p>
        </div>
      </div>

      <div className="bg-surface rounded-2xl border border-border p-12 text-center shadow-card">
        <span className="text-4xl block mb-4 opacity-50">🚧</span>
        <h3 className="text-lg font-bold text-fg mb-2">{t('admin.featureNotReady')}</h3>
        <p className="text-sm text-fg-muted max-w-md mx-auto">
          {t('admin.featureUnderConstruction', { module: displayTitle })}
        </p>
      </div>
    </div>
  );
}
