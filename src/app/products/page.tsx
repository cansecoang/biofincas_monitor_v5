import { redirect } from 'next/navigation';

// Redirigir /products a /products/list por defecto
export default function ProductsPage() {
  redirect('/products/list');
}
