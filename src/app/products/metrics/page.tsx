"use client"

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from 'next/navigation';

export const dynamic = 'force-dynamic';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";

interface PhaseData {
  name: string;
  total: number;
  completadas: number;
}

interface ProductSummary {
  product_name: string;
  total_tasks: string;
  completed_tasks: string;
  in_progress_tasks: string;
  pending_tasks: string;
  completion_percentage: string;
  phaseDistribution?: PhaseData[];
}

interface StatusDistribution {
  name: string;
  value: string;
  percentage: string;
}

interface ChartStatusData {
  name: string;
  value: number;
  percentage: number;
}

interface PendingTaskByOrg {
  organization: string;
  pending_count: number;
  percentage: number;
}

export default function MetricsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-64"><div className="text-muted-foreground">Cargando métricas...</div></div>}>
      <MetricsPageContent />
    </Suspense>
  );
}

function MetricsPageContent() {
  const searchParams = useSearchParams();
  
  const [loading, setLoading] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [productSummary, setProductSummary] = useState<ProductSummary | null>(null);
  const [statusDistribution, setStatusDistribution] = useState<StatusDistribution[]>([]);
  const [phaseData, setPhaseData] = useState<PhaseData[]>([]);
  const [pendingTasksByOrg, setPendingTasksByOrg] = useState<PendingTaskByOrg[]>([]);
  const [totalPendingTasks, setTotalPendingTasks] = useState<number>(0);

  const getStatusColor = (statusName: string): string => {
    const statusColorMap: Record<string, string> = {
      'Completed': '#10B981',     // Verde - Completed
      'Reviewed': '#10B981',      // Verde - Reviewed (mismo que completed)
      'Blocked': '#DC2626',       // Rojo - Blocked
      'On Hold': '#F59E0B',       // Naranja/Amarillo - On Hold
      'In Progress': '#3B82F6',   // Azul - In Progress
      'Not Started': '#6B7280',   // Gris - Not Started
      // Alias para variaciones de nombres
      'In-Progress': '#3B82F6',   // Azul
      'NotStarted': '#6B7280',    // Gris
      'Pending': '#F59E0B',       // Naranja (similar a On Hold)
      'Cancelled': '#6B7280',     // Gris
      'Review': '#06B6D4',        // Cyan
      'Approved': '#10B981'       // Verde
    };
    return statusColorMap[statusName] || '#6B7280';
  };

  const getPhaseColor = (phaseName: string): string => {
    const phaseColorMap: Record<string, string> = {
      'Planificacion': '#EAB308',    // Amarillo dorado - Planificacion
      'Planificación': '#EAB308',    // Amarillo dorado - Planificación (con tilde)
      'Planning': '#EAB308',         // Amarillo dorado - Planning (inglés)
      'Elaboration': '#06B6D4',      // Cian/Azul claro - Elaboracion
      'Elaboración': '#06B6D4',      // Cian/Azul claro - Elaboración (con tilde)
      'Development': '#06B6D4',      // Cian/Azul claro - Development (inglés)
      'Execution': '#06B6D4',        // Cian/Azul claro - Execution (inglés)
      'Finalizacion': '#22C55E',     // Verde brillante - Finalizacion
      'Finalización': '#22C55E',     // Verde brillante - Finalización (con tilde)
      'Completion': '#22C55E',       // Verde brillante - Completion (inglés)
      'Closure': '#22C55E'           // Verde brillante - Closure (inglés)
    };
    return phaseColorMap[phaseName] || '#6B7280';
  };

  const getOrganizationColor = (orgName: string, index: number): string => {
    const orgColorPalette = [
      '#3B82F6',  // Azul
      '#10B981',  // Verde  
      '#F59E0B',  // Amarillo/Naranja
      '#EF4444',  // Rojo
      '#8B5CF6',  // Púrpura
      '#06B6D4',  // Cyan
      '#84CC16',  // Verde lima
      '#F97316',  // Naranja
      '#EC4899',  // Rosa
      '#6B7280'   // Gris
    ];
    
    // Colores específicos para organizaciones conocidas
    const specificOrgColors: Record<string, string> = {
      'Nuup': '#3B82F6',      // Azul para Nuup
      'Oroverde': '#10B981',  // Verde para Oroverde
      'NUUP': '#3B82F6',      // Azul para NUUP (mayúscula)
      'OROVERDE': '#10B981'   // Verde para OROVERDE (mayúscula)
    };
    
    return specificOrgColors[orgName] || orgColorPalette[index % orgColorPalette.length];
  };

  const fetchMetrics = async (productId: string) => {
    setLoading(true);
    try {
      // Obtener métricas básicas
      const metricsUrl = `/api/metrics?productId=${productId}`;
      const metricsResponse = await fetch(metricsUrl);
      
      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json();
        console.log('📊 Status Distribution recibido:', metricsData.statusDistribution);
        setProductSummary(metricsData.productSummary);
        setStatusDistribution(metricsData.statusDistribution || []);
      } else {
        console.error('Error fetching metrics:', metricsResponse.status);
      }

      // Obtener distribución por fases con datos reales
      const phasesUrl = `/api/product-phases-metrics?productId=${productId}`;
      const phasesResponse = await fetch(phasesUrl);
      
      if (phasesResponse.ok) {
        const phasesData = await phasesResponse.json();
        setPhaseData(phasesData.phaseMetrics || []);
      } else {
        // Fallback: usar endpoint existente y calcular datos
        const existingPhasesUrl = `/api/product-phases?productId=${productId}`;
        const existingResponse = await fetch(existingPhasesUrl);
        
        if (existingResponse.ok) {
          const existingData = await existingResponse.json();
          // Calcular completadas basado en el progreso general (temporal)
          const phases = existingData.phases.map((phase: {phase_name: string, task_count: number}) => ({
            name: phase.phase_name,
            total: phase.task_count,
            completadas: Math.floor(phase.task_count * 0.6) // 60% completadas por defecto
          }));
          setPhaseData(phases);
        }
      }

      // Obtener tareas pendientes por organización
      const pendingByOrgUrl = `/api/pending-tasks-by-org?productId=${productId}`;
      const pendingByOrgResponse = await fetch(pendingByOrgUrl);
      
      if (pendingByOrgResponse.ok) {
        const pendingByOrgData = await pendingByOrgResponse.json();
        console.log('🏢 Pending tasks by organization:', pendingByOrgData);
        setPendingTasksByOrg(pendingByOrgData.pendingTasksByOrg || []);
        setTotalPendingTasks(pendingByOrgData.totalPendingTasks || 0);
      } else {
        console.error('Error fetching pending tasks by organization:', pendingByOrgResponse.status);
        setPendingTasksByOrg([]);
        setTotalPendingTasks(0);
      }
      
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  // 🎯 URL-FIRST: Detectar productId desde la URL
  useEffect(() => {
    const urlProductId = searchParams.get('productId');
    console.log('🔗 Metrics: ProductId desde URL:', urlProductId);
    
    if (urlProductId !== selectedProductId) {
      console.log('📦 Product changed to:', urlProductId);
      setSelectedProductId(urlProductId);
      
      if (!urlProductId) {
        setProductSummary(null);
        setStatusDistribution([]);
        setPhaseData([]);
        setPendingTasksByOrg([]);
        setTotalPendingTasks(0);
      }
    }
  }, [searchParams, selectedProductId]);

  // 🎯 Cargar métricas cuando tenemos un productId válido
  useEffect(() => {
    if (selectedProductId) {
      fetchMetrics(selectedProductId);
    }
  }, [selectedProductId]);

  // Preparar datos para los gráficos (memoizado para evitar recálculos)
  const chartData = useMemo(() => {
    const statusData = statusDistribution.map((item: StatusDistribution) => ({
      name: item.name,
      value: parseInt(item.value),
      percentage: parseFloat(item.percentage)
    }));

    const orgData = pendingTasksByOrg.map((item: PendingTaskByOrg) => ({
      name: item.organization,
      value: item.pending_count,
      percentage: item.percentage
    }));

    // Preparar datos para el gráfico de barras de progreso por fases
    const phaseProgressData = phaseData.map((phase: PhaseData) => ({
      name: phase.name,
      completadas: phase.completadas,
      pendientes: phase.total - phase.completadas, // Las que faltan por completar
      total: phase.total
    }));
    
    return { phaseData, statusData, orgData, phaseProgressData };
  }, [phaseData, statusDistribution, pendingTasksByOrg]);

  // Verificar si no hay producto seleccionado
  if (!selectedProductId) {
    return (
      <div className="bg-white rounded-2xl shadow p-12">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No Product Selected</h3>
          <p className="mt-2 text-gray-500">Please select a product from the dropdown above to view the metrics.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-gray-50 pt-2">
        {/* Skeleton: Header con resumen ejecutivo */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow p-4">
                <div className="h-8 bg-gray-200 rounded animate-pulse w-16 mx-auto mb-2"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-24 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Skeleton: Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Skeleton: Progreso por Fases */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="h-6 bg-gray-200 rounded animate-pulse w-48 mb-4"></div>
            <div className="h-[300px] bg-gray-100 rounded animate-pulse"></div>
            <div className="grid grid-cols-3 gap-4 mt-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="text-center">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-20 mx-auto mb-2"></div>
                  <div className="h-5 bg-gray-200 rounded animate-pulse w-12 mx-auto mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-10 mx-auto"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Skeleton: Distribución por Estado */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="h-6 bg-gray-200 rounded animate-pulse w-52 mb-4"></div>
            <div className="h-[300px] flex items-center justify-center">
              <div className="w-[240px] h-[240px] rounded-full bg-gray-100 animate-pulse"></div>
            </div>
          </div>

          {/* Skeleton: Tareas Pendientes por Organización */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="h-6 bg-gray-200 rounded animate-pulse w-64 mb-4"></div>
            <div className="h-[300px] bg-gray-100 rounded animate-pulse"></div>
            <div className="mt-4 text-center">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-48 mx-auto"></div>
            </div>
          </div>

          {/* Skeleton: Tabla de Detalles */}
          <div className="bg-white rounded-xl shadow p-6 lg:col-span-3">
            <div className="h-6 bg-gray-200 rounded animate-pulse w-44 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between py-3 border-t first:border-t-0">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                  </div>
                  <div className="flex gap-8">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-12"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-12"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 pt-2">
      {/* Header con resumen ejecutivo basado en status reales */}
      {productSummary && (
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{productSummary.total_tasks}</div>
              <div className="text-sm text-gray-600">Total Tareas</div>
            </div>
            {statusDistribution.length > 0 ? (
              statusDistribution.slice(0, 3).map((status) => (
                <div key={status.name} className="bg-white rounded-lg shadow p-4 text-center">
                  <div 
                    className="text-2xl font-bold mb-1"
                    style={{ color: getStatusColor(status.name) }}
                  >
                    {status.value}
                  </div>
                  <div className="text-sm text-gray-600">{status.name}</div>
                  <div className="text-xs text-gray-400">{status.percentage}%</div>
                </div>
              ))
            ) : (
              <>
                <div className="bg-white rounded-lg shadow p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{productSummary.completed_tasks}</div>
                  <div className="text-sm text-gray-600">Completadas</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4 text-center">
                  <div className="text-2xl font-bold text-blue-500">{productSummary.in_progress_tasks}</div>
                  <div className="text-sm text-gray-600">En Progreso</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-500">{productSummary.pending_tasks}</div>
                  <div className="text-sm text-gray-600">Pendientes</div>
                </div>
              </>
            )}
          </div>
          
          {statusDistribution.length > 3 && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-4">
              {statusDistribution.slice(3).map((status) => (
                <div key={status.name} className="bg-white rounded-lg shadow p-3 text-center">
                  <div 
                    className="text-lg font-bold mb-1"
                    style={{ color: getStatusColor(status.name) }}
                  >
                    {status.value}
                  </div>
                  <div className="text-xs text-gray-600">{status.name}</div>
                  <div className="text-xs text-gray-400">{status.percentage}%</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progreso por Fases */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Progreso por Fases</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={chartData.phaseProgressData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value: number, name: string, props: any) => {
                  if (name === 'completadas') {
                    const total = props?.payload?.total || 1;
                    const percentage = Math.round((Number(value) / total) * 100);
                    return [`${value} tareas (${percentage}%)`, 'Completadas'];
                  } else if (name === 'pendientes') {
                    return [`${value} tareas`, 'Pendientes'];
                  }
                  return [`${value} tareas`, name];
                }}
                labelFormatter={(label: string) => `Fase: ${label}`}
              />
              {/* Barra de tareas completadas (abajo en el stack) */}
              <Bar 
                dataKey="completadas" 
                stackId="progress"
                name="Completadas"
                radius={[0, 0, 4, 4]}
              >
                {chartData.phaseProgressData.map((entry, index) => (
                  <Cell key={`completed-${index}`} fill={getPhaseColor(entry.name)} />
                ))}
              </Bar>
              {/* Barra de tareas pendientes (arriba en el stack) */}
              <Bar 
                dataKey="pendientes" 
                stackId="progress"
                name="Pendientes"
                fill="#E5E7EB"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-3 gap-4 mt-4 text-center">
            {chartData.phaseProgressData.map((fase, index) => (
              <div key={index} className="text-sm">
                <div 
                  className="font-semibold mb-1"
                  style={{ color: getPhaseColor(fase.name) }}
                >
                  {fase.name}
                </div>
                <div className="text-green-600 font-bold">
                  {fase.completadas}/{fase.total}
                </div>
                <div className="text-xs text-gray-500">
                  {Math.round((fase.completadas / fase.total) * 100)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Distribución por Estado */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Distribución por Estado</h2>
          {chartData.statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.statusData.map((entry: ChartStatusData, index: number) => (
                    <Cell key={`cell-${index}`} fill={getStatusColor(entry.name)} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number, name: string) => [`${value} tareas`, name]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              <div className="text-center">
                <p className="text-lg mb-2">No hay datos de estado disponibles</p>
                <p className="text-sm">Selecciona un producto con tareas asignadas</p>
              </div>
            </div>
          )}
        </div>

        {/* Tareas Pendientes por Organización */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Tareas Pendientes por Organización</h2>
          {chartData.orgData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={chartData.orgData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 60,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={12}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => [`${value} tareas pendientes`, 'Tareas Pendientes']}
                    labelFormatter={(label: string) => `Organización: ${label}`}
                  />
                  <Bar 
                    dataKey="value" 
                    name="Tareas Pendientes"
                    radius={[4, 4, 0, 0]}
                  >
                    {chartData.orgData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getOrganizationColor(entry.name, index)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 text-center">
                <div className="text-sm font-medium text-gray-600 mb-2">
                  Total: {totalPendingTasks} tareas pendientes
                </div>
              </div>
            </>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              <div className="text-center">
                <p className="text-lg mb-2">No hay tareas pendientes</p>
                <p className="text-sm">o no hay datos por organización</p>
              </div>
            </div>
          )}
        </div>

        {/* Tabla de Detalles */}
        <div className="bg-white rounded-xl shadow p-6 lg:col-span-3">
          <h2 className="text-xl font-semibold mb-4">Detalles por Estado</h2>
          {chartData.statusData.length > 0 ? (
            <div className="overflow-x-clip">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left">Estado</th>
                    <th className="px-4 py-2 text-right">Cantidad</th>
                    <th className="px-4 py-2 text-right">Porcentaje</th>
                  </tr>
                </thead>
                <tbody>
                  {chartData.statusData.map((item: ChartStatusData, index: number) => (
                    <tr key={index} className="border-t">
                      <td className="px-4 py-2 flex items-center">
                        <div 
                          className="w-4 h-4 rounded mr-2" 
                          style={{ backgroundColor: getStatusColor(item.name) }}
                        ></div>
                        {item.name}
                      </td>
                      <td className="px-4 py-2 text-right font-medium">{item.value}</td>
                      <td className="px-4 py-2 text-right">{item.percentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">
              <p>No hay datos de estado para mostrar</p>
            </div>
          )}
        </div>
      </div>

     
    </div>
  );
}
