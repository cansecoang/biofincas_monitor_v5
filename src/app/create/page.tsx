import { redirect } from 'next/navigation';

// Redirect /create to /create/product by default
// Or you could show a selection page here
export default function CreatePage() {
  redirect('/create/product');
}
