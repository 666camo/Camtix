import { useTranslation } from 'react-i18next';
import StatusPage from '../components/StatusPage';

export default function ServerError() {
  const { t } = useTranslation();
  return <StatusPage code="500" title={t('serverError.title')} description={t('serverError.subtitle')} retry={true} />;
}
