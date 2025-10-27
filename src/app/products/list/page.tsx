'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import TaskDetailModal from '@/components/TaskDetailModal';
import { toast } from 'sonner';

export const dynamic = 'force-dynamic';

interface Task {
  id: number;
  name: string;
  detail: string;
  start_planned: string;
  end_planned: string;
  start_actual: string | null;
  end_actual: string | null;
  phase_id: number;
  phase_name: string;
  status_id: number;
  status_name: string;
  org_id: number;
  org_name: string;
  product_id: number;
  product_name: string;
}

interface Status {
  status_id: number;
  status_name: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalTasks: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

function ProductListContent() {
  const searchParams = useSearchParams();
  const productId = searchParams.get('productId');
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<string>('start_planned');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Estados para el modal de detalles
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Cargar statuses al montar
  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const response = await fetch('/api/statuses');
        const data = await response.json();
        setStatuses(data.statuses || []);
      } catch (err) {
        console.error('Error loading statuses:', err);
      }
    };
    
    fetchStatuses();
  }, []);

  // Cargar tareas cuando cambia el productId o la página
  useEffect(() => {
    if (!productId) {
      setTasks([]);
      setPagination(null);
      return;
    }

    const fetchTasks = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/product-tasks?productId=${productId}&page=${currentPage}&limit=10&sortBy=${sortBy}&sortOrder=${sortOrder}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch tasks');
        }

        const data = await response.json();
        setTasks(data.tasks);
        setPagination(data.pagination);
      } catch (err) {
        console.error('Error loading tasks:', err);
        setError('Error loading tasks');
        setTasks([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [productId, currentPage, sortBy, sortOrder]);

  // Formatear fechas
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Obtener color del estado
  const getStatusColor = (statusName: string) => {
    const colors: Record<string, string> = {
      'Not Started': 'bg-gray-100 text-gray-800',
      'In Progress': 'bg-blue-100 text-blue-800',
      'Completed': 'bg-green-100 text-green-800',
      'On Hold': 'bg-yellow-100 text-yellow-800',
      'Cancelled': 'bg-red-100 text-red-800',
    };
    return colors[statusName] || 'bg-gray-100 text-gray-800';
  };

  // Manejar click en header para ordenar
  const handleSort = (column: string) => {
    if (sortBy === column) {
      // Si ya está ordenando por esta columna, cambiar dirección
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Nueva columna, empezar con ascendente
      setSortBy(column);
      setSortOrder('asc');
    }
    setCurrentPage(1); // Resetear a primera página al ordenar
  };

  // Manejar clic en una tarea para abrir el modal
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  // Cerrar el modal
  const closeTaskModal = () => {
    setIsTaskModalOpen(false);
    setSelectedTask(null);
  };

  // Manejar edición (placeholder)
  const handleEdit = () => {
    toast.info('Edit functionality coming soon');
  };

  // Manejar eliminación (placeholder)
  const handleDelete = () => {
    toast.info('Delete functionality coming soon');
    closeTaskModal();
    // Aquí podrías recargar las tareas después de eliminar
  };

  // Manejar cambio de estado
  const handleStatusChange = async (taskId: number, newStatusId: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar que se abra el modal
    
    // Optimistic update
    const oldTasks = [...tasks];
    const newStatus = statuses.find(s => s.status_id === newStatusId);
    
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, status_id: newStatusId, status_name: newStatus?.status_name || task.status_name }
        : task
    ));

    try {
      const response = await fetch('/api/update-task-status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, statusId: newStatusId })
      });

      const data = await response.json();

      if (!data.success) {
        // Revertir si falla
        setTasks(oldTasks);
        toast.error('Failed to update task status');
      } else {
        toast.success('Task status updated successfully');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      setTasks(oldTasks);
      toast.error('Error updating task status');
    }
  };

  // Componente para el ícono de ordenamiento
  const SortIcon = ({ column }: { column: string }) => {
    if (sortBy !== column) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    return sortOrder === 'asc' ? (
      <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  // Estado: No hay producto seleccionado
  if (!productId) {
    return (
      <div className="bg-white rounded-2xl shadow p-12">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No Product Selected</h3>
          <p className="mt-2 text-gray-500">Please select a product from the dropdown above to view its tasks.</p>
        </div>
      </div>
    );
  }

  // Estado: Cargando - Skeleton con efecto de pulso
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phase</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned to</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {[...Array(5)].map((_, i) => (
              <tr key={i}>
                <td className="px-6 py-4">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-6 bg-gray-200 rounded-full animate-pulse w-24"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-28"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
          <h3 className="mt-4 text-lg font-medium text-gray-900">Error Loading Tasks</h3>
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No Tasks Found</h3>
          <p className="mt-2 text-gray-500">This product doesn't have any tasks yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Tasks Table */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                onClick={() => handleSort('name')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
              >
                <div className="flex items-center gap-2">
                  <span>Task Name</span>
                  <SortIcon column="name" />
                </div>
              </th>
              <th 
                onClick={() => handleSort('phase_name')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
              >
                <div className="flex items-center gap-2">
                  <span>Phase</span>
                  <SortIcon column="phase_name" />
                </div>
              </th>
              <th 
                onClick={() => handleSort('status_name')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
              >
                <div className="flex items-center gap-2">
                  <span>Status</span>
                  <SortIcon column="status_name" />
                </div>
              </th>
              <th 
                onClick={() => handleSort('org_name')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
              >
                <div className="flex items-center gap-2">
                  <span>Assigned to</span>
                  <SortIcon column="org_name" />
                </div>
              </th>
              <th 
                onClick={() => handleSort('start_planned')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
              >
                <div className="flex items-center gap-2">
                  <span>Start Date</span>
                  <SortIcon column="start_planned" />
                </div>
              </th>
              <th 
                onClick={() => handleSort('end_planned')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
              >
                <div className="flex items-center gap-2">
                  <span>End Date</span>
                  <SortIcon column="end_planned" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tasks.map((task) => (
              <tr 
                key={task.id} 
                onClick={() => handleTaskClick(task)}
                className="hover:bg-blue-50 transition-colors cursor-pointer"
              >
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{task.name}</div>
                  {task.detail && (
                    <div className="text-sm text-gray-500 truncate max-w-xs">{task.detail}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">{task.phase_name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="relative" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={task.status_id}
                      onChange={(e) => handleStatusChange(task.id, parseInt(e.target.value), e as any)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-8 ${getStatusColor(task.status_name)}`}
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                        backgroundPosition: 'right 0.5rem center',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '1.25em 1.25em'
                      }}
                    >
                      {statuses.map((status) => (
                        <option 
                          key={status.status_id} 
                          value={status.status_id}
                          className="bg-white text-gray-900 py-2"
                        >
                          {status.status_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">{task.org_name || 'N/A'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{formatDate(task.start_planned)}</div>
                  
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{formatDate(task.end_planned)}</div>
                  
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {tasks.length} of {pagination.totalTasks} tasks (Page {pagination.currentPage} of {pagination.totalPages})
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={!pagination.hasPrevPage}
              className={`px-4 py-2 text-sm font-medium rounded-lg ${
                pagination.hasPrevPage
                  ? 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={!pagination.hasNextPage}
              className={`px-4 py-2 text-sm font-medium rounded-lg ${
                pagination.hasNextPage
                  ? 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Modal de detalles de tarea */}
      {selectedTask && (
        <TaskDetailModal
          isOpen={isTaskModalOpen}
          onClose={closeTaskModal}
          task={selectedTask}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

export default function ProductListPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading tasks...</div>
      </div>
    }>
      <ProductListContent />
    </Suspense>
  );
}
