'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import TabsLayout from '@/components/TabsLayout';

const productTabs = [
  { id: 'list', label: 'List', href: '/products/list' },
  { id: 'gantt', label: 'Gantt', href: '/products/gantt' },
  { id: 'metrics', label: 'Metrics', href: '/products/metrics' },
];

// Configuración de títulos y subtítulos por ruta
const pageHeaders: Record<string, { title: string; subtitle: string }> = {
  '/products/list': {
    title: 'Products List',
    subtitle: 'Manage and view all your loan products'
  },
  '/products/gantt': {
    title: 'Products Gantt Chart',
    subtitle: 'Visualize product timelines and milestones'
  },
  '/products/metrics': {
    title: 'Products Metrics',
    subtitle: 'Key performance indicators and analytics'
  }
};

export default function ProductsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const header = pageHeaders[pathname] || { title: 'Products', subtitle: 'Product management system' };

  return (
    <TabsLayout tabs={productTabs} basePath="/products">
      <div className="mb-6 flex items-start justify-between">
        {/* Header Section */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{header.title}</h1>
          <p className="text-gray-600">{header.subtitle}</p>
        </div>

        {/* Dropdowns Section */}
        <div className="flex gap-3 pr-6">
          {/*Botón agregar tarea */}
          <div className="relative">
            <Link 
              href="/create/task"
              className="bg-green-600 text-white rounded-full px-4 py-2 text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 transition-colors inline-block"
            >
              + Add Task
            </Link>
          </div>
          {/* Workpackage Dropdown */}
          <div className="relative">
            <select className="appearance-none bg-white border border-gray-300 rounded-full px-4 py-2 pr-10 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer">
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

          {/* Output Dropdown */}
          <div className="relative">
            <select className="appearance-none bg-white border border-gray-300 rounded-full px-4 py-2 pr-10 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer">
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

          {/* Product Dropdown */}
          <div className="relative">
            <select className="appearance-none bg-white border border-gray-300 rounded-full px-4 py-2 pr-10 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer">
              <option>Product</option>
              <option>Product 1</option>
              <option>Product 2</option>
              <option>Product 3</option>
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

