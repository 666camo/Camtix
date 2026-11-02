import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';

export default function CheckoutSteps({ current }) {
  const { i18n } = useTranslation();
  const labels = i18n.language.startsWith('en') ? ['Choose tickets', 'Booking', 'Payment'] : ['Pilih tiket', 'Pemesanan', 'Pembayaran'];
  return <ol className="checkout-steps" aria-label={i18n.language.startsWith('en') ? 'Booking progress' : 'Tahapan pemesanan'}>
    {labels.map((label, index) => <li key={label} className={index === current ? 'is-current' : index < current ? 'is-complete' : ''} aria-current={index === current ? 'step' : undefined}>
      <span>{index < current ? <Check size={14} aria-hidden="true" /> : `0${index + 1}`}</span>{label}
    </li>)}
  </ol>;
}
