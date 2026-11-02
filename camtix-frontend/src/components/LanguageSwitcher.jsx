import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const set = (lang) => {
    if (i18n.language !== lang) {
      i18n.changeLanguage(lang);
      localStorage.setItem('camtix-lang', lang);
    }
  };

  const isID = i18n.language === 'id';

  return (
    <div
      className="inline-flex items-center gap-0.5 p-0.5 bg-surface rounded-lg border border-border select-none"
      title="Pilih Bahasa / Choose Language"
    >
      <button
        type="button"
        onClick={() => set('id')}
        className={`px-2.5 py-1 rounded-md text-[11px] font-700 transition-colors cursor-pointer ${
          isID
            ? 'bg-brand text-white'
            : 'text-fg-secondary hover:text-fg'
        }`}
      >
        ID
      </button>
      <button
        type="button"
        onClick={() => set('en')}
        className={`px-2.5 py-1 rounded-md text-[11px] font-700 transition-colors cursor-pointer ${
          !isID
            ? 'bg-brand text-white'
            : 'text-fg-secondary hover:text-fg'
        }`}
      >
        EN
      </button>
    </div>
  );
}
