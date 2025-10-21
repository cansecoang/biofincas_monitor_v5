'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import GanttChart from '@/components/gantt-chart';

export const dynamic = 'force-dynamic';

interface Task {
  id: number;
  name: string;
  detail?: string;
  start_planned?: string;
  end_planned?: string;
  start_actual?: string;
  end_actual?: string;
  checkin_oro_verde?: string;
  checkin_user?: string;
  checkin_communication?: string;
  checkin_gender?: string;
  phase_id: number;
  phase_name?: string;
  status_id: number;
  status_name?: string;
  product_id: number;
  product_name?: string;
  indicator_id?: number;
  indicator_name?: string;
  org_id?: number;
  org_name?: string;
  created_at: string;
  updated_at: string;
}

interface ApiTask {
  id: number;
  name: string;
  detail?: string;
  start_planned?: string;
  end_planned?: string;
  start_actual?: string;
  end_actual?: string;
  checkin_oro_verde?: string;
  checkin_user?: string;
  checkin_communication?: string;
  checkin_gender?: string;
  phase_id: number;
  phase_name?: string;
  status_id: number;
  status_name?: string;
  product_id: number;
  product_name?: string;
  indicator_id?: number;
  indicator_name?: string;
  org_id?: number;
  org_name?: string;
  created_at?: string;
  updated_at?: string;
}

function GanttPageContent() {
  const searchParams = useSearchParams();
  const productId = searchParams.get('productId');
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar tareas cuando cambia el productId
  useEffect(() => {
    if (!productId) {
      setTasks([]);
      return;
    }

    const fetchTasks = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/product-tasks?productId=${productId}&limit=1000&sortBy=start_planned&sortOrder=asc`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch tasks');
        }

        const data = await response.json();
        
        // Mapear las tareas de la API al formato que espera GanttChart
        const mappedTasks: Task[] = (data.tasks || []).map((task: ApiTask) => ({
          id: task.id,
          name: task.name,
          detail: task.detail,
          start_planned: task.start_planned,
          end_planned: task.end_planned,
          start_actual: task.start_actual,
          end_actual: task.end_actual,
          checkin_oro_verde: task.checkin_oro_verde,
          checkin_user: task.checkin_user,
          checkin_communication: task.checkin_communication,
          checkin_gender: task.checkin_gender,
          phase_id: task.phase_id,
          phase_name: task.phase_name,
          status_id: task.status_id,
          status_name: task.status_name,
          product_id: task.product_id,
          product_name: task.product_name,
          indicator_id: task.indicator_id,
          indicator_name: task.indicator_name,
          org_id: task.org_id,
          org_name: task.org_name,
          created_at: task.created_at || new Date().toISOString(),
          updated_at: task.updated_at || new Date().toISOString(),
        }));
        
        setTasks(mappedTasks);
      } catch (err) {
        console.error('Error loading tasks:', err);
        setError('Error loading tasks');
        setTasks([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [productId]);

  // Función para refrescar datos
  const refreshData = () => {
    if (productId) {
      // Trigger re-fetch by updating a dependency
      setTasks([]);
    }
  };

  // Estado: No hay producto seleccionado
  if (!productId) {
    return (
      <div className="bg-white rounded-2xl shadow p-12">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No Product Selected</h3>
          <p className="mt-2 text-gray-500">Please select a product from the dropdown above to view the Gantt chart.</p>
        </div>
      </div>
    );
  }

  // Estado: Cargando
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow p-8">
        <div className="animate-pulse space-y-4">
          {/* Header skeleton */}
          <div className="flex items-center justify-between mb-6">
            <div className="h-6 bg-gray-200 rounded w-48"></div>
            <div className="flex gap-2">
              <div className="h-8 bg-gray-200 rounded w-24"></div>
              <div className="h-8 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
          
          {/* Gantt rows skeleton */}
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-10 bg-gray-200 rounded w-48"></div>
              <div className="flex-1 h-10 bg-gray-100 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Estado: Error
  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow p-12">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Error Loading Data</h3>
          <p className="mt-2 text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  // Estado: Sin tareas
  if (tasks.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow p-12">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No Tasks Found</h3>
          <p className="mt-2 text-gray-500">This product doesn't have any tasks to display in the Gantt chart.</p>
        </div>
      </div>
    );
  }

  // Renderizar Gantt Chart
  return (
    <div className="space-y-4 w-full overflow-hidden">
      <GanttChart tasks={tasks} refreshData={refreshData} />
    </div>
  );
}

export default function GanttPage() {
  return (
    <Suspense fallback={
      <div className="bg-white rounded-2xl shadow p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Gantt chart...</p>
        </div>
      </div>
    }>
      <GanttPageContent />
    </Suspense>
  );
}