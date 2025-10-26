"use client"

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Target, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Activity,
  Package2,
  Eye,
  BarChart3,
  MapPin
} from "lucide-react";
import IndicatorDetailModal from '@/components/IndicatorDetailModal';
import { IndicatorPerformance } from '@/types/indicators';


// 🎯 INTERFACES
interface Output {
  output_number: string;
  output_name: string;
}

interface WorkPackage {
  workpackage_id: number;
  workpackage_name: string;
}

interface OutputData {
  output_number: string;
  indicators: IndicatorPerformance[];
  summary: {
    total_indicators: number;
    avg_completion: number;
    total_tasks: number;
    completed_tasks: number;
    overdue_tasks: number;
  };
}

// 🎯 Helper function to safely convert percentage values
function safePercentage(value: number | string | undefined): number {
  if (typeof value === 'number') return value;
  return parseFloat(value || '0');
}

export default function IndicatorsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-64"><div className="text-muted-foreground">Cargando indicadores...</div></div>}>
      <IndicatorsContent />
    </Suspense>
  );
}

// 🎯 SKELETON COMPONENT: Loading state
function IndicatorsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-64"></div>
          </div>
          <div className="h-20 w-20 bg-gray-200 rounded-full"></div>
        </div>
        
        {/* Metrics skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-4">
              <div className="h-8 bg-gray-200 rounded w-16 mx-auto mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-24 mx-auto"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 animate-pulse">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="h-6 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </div>
              <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
            </div>
            <div className="flex items-center justify-center mb-4">
              <div className="h-24 w-24 bg-gray-200 rounded-full"></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="text-center">
                  <div className="h-6 bg-gray-200 rounded w-12 mx-auto mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-16 mx-auto"></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 🎯 UX-FOCUSED COMPONENT: Circular progress indicator
function CircularProgress({ value, size = 80 }: { value: number; size?: number }) {
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  const getColor = (val: number) => {
    if (val >= 90) return '#22c55e'; // green-500
    if (val >= 75) return '#3b82f6'; // blue-500
    if (val >= 50) return '#f59e0b'; // amber-500
    return '#ef4444'; // red-500
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getColor(value)}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-300 ease-in-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold text-gray-900">{value.toFixed(0)}%</span>
      </div>
    </div>
  );
}

// 🎯 UX-FOCUSED COMPONENT: Performance indicator with semantic colors
function PerformanceIndicator({ value }: { value: number }) {
  const getColorAndIcon = (val: number) => {
    if (val >= 90) return { color: 'text-green-600 bg-green-50', icon: CheckCircle, label: 'Excelente' };
    if (val >= 75) return { color: 'text-blue-600 bg-blue-50', icon: TrendingUp, label: 'Bueno' };
    if (val >= 50) return { color: 'text-orange-600 bg-orange-50', icon: Clock, label: 'Atención' };
    return { color: 'text-red-600 bg-red-50', icon: AlertCircle, label: 'Crítico' };
  };

  const { color, icon: Icon, label } = getColorAndIcon(value);

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${color}`}>
      <Icon className="h-4 w-4" />
      <div className="flex flex-col">
        <span className="text-sm font-semibold">{value.toFixed(1)}%</span>
        <span className="text-xs opacity-75">{label}</span>
      </div>
    </div>
  );
}

// 🎯 UX-FOCUSED COMPONENT: Indicator card
function IndicatorCard({ 
  indicator, 
  onProductClick 
}: { 
  indicator: IndicatorPerformance;
  onProductClick: (productId: number) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all cursor-pointer hover:border-blue-300"
        onClick={() => setOpen(true)}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">
              {indicator.indicator_code}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {indicator.indicator_name}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Package2 className="h-4 w-4 text-gray-400" />
              <span className="text-xs text-gray-500">
                {indicator.assigned_products_count} producto{indicator.assigned_products_count !== 1 ? 's' : ''} asignado{indicator.assigned_products_count !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            indicator.performance_rating === 'excellent' ? 'bg-green-100 text-green-700' :
            indicator.performance_rating === 'good' ? 'bg-blue-100 text-blue-700' :
            indicator.performance_rating === 'warning' ? 'bg-orange-100 text-orange-700' :
            'bg-red-100 text-red-700'
          }`}>
            {indicator.performance_rating === 'excellent' ? 'Excelente' :
             indicator.performance_rating === 'good' ? 'Bueno' :
             indicator.performance_rating === 'warning' ? 'Atención' : 'Crítico'}
          </span>
        </div>
        <div>
          {/* Circular Progress */}
          <div className="flex items-center justify-center mb-4">
            <CircularProgress value={indicator.completion_percentage} size={100} />
          </div>
          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900">{indicator.total_tasks}</div>
              <div className="text-xs text-gray-500">Total Tareas</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-green-600">{indicator.completed_tasks}</div>
              <div className="text-xs text-gray-500">Completadas</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-red-600">{indicator.overdue_tasks}</div>
              <div className="text-xs text-gray-500">Vencidas</div>
            </div>
          </div>
        </div>
      </div>
      {/* Modal de detalle */}
      <IndicatorDetailModal
        indicator={indicator}
        open={open}
        onClose={() => setOpen(false)}
        onProductClick={onProductClick}
      />
    </>
  );
}

function IndicatorsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // 🎯 Estados desde URL
  const [selectedOutput, setSelectedOutput] = useState<string | null>(null);
  const [selectedWorkPackage, setSelectedWorkPackage] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  
  // 🎯 Estado de datos
  const [outputData, setOutputData] = useState<OutputData | null>(null);
  const [loading, setLoading] = useState(false);

  // 🎯 Función para manejar click en producto
  const handleProductClick = (productId: number) => {
    console.log('Product clicked:', productId);
  };

  // 🎯 Leer parámetros de la URL
  useEffect(() => {
    const urlOutput = searchParams.get('outputId');
    const urlWorkPackage = searchParams.get('workpackageId');
    const urlCountry = searchParams.get('countryId');
    
    setSelectedOutput(urlOutput);
    setSelectedWorkPackage(urlWorkPackage);
    setSelectedCountry(urlCountry);
  }, [searchParams]);

  // 🎯 Fetch data cuando hay un output seleccionado
  useEffect(() => {
    if (!selectedOutput) {
      setOutputData(null);
      return;
    }

    const fetchOutputData = async () => {
      setLoading(true);
      
      try {
        const params = new URLSearchParams();
        params.append('output', selectedOutput);
        
        // Solo agregar workPackage si tiene valor y no es "all"
        if (selectedWorkPackage && selectedWorkPackage !== 'all' && selectedWorkPackage !== '') {
          params.append('workPackage', selectedWorkPackage);
        }

        // Solo agregar country si tiene valor y no es "all"
        if (selectedCountry && selectedCountry !== 'all' && selectedCountry !== '') {
          params.append('country', selectedCountry);
        }

        const response = await fetch(`/api/output-performance?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: OutputData = await response.json();
        setOutputData(data);
      } catch (error) {
        console.error('Error fetching output data:', error);
        setOutputData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOutputData();
  }, [selectedOutput, selectedWorkPackage, selectedCountry]);

  // 🎯 RENDER
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-8xl mx-auto">
        {!selectedOutput ? (
          // Estado: No hay output seleccionado
          <div className="bg-white rounded-2xl shadow p-12">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No Output Selected</h3>
              <p className="mt-2 text-gray-500">Please select an output from the dropdown above to view indicators.</p>
            </div>
          </div>
        ) : loading ? (
          // Estado de carga
          <IndicatorsSkeleton />
        ) : outputData ? (
          // Vista principal: Indicadores del output seleccionado
          <div className="space-y-6">
            {/* Header del output seleccionado */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Output {outputData.output_number}
                  </h2>
                  <p className="text-gray-600">
                    Rendimiento de {outputData.summary.total_indicators} indicadores
                  </p>
                </div>
                <PerformanceIndicator value={outputData.summary.avg_completion} />
              </div>

              {/* Métricas resumen */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div key="total-indicators" className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{outputData.summary.total_indicators}</div>
                  <div className="text-sm text-blue-700">Indicadores</div>
                </div>
                <div key="completed-tasks" className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{outputData.summary.completed_tasks}</div>
                  <div className="text-sm text-green-700">Tareas Completadas</div>
                </div>
                <div key="total-tasks" className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-gray-600">{outputData.summary.total_tasks}</div>
                  <div className="text-sm text-gray-700">Total Tareas</div>
                </div>
                <div key="overdue-tasks" className="bg-red-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">{outputData.summary.overdue_tasks}</div>
                  <div className="text-sm text-red-700">Tareas Vencidas</div>
                </div>
              </div>
            </div>

            {/* Grid de indicadores */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {outputData.indicators.map((indicator) => (
                <IndicatorCard key={indicator.indicator_id} indicator={indicator} onProductClick={handleProductClick} />
              ))}
            </div>

            {outputData.indicators.length === 0 && (
              <div className="text-center py-8 bg-white rounded-2xl border border-gray-200">
                <Eye className="mx-auto h-8 w-8 text-gray-400 mb-4" />
                <div className="text-lg font-medium text-gray-900 mb-2">
                  No hay indicadores disponibles
                </div>
                <p className="text-sm text-gray-500">
                  No se encontraron indicadores para este output.
                </p>
              </div>
            )}
          </div>
        ) : (
          // Estado de error
          <div className="text-center py-12">
            <AlertCircle className="mx-auto h-8 w-8 text-red-500 mb-4" />
            <div className="text-lg font-medium text-gray-900 mb-2">Error al cargar datos</div>
            <p className="text-sm text-gray-500">
              No se pudieron cargar los indicadores. Intenta nuevamente.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}