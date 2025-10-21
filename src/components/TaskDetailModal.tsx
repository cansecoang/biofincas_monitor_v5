'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import TaskStepWizard from './TaskStepWizard';

interface Task {
  id: number;
  name: string;
  detail?: string;
  start_planned?: string;
  end_planned?: string;
  start_actual?: string | null;
  end_actual?: string | null;
  checkin_oro_verde?: string;
  checkin_user?: string;
  checkin_communication?: string;
  checkin_gender?: string;
  phase_id?: number;
  phase_name?: string;
  status_id?: number;
  status_name?: string;
  product_id?: number;
  product_name?: string;
  org_id?: number;
  org_name?: string;
}

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function TaskDetailModal({
  isOpen,
  onClose,
  task,
  onEdit,
  onDelete,
}: TaskDetailModalProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      // Guardar el valor actual del scroll
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      // Prevenir scroll
      document.body.style.overflow = 'hidden';
      // Compensar el ancho del scrollbar para evitar el "salto" del contenido
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      
      // Cleanup: restaurar cuando el modal se cierre
      return () => {
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Si está en modo edición, mostrar el wizard
  if (isEditMode && task) {
    return (
      <div className="fixed inset-0 bg-black/50 z-[400] flex items-center justify-center p-4">
        <div className="w-full max-w-6xl">
          <TaskStepWizard
            existingTask={{
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
              status_id: task.status_id,
              responsable_id: task.org_id,
              product_id: task.product_id,
            }}
            onComplete={() => {
              setIsEditMode(false);
              onClose();
            }}
            onCancel={() => {
              setIsEditMode(false);
            }}
          />
        </div>
      </div>
    );
  }

  // Función para manejar la eliminación de la tarea
  const handleDeleteTask = async () => {
    if (!task?.id) return;
    
    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/delete-task?taskId=${task.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete task');
      }

      toast.success('Task deleted successfully!');
      setIsDeleteModalOpen(false);
      onClose(); // Cerrar el modal de detalles
      
      // Llamar al callback onDelete si existe para actualizar el componente padre
      if (onDelete) {
        onDelete();
      }
      
      // Forzar recarga completa de la página para reflejar los cambios
      window.location.reload();
      
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete task');
    } finally {
      setIsDeleting(false);
    }
  };

  // Formatear fechas
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: '2-digit', 
      day: '2-digit', 
      year: 'numeric' 
    });
  };

  const formatDateTime = (dateString?: string | null) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      month: '2-digit', 
      day: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Usar datos de la tarea o valores por defecto
  const taskData = {
    generalInformation: {
      assignToProduct: task?.product_name || 'N/A',
      taskName: task?.name || 'N/A',
      taskDescription: task?.detail || 'No description available',
    },
    assignment: {
      assignedTo: task?.org_name || 'Unassigned',
      phase: task?.phase_name || 'N/A',
      status: task?.status_name || 'N/A',
    },
    dates: {
      startDate: formatDate(task?.start_planned),
      endDate: formatDate(task?.end_planned),
      actualStartDate: formatDate(task?.start_actual),
      actualEndDate: formatDate(task?.end_actual),
    },
    checkIn: {
      oroVerde: formatDateTime(task?.checkin_oro_verde),
      user: formatDateTime(task?.checkin_user),
      communication: formatDateTime(task?.checkin_communication),
      gender: formatDateTime(task?.checkin_gender),
    },
  };

  return (
    <>
      {/* Backdrop overlay - bloquea interacciones */}
      <div 
        className="fixed inset-0 bg-black/50 z-[400]"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div 
        className="fixed inset-0 z-[500] flex items-start justify-center pt-20 overflow-y-auto"
      >
        <div 
          className="bg-white rounded-2xl border border-gray-200 shadow-xl w-full 
          max-w-[90vw] max-h-[calc(100vh-8rem)] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="pl-2 pr-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
          {/* Left: Back button and Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft size={20} className="text-gray-700" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Task Detail</h1>
              <p className="text-sm text-gray-500 mt-0.5">View task information</p>
            </div>
          </div>

          {/* Right: Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 border border-gray-300 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              disabled={isDeleting}
              className="px-4 py-1.5 border border-red-300 text-red-600 rounded-full text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Delete
            </button>
            <button
              onClick={() => setIsEditMode(true)}
              className="px-4 py-1.5 bg-green-600 text-white rounded-full text-sm font-medium hover:bg-green-700 transition-colors"
            >
              Edit
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-16 pt-8 overflow-y-auto flex-1">
        {/* General Information Section */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">General Information</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-[160px_1fr] gap-x-6 gap-y-1">
              <span className="text-sm text-gray-600 font-medium">Assigned to Product</span>
              <span className="text-sm text-gray-900">{taskData.generalInformation.assignToProduct}</span>
            </div>

            <div className="grid grid-cols-[160px_1fr] gap-x-6 gap-y-1">
              <span className="text-sm text-gray-600 font-medium">Task Name</span>
              <span className="text-sm text-gray-900">{taskData.generalInformation.taskName}</span>
            </div>

            <div className="grid grid-cols-[160px_1fr] gap-x-6 gap-y-1">
              <span className="text-sm text-gray-600 font-medium">Task Description</span>
              <span className="text-sm text-gray-900">{taskData.generalInformation.taskDescription}</span>
            </div>
          </div>
        </section>

        {/* Assignment Section */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Assignment</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-[160px_1fr] gap-x-6 gap-y-1">
              <span className="text-sm text-gray-600 font-medium">Assigned to</span>
              <span className="text-sm text-gray-900">{taskData.assignment.assignedTo}</span>
            </div>

            <div className="grid grid-cols-[160px_1fr] gap-x-6 gap-y-1">
              <span className="text-sm text-gray-600 font-medium">Phase</span>
              <span className="text-sm text-gray-900">{taskData.assignment.phase}</span>
            </div>

            <div className="grid grid-cols-[160px_1fr] gap-x-6 gap-y-1">
              <span className="text-sm text-gray-600 font-medium">Status</span>
              <span className="text-sm text-gray-900 flex items-center gap-2">
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  {taskData.assignment.status}
                </span>
              </span>
            </div>
          </div>
        </section>

        {/* Start-End Date Section */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Start-End Date</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-[160px_1fr] gap-x-6 gap-y-1">
              <span className="text-sm text-gray-600 font-medium">Start Date</span>
              <span className="text-sm text-gray-900">{taskData.dates.startDate}</span>
            </div>

            <div className="grid grid-cols-[160px_1fr] gap-x-6 gap-y-1">
              <span className="text-sm text-gray-600 font-medium">End Date</span>
              <span className="text-sm text-gray-900">{taskData.dates.endDate}</span>
            </div>

            <div className="grid grid-cols-[160px_1fr] gap-x-6 gap-y-1">
              <span className="text-sm text-gray-600 font-medium">Actual Start Date</span>
              <span className="text-sm text-gray-900">{taskData.dates.actualStartDate}</span>
            </div>

            <div className="grid grid-cols-[160px_1fr] gap-x-6 gap-y-1">
              <span className="text-sm text-gray-600 font-medium">Actual End Date</span>
              <span className="text-sm text-gray-900">{taskData.dates.actualEndDate}</span>
            </div>
          </div>
        </section>

        {/* Check-in Section */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Check-in</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-[160px_1fr] gap-x-6 gap-y-1">
              <span className="text-sm text-gray-600 font-medium">Check-in Oro Verde</span>
              <span className="text-sm text-gray-900">{taskData.checkIn.oroVerde}</span>
            </div>

            <div className="grid grid-cols-[160px_1fr] gap-x-6 gap-y-1">
              <span className="text-sm text-gray-600 font-medium">Check-in User</span>
              <span className="text-sm text-gray-900">{taskData.checkIn.user}</span>
            </div>

            <div className="grid grid-cols-[160px_1fr] gap-x-6 gap-y-1">
              <span className="text-sm text-gray-600 font-medium">Check-in Communication</span>
              <span className="text-sm text-gray-900">{taskData.checkIn.communication}</span>
            </div>

            <div className="grid grid-cols-[160px_1fr] gap-x-6 gap-y-1">
              <span className="text-sm text-gray-600 font-medium">Check-in Gender</span>
              <span className="text-sm text-gray-900">{taskData.checkIn.gender}</span>
            </div>
          </div>
        </section>

      </div>
        </div>
      </div>

      {/* Modal de confirmación para eliminar */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteTask}
        itemName={task?.name || 'this task'}
        itemType="task"
      />
    </>
  );
}
