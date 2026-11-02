import { Music, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function CatalogState({ loading = false, title, description, onRetry, actionLabel }) {
  const { t } = useTranslation();
  if (loading) return <div className="catalog-skeleton" role="status" aria-busy="true" aria-label={title}>
    {[0, 1, 2].map(index => <div key={index} className="skeleton-event" aria-hidden="true"><div /><span /><span /></div>)}
    <span className="sr-only">{title}</span>
  </div>;
  return <div className="catalog-feedback" role="status"><Music size={28} aria-hidden="true" /><h3>{title}</h3>{description && <p>{description}</p>}{onRetry && <button type="button" onClick={onRetry}><RefreshCw size={15} aria-hidden="true" />{actionLabel || t('polish.tryAgain')}</button>}</div>;
}
