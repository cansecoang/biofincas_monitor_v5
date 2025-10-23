'use client';

import { ReactNode, useState, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import TabsLayout from '@/components/TabsLayout';

// Tabs específicas para Indicators
const indicatorTabs = [
  { id: 'overview', label: 'Overview', href: '/indicators/overview' },
  { id: 'performance', label: 'Performance', href: '/indicators/performance' },
  { id: 'trends', label: 'Trends', href: '/indicators/trends' },
  { id: 'reports', label: 'Reports', href: '/indicators/reports' },
];

// Interfaces
interface Output {
  output_id: number;
  output_number: string;
  output_name: string;
}

interface Workpackage {
  workpackage_id: number;
  workpackage_name: string;
  workpackage_description?: string;
}

interface Country {
  country_id: number;
  country_name: string;
}

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const header = pageHeaders[pathname] || { title: 'Indicators', subtitle: 'Performance tracking system' };

  // Estados para los dropdowns
  const [outputs, setOutputs] = useState<Output[]>([]);
  const [workpackages, setWorkpackages] = useState<Workpackage[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedOutput, setSelectedOutput] = useState<string>('');
  const [selectedWorkpackage, setSelectedWorkpackage] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState<string>('');

  // Cargar datos de los endpoints
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [outputsRes, workpackagesRes, countriesRes] = await Promise.all([
          fetch('/api/outputs'),
          fetch('/api/work-packages'),
          fetch('/api/countries')
        ]);

        const outputsData = await outputsRes.json();
        const workpackagesData = await workpackagesRes.json();
        const countriesData = await countriesRes.json();

        if (outputsData.success) setOutputs(outputsData.outputs);
        if (workpackagesData.success) setWorkpackages(workpackagesData.workpackages);
        if (countriesData.success) setCountries(countriesData.countries);
      } catch (error) {
        console.error('Error loading dropdown data:', error);
      }
    };

    fetchData();
  }, []);

  // Sincronizar estados con URL params al cargar
  useEffect(() => {
    const outputId = searchParams.get('outputId');
    const workpackageId = searchParams.get('workpackageId');
    const countryId = searchParams.get('countryId');

    if (outputId) setSelectedOutput(outputId);
    if (workpackageId) setSelectedWorkpackage(workpackageId);
    if (countryId) setSelectedCountry(countryId);
  }, [searchParams]);

  // Función para actualizar URL con los parámetros seleccionados
  const updateURL = (outputId: string, workpackageId: string, countryId: string) => {
    const params = new URLSearchParams();
    
    if (outputId) params.append('outputId', outputId);
    if (workpackageId) params.append('workpackageId', workpackageId);
    if (countryId) params.append('countryId', countryId);
    
    const queryString = params.toString();
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
    
    router.push(newUrl, { scroll: false });
  };

  // Handlers para cada dropdown
  const handleOutputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedOutput(value);
    updateURL(value, selectedWorkpackage, selectedCountry);
  };

  const handleWorkpackageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedWorkpackage(value);
    updateURL(selectedOutput, value, selectedCountry);
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedCountry(value);
    updateURL(selectedOutput, selectedWorkpackage, value);
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
                <option key={output.output_id} value={output.output_id}>
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

          {/* Workpackage Dropdown */}
          <div className="relative w-36">
            <select 
              value={selectedWorkpackage}
              onChange={handleWorkpackageChange}
              className="appearance-none w-full bg-white border border-gray-300 rounded-full px-4 py-2 pr-10 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer"
            >
              <option value="">Workpackage</option>
              <option value="all">Todos</option>
              {workpackages.map((wp) => (
                <option key={wp.workpackage_id} value={wp.workpackage_id}>
                  {wp.workpackage_name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Countries Dropdown */}
          <div className="relative w-36">
            <select 
              value={selectedCountry}
              onChange={handleCountryChange}
              className="appearance-none w-full bg-white border border-gray-300 rounded-full px-4 py-2 pr-10 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer"
            >
              <option value="">Country</option>
              <option value="all">Todos</option>
              {countries.map((country) => (
                <option key={country.country_id} value={country.country_id}>
                  {country.country_name}
                </option>
              ))}
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
