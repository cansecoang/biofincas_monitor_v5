import { ReactNode } from 'react';
import TabsLayout from '@/components/TabsLayout';

// Tabs específicas para Indicators
const indicatorTabs = [
  { id: 'overview', label: 'Overview', href: '/indicators/overview' },
  { id: 'performance', label: 'Performance', href: '/indicators/performance' },
  { id: 'trends', label: 'Trends', href: '/indicators/trends' },
  { id: 'reports', label: 'Reports', href: '/indicators/reports' },
];

export default function IndicatorsLayout({ children }: { children: ReactNode }) {
  return (
    <TabsLayout tabs={indicatorTabs} basePath="/indicators">
      {children}
    </TabsLayout>
  );
}
