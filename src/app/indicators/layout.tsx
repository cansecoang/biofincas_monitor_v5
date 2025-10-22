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
      <div className="mb-6 flex items-start justify-between">
        {/* Header Section */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{header.title}</h1>
          <p className="text-gray-600">{header.subtitle}</p>
        </div>

        {/* Dropdowns Section */}
        <div className="flex gap-3 pr-6">
          {/* Output Dropdown */}
          <div className="relative">
            <select className="appearance-none bg-white border border-gray-300 rounded-full px-4 py-2 pr-10 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer">
              <option>Output</option>
              <option>Output 1</option>
              <option>Output 2</option>
              <option>Output 3</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Workpackage Dropdown */}
          <div className="relative">
            <select className="appearance-none bg-white border border-gray-300 rounded-full px-4 py-2 pr-10 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer">
              <option>Workpackage</option>
              <option>Package 1</option>
              <option>Package 2</option>
              <option>Package 3</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Countries Dropdown */}
          <div className="relative">
            <select className="appearance-none bg-white border border-gray-300 rounded-full px-4 py-2 pr-10 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer">
              <option>Country</option>
              <option>Country 1</option>
              <option>Country 2</option>
              <option>Package 3</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          
        </div>
      </div>
      {children}
    </TabsLayout>
  );
}
