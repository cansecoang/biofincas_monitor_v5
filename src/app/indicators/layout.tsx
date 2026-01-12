'use client';

import { ReactNode, useState, useEffect, Suspense } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import TabsLayout from '@/components/TabsLayout';

// Tabs específicas para Indicators
const indicatorTabs = [
  { id: 'overview', label: 'Overview', href: '/indicators/overview' },
  { id: 'output', label: 'Output', href: '/indicators/output' },
];

// Interfaces
interface Output {
  output_id: number;
  output_number: string;
  output_name: string;
}

interface Organization {
  organization_id: number;
  organization_name: string;
}

// Configuración de títulos y subtítulos por ruta
const pageHeaders: Record<string, { title: string; subtitle: string }> = {
  '/indicators/overview': {
    title: 'Indicators Overview',
    subtitle: 'Key performance indicators and metrics dashboard'
  },
  '/indicators/output': {
    title: 'Output Indicators',
    subtitle: 'View indicators organized by output'
  }
};

function IndicatorsLayoutContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const header = pageHeaders[pathname] || { title: 'Indicators', subtitle: 'Performance tracking system' };

  // Estados para los dropdowns
  const [outputs, setOutputs] = useState<Output[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOutput, setSelectedOutput] = useState<string>('');
  const [selectedOrganization, setSelectedOrganization] = useState<string>('');

  // Cargar datos de los endpoints
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [outputsRes, organizationsRes] = await Promise.all([
          fetch('/api/outputs'),
          fetch('/api/organizations')
        ]);

        const outputsData = await outputsRes.json();
        const organizationsData = await organizationsRes.json();

        if (outputsData.success) setOutputs(outputsData.outputs);
        if (organizationsData.success) setOrganizations(organizationsData.organizations);
      } catch (error) {
        console.error('Error loading dropdown data:', error);
      }
    };

    fetchData();
  }, []);

  // Sincronizar estados con URL params al cargar
  useEffect(() => {
    const outputId = searchParams.get('outputId');
    const organizationId = searchParams.get('organizationId');

    if (outputId) setSelectedOutput(outputId);
    if (organizationId) setSelectedOrganization(organizationId);
  }, [searchParams]);

  // Función para actualizar URL con los parámetros seleccionados
  const updateURL = (outputId: string, organizationId: string) => {
    const params = new URLSearchParams();
    
    if (outputId) params.append('outputId', outputId);
    if (organizationId) params.append('organizationId', organizationId);
    
    const queryString = params.toString();
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
    
    router.push(newUrl, { scroll: false });
  };

  // Handlers para cada dropdown
  const handleOutputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedOutput(value);
    updateURL(value, selectedOrganization);
  };

  const handleOrganizationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedOrganization(value);
    updateURL(selectedOutput, value);
  };

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
          <div className="relative w-36">
            <select 
              value={selectedOutput}
              onChange={handleOutputChange}
              className="appearance-none w-full bg-white border border-gray-300 rounded-full px-4 py-2 pr-10 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer"
            >
              <option value="">Output</option>
              {outputs.map((output) => (
                <option key={output.output_id} value={output.output_number}>
                  {output.output_name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Organization Dropdown */}
          {pathname === '/indicators/overview' && (
            <div className="relative w-36">
              <select 
                value={selectedOrganization}
                onChange={handleOrganizationChange}
                className="appearance-none w-full bg-white border border-gray-300 rounded-full px-4 py-2 pr-10 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer"
              >
                <option value="">Organization</option>
                <option value="all">Todos</option>
                {organizations.map((org) => (
                  <option key={org.organization_id} value={org.organization_id}>
                    {org.organization_name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>
      {children}
    </TabsLayout>
  );
}

export default function IndicatorsLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <IndicatorsLayoutContent>{children}</IndicatorsLayoutContent>
    </Suspense>
  );
}
