import { useTranslation } from 'react-i18next';
import StatusPage from '../components/StatusPage';

export default function Unauthorized() {
 const { i18n } = useTranslation();
 const en = i18n.language.startsWith('en');
 return <StatusPage code="401" title={en ? 'Your account, your access.' : 'Masuk dulu, lanjut setelahnya.'} description={en ? 'Sign in to open your bookings and tickets.' : 'Masuk ke akun untuk membuka pesanan dan tiket konsermu.'} />;
}
