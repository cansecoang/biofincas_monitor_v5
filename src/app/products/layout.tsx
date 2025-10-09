import { ReactNode } from 'react';
import TabsLayout from '@/components/TabsLayout';

const productTabs = [
  { id: 'list', label: 'List', href: '/products/list' },
  { id: 'gantt', label: 'Gantt', href: '/products/gantt' },
  { id: 'metrics', label: 'Metrics', href: '/products/metrics' },
];

export default function ProductsLayout({ children }: { children: ReactNode }) {
  return (
    <TabsLayout tabs={productTabs} basePath="/products">
      {children}
    </TabsLayout>
  );
}
