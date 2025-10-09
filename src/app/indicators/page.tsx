import { redirect } from 'next/navigation';

// Redirigir /indicators a /indicators/overview por defecto
export default function IndicatorsPage() {
  redirect('/indicators/overview');
}
