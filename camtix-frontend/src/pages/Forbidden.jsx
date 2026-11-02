import { useTranslation } from 'react-i18next';
import StatusPage from '../components/StatusPage';

export default function Forbidden() {
  const { t } = useTranslation();
  return <StatusPage code="403" title={t('forbidden.title')} description={t('forbidden.subtitle')} retry={false} />;
}
