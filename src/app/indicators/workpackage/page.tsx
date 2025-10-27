'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

interface Indicator {
  indicator_id: number;
  indicator_code: string;
  indicator_name: string;
  assigned_products_count: number;
  completion_percentage: number;
}

interface Output {
  output_number: number;
  output_name: string;
  indicators: Indicator[];
}

interface WorkpackageProgressData {
  success: boolean;
  workpackage_id: string;
  outputs: Output[];
  total_indicators: number;
}

export default function WorkpackageIndicatorsPage() {
  const searchParams = useSearchParams();
  const selectedWorkpackage = searchParams.get('workpackageId');
  
  const [data, setData] = useState<WorkpackageProgressData | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch data cuando hay un workpackage seleccionado
  useEffect(() => {
    if (!selectedWorkpackage) {
      setData(null);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/workpackage-output-progress?workpackage=${selectedWorkpackage}`);
        const result = await response.json();
        
        if (result.success) {
          setData(result);
        } else {
          console.error('Error fetching data:', result.error);
          setData(null);
        }
      } catch (error) {
        console.error('Error fetching workpackage output progress:', error);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedWorkpackage]);

  // Función para obtener el color de la barra de progreso
  const getProgressColor = (percentage: number) => {
    if (percentage >= 75) return 'from-blue-500 to-cyan-400';
    if (percentage >= 50) return 'from-yellow-500 to-orange-400';
    if (percentage >= 25) return 'from-orange-500 to-red-400';
    return 'from-red-500 to-red-600';
  };

  if (!selectedWorkpackage) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No Workpackage Selected</h3>
          <p className="mt-2 text-gray-500">Please select a workpackage from the dropdown above to view indicator progress.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-32 mb-6"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!data || data.outputs.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No Data Available</h3>
          <p className="mt-2 text-gray-500">No indicators found for this workpackage</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {data.outputs.map((output) => (
        <div 
          key={output.output_number} 
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
        >
          {/* Header del output */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              {output.output_name}
            </h2>
            <p className="text-sm text-gray-500">
              Shows indicators of output {output.output_number}
            </p>
          </div>

          {/* Lista de indicadores */}
          <div className="space-y-6">
            {output.indicators.map((indicator) => (
              <div key={indicator.indicator_id} className="space-y-2">
                {/* Header del indicador */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">
                      META {indicator.indicator_code}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {indicator.assigned_products_count} product{indicator.assigned_products_count !== 1 ? 's' : ''} assigned
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {indicator.completion_percentage}%
                    </div>
                  </div>
                </div>

                {/* Barra de progreso */}
                <div className="relative w-full h-6 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${getProgressColor(indicator.completion_percentage)} transition-all duration-500 ease-out rounded-full`}
                    style={{ width: `${indicator.completion_percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
