import { useTranslation } from 'react-i18next';
import StatusPage from '../components/StatusPage';

export default function NotFound() {
  const { t } = useTranslation();
  return <StatusPage code="404" title={t('notFound.title')} description={t('notFound.subtitle')} retry={false} />;
}
