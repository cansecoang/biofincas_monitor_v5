'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import TabsLayout from '@/components/TabsLayout';

// Tabs específicas para Indicators
const indicatorTabs = [
  { id: 'overview', label: 'Overview', href: '/indicators/overview' },
  { id: 'performance', label: 'Performance', href: '/indicators/performance' },
  { id: 'trends', label: 'Trends', href: '/indicators/trends' },
  { id: 'reports', label: 'Reports', href: '/indicators/reports' },
];

// Configuración de títulos y subtítulos por ruta
const pageHeaders: Record<string, { title: string; subtitle: string }> = {
  '/indicators/overview': {
    title: 'Indicators Overview',
    subtitle: 'Key performance indicators and metrics dashboard'
  },
  '/indicators/performance': {
    title: 'Performance Metrics',
    subtitle: 'Detailed performance analysis and trends'
  },
  '/indicators/trends': {
    title: 'Indicator Trends',
    subtitle: 'Historical trends and forecasting'
  },
  '/indicators/reports': {
    title: 'Indicator Reports',
    subtitle: 'Generate and export detailed reports'
  }
};

export default function IndicatorsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const header = pageHeaders[pathname] || { title: 'Indicators', subtitle: 'Performance tracking system' };

  return (
    <TabsLayout tabs={indicatorTabs} basePath="/indicators">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{header.title}</h1>
        <p className="text-gray-600">{header.subtitle}</p>
      </div>
      {children}
    </TabsLayout>
  );
}
