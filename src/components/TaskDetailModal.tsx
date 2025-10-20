'use client';

import { ChevronLeft } from 'lucide-react';

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

// Datos de ejemplo - reemplazar con datos reales
const mockTaskData = {
  generalInformation: {
    assignToProduct: 'Línea base de biodiversidad en campo — México',
    taskName: 'Diseño del protocolo de muestreo',
    taskDescription: 'Crear y documentar el protocolo completo de muestreo de biodiversidad para el campo en México',
  },
  assignment: {
    assignedTo: 'Oro Verde',
    phase: 'Planning',
    status: 'In Progress',
  },
  dates: {
    startDate: '01/15/2025',
    endDate: '03/30/2025',
    actualStartDate: '01/20/2025',
    actualEndDate: '—',
  },
  checkIn: {
    oroVerde: '01/20/2025 10:00 AM',
    user: '01/22/2025 02:30 PM',
    communication: '01/25/2025 09:15 AM',
    gender: '02/01/2025 11:45 AM',
  },
};

export default function TaskDetailModal({
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: TaskDetailModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[300] flex items-start justify-center pl-16 pt-20 overflow-y-auto"
    >
      {/* Modal Container */}
      <div 
        className="bg-white rounded-2xl border border-gray-200 shadow-sm w-full max-w-[94.2vw] max-h-[calc(100vh-8rem)] flex flex-col"
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
              onClick={onDelete}
              className="px-4 py-1.5 border border-red-300 text-red-600 rounded-full text-sm font-medium hover:bg-red-50 transition-colors"
            >
              Delete
            </button>
            <button
              onClick={onEdit}
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
              <span className="text-sm text-gray-900">{mockTaskData.generalInformation.assignToProduct}</span>
            </div>

            <div className="grid grid-cols-[160px_1fr] gap-x-6 gap-y-1">
              <span className="text-sm text-gray-600 font-medium">Task Name</span>
              <span className="text-sm text-gray-900">{mockTaskData.generalInformation.taskName}</span>
            </div>

            <div className="grid grid-cols-[160px_1fr] gap-x-6 gap-y-1">
              <span className="text-sm text-gray-600 font-medium">Task Description</span>
              <span className="text-sm text-gray-900">{mockTaskData.generalInformation.taskDescription}</span>
            </div>
          </div>
        </section>

        {/* Assignment Section */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Assignment</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-[160px_1fr] gap-x-6 gap-y-1">
              <span className="text-sm text-gray-600 font-medium">Assigned to</span>
              <span className="text-sm text-gray-900">{mockTaskData.assignment.assignedTo}</span>
            </div>

            <div className="grid grid-cols-[160px_1fr] gap-x-6 gap-y-1">
              <span className="text-sm text-gray-600 font-medium">Phase</span>
              <span className="text-sm text-gray-900">{mockTaskData.assignment.phase}</span>
            </div>

            <div className="grid grid-cols-[160px_1fr] gap-x-6 gap-y-1">
              <span className="text-sm text-gray-600 font-medium">Status</span>
              <span className="text-sm text-gray-900 flex items-center gap-2">
                {/* {mockTaskData.assignment.status} */}
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  {mockTaskData.assignment.status}
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
              <span className="text-sm text-gray-900">{mockTaskData.dates.startDate}</span>
            </div>

            <div className="grid grid-cols-[160px_1fr] gap-x-6 gap-y-1">
              <span className="text-sm text-gray-600 font-medium">End Date</span>
              <span className="text-sm text-gray-900">{mockTaskData.dates.endDate}</span>
            </div>

            <div className="grid grid-cols-[160px_1fr] gap-x-6 gap-y-1">
              <span className="text-sm text-gray-600 font-medium">Actual Start Date</span>
              <span className="text-sm text-gray-900">{mockTaskData.dates.actualStartDate}</span>
            </div>

            <div className="grid grid-cols-[160px_1fr] gap-x-6 gap-y-1">
              <span className="text-sm text-gray-600 font-medium">Actual End Date</span>
              <span className="text-sm text-gray-900">{mockTaskData.dates.actualEndDate}</span>
            </div>
          </div>
        </section>

        {/* Check-in Section */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Check-in</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-[160px_1fr] gap-x-6 gap-y-1">
              <span className="text-sm text-gray-600 font-medium">Check-in Oro Verde</span>
              <span className="text-sm text-gray-900">{mockTaskData.checkIn.oroVerde}</span>
            </div>

            <div className="grid grid-cols-[160px_1fr] gap-x-6 gap-y-1">
              <span className="text-sm text-gray-600 font-medium">Check-in User</span>
              <span className="text-sm text-gray-900">{mockTaskData.checkIn.user}</span>
            </div>

            <div className="grid grid-cols-[160px_1fr] gap-x-6 gap-y-1">
              <span className="text-sm text-gray-600 font-medium">Check-in Communication</span>
              <span className="text-sm text-gray-900">{mockTaskData.checkIn.communication}</span>
            </div>

            <div className="grid grid-cols-[160px_1fr] gap-x-6 gap-y-1">
              <span className="text-sm text-gray-600 font-medium">Check-in Gender</span>
              <span className="text-sm text-gray-900">{mockTaskData.checkIn.gender}</span>
            </div>
          </div>
        </section>

      </div>
    </div>
    </div>
  );
}
