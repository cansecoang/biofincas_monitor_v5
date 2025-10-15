'use client';

import { ReactNode } from 'react';
import TabsLayout from '@/components/TabsLayout';

const createTabs = [
  { id: 'product', label: 'Product', href: '/create/product' },
  { id: 'task', label: 'Task', href: '/create/task' },
];

export default function CreateLayout({ children }: { children: ReactNode }) {
  return (
    <TabsLayout tabs={createTabs} basePath="/create">
      {children}
    </TabsLayout>
  );
}