'use client';

import { useState } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import CancelConfirmationModal from './CancelConfirmationModal';

interface TaskStepWizardProps {
  onComplete: (data: TaskFormData) => void;
  onCancel: () => void;
}

interface TaskFormData {
  // Step 1: General Information
  assignToProduct: string;
  taskName: string;
  taskDescription: string;
  
  // Step 2: Assignment
  assignedTo: string;
  phase: string;
  status: string;
  
  // Step 3: Start-End Date
  startDate: string;
  endDate: string;
  actualStartDate: string;
  actualEndDate: string;
  
  // Step 4: Check-in
  checkInOroVerde: string;
  checkInUser: string;
  checkInCommunication: string;
  checkInGender: string;
}

const STEPS = [
  { id: 1, title: 'General Information', subtitle: 'Create New Task' },
  { id: 2, title: 'Assignment', subtitle: 'Create New Task' },
  { id: 3, title: 'Start-End Date', subtitle: 'Create New Task' },
  { id: 4, title: 'Check-in', subtitle: 'Create New Task' },
  { id: 5, title: 'Summary', subtitle: 'Create New Task' },
];

export default function TaskStepWizard({ onComplete, onCancel }: TaskStepWizardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get('productId');
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<TaskFormData>({
    assignToProduct: '',
    taskName: '',
    taskDescription: '',
    assignedTo: '',
    phase: '',
    status: '',
    startDate: '',
    endDate: '',
    actualStartDate: '',
    actualEndDate: '',
    checkInOroVerde: '',
    checkInUser: '',
    checkInCommunication: '',
    checkInGender: '',
  });

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep === STEPS.length) {
      // En el último paso, crear la tarea
      handleCreateTask();
    }
  };

  const handleCreateTask = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Mapear los datos del formulario al formato del API
      const taskData = {
        task_name: formData.taskName,
        task_detail: formData.taskDescription,
        start_date_planned: formData.startDate,
        end_date_planned: formData.endDate,
        start_date_actual: formData.actualStartDate || null,
        end_date_actual: formData.actualEndDate || null,
        checkin_oro_verde: formData.checkInOroVerde || null,
        checkin_user: formData.checkInUser || null,
        checkin_communication: formData.checkInCommunication || null,
        checkin_gender: formData.checkInGender || null,
        phase_id: parseInt(formData.phase) || null,
        status_id: parseInt(formData.status) || null,
        responsable_id: parseInt(formData.assignedTo) || null,
        product_id: productId ? parseInt(productId) : parseInt(formData.assignToProduct)
      };

      const response = await fetch('/api/add-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create task');
      }

      const result = await response.json();
      
      toast.success('Task created successfully!');
      onComplete(formData); // Llamar al callback de éxito
      
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      onCancel();
    }
  };

  const handleGoBack = () => {
    setIsCancelModalOpen(true);
  };

  const handleConfirmCancel = () => {
    router.back();
  };

  const updateFormData = (field: keyof TaskFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Calculate progress percentage
  const progressPercentage = (currentStep / STEPS.length) * 100;

  return (
    <div className="w-full max-w-full bg-white rounded-2xl shadow overflow-hidden p-6 flex flex-col" style={{ height: 'calc(100vh - 120px)' }}>
      {/* Header */}
      <div className="mb-4 flex-shrink-0">
        <div className="flex items-center gap-3 mb-1">
          <button
            onClick={handleGoBack}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft size={20} className="text-gray-700" />
          </button>
          <h2 className="text-2xl font-bold text-gray-900">
            {STEPS[currentStep - 1].title}
          </h2>
        </div>
        <h3 className="text-xl text-gray-500 ml-11">
          New Task
        </h3>
      </div>

      {/* Progress Bar */}
      <div className="mb-6 flex-shrink-0">
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-green-600 via-green-600 to-lime-400 transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 overflow-y-auto mb-2">
        {/* Step 1: General Information */}
        {currentStep === 1 && (
          <div className="px-1 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Assign to product
              </label>
              <select
                value={formData.assignToProduct}
                onChange={(e) => updateFormData('assignToProduct', e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 border-0 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600 appearance-none"
              >
                <option value="">Product Name</option>
                <option value="product1">Línea base de biodiversidad en campo — México</option>
                <option value="product2">Product 2</option>
                <option value="product3">Product 3</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Task Name
                </label>
                <input
                  type="text"
                  value={formData.taskName}
                  onChange={(e) => updateFormData('taskName', e.target.value)}
                  placeholder="Task Name"
                  className="w-full px-4 py-2 bg-gray-50 border-0 rounded-full text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Task Description
                </label>
                <input
                  type="text"
                  value={formData.taskDescription}
                  onChange={(e) => updateFormData('taskDescription', e.target.value)}
                  placeholder="Task Description"
                  className="w-full px-4 py-2 bg-gray-50 border-0 rounded-full text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Assignment */}
        {currentStep === 2 && (
          <div className="px-1 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Assigned to
              </label>
              <select
                value={formData.assignedTo}
                onChange={(e) => updateFormData('assignedTo', e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 border-0 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600 appearance-none"
              >
                <option value="">Organization Name</option>
                <option value="oro-verde">Oro Verde</option>
                <option value="nuup">Nuup</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Phase
                </label>
                <select
                  value={formData.phase}
                  onChange={(e) => updateFormData('phase', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 border-0 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600 appearance-none"
                >
                  <option value="">Planning</option>
                  <option value="planning">Planning</option>
                  <option value="execution">Execution</option>
                  <option value="monitoring">Monitoring</option>
                  <option value="closure">Closure</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => updateFormData('status', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 border-0 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600 appearance-none"
                >
                  <option value="">Not Started</option>
                  <option value="not-started">Not Started</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="on-hold">On Hold</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Start-End Date */}
        {currentStep === 3 && (
          <div className="px-1 grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => updateFormData('startDate', e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 border-0 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => updateFormData('endDate', e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 border-0 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Actual Start Date
              </label>
              <input
                type="date"
                value={formData.actualStartDate}
                onChange={(e) => updateFormData('actualStartDate', e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 border-0 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Actual End Date
              </label>
              <input
                type="date"
                value={formData.actualEndDate}
                onChange={(e) => updateFormData('actualEndDate', e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 border-0 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>
          </div>
        )}

        {/* Step 4: Check-in */}
        {currentStep === 4 && (
          <div className="px-1 grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Check-in Oro Verde
              </label>
              <input
                type="datetime-local"
                value={formData.checkInOroVerde}
                onChange={(e) => updateFormData('checkInOroVerde', e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 border-0 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Check-in User
              </label>
              <input
                type="datetime-local"
                value={formData.checkInUser}
                onChange={(e) => updateFormData('checkInUser', e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 border-0 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Check-in Communication
              </label>
              <input
                type="datetime-local"
                value={formData.checkInCommunication}
                onChange={(e) => updateFormData('checkInCommunication', e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 border-0 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Check-in Gender
              </label>
              <input
                type="datetime-local"
                value={formData.checkInGender}
                onChange={(e) => updateFormData('checkInGender', e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 border-0 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>
          </div>
        )}

        {/* Step 5: Summary */}
        {currentStep === 5 && (
          <div className="px-1 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                General Information
              </h3>
              <div className="space-y-3">
                <div className="flex">
                  <span className="w-40 text-sm font-medium text-gray-600">Assign to Product</span>
                  <span className="text-sm text-gray-900">{formData.assignToProduct || '—'}</span>
                </div>
                <div className="flex">
                  <span className="w-40 text-sm font-medium text-gray-600">Task Name</span>
                  <span className="text-sm text-gray-900">{formData.taskName || '—'}</span>
                </div>
                <div className="flex">
                  <span className="w-40 text-sm font-medium text-gray-600">Task Description</span>
                  <span className="text-sm text-gray-900">{formData.taskDescription || '—'}</span>
                </div>
              </div>
            </div>

             <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Assignment
              </h3>
              <div className="space-y-3">
                <div className="flex">
                  <span className="w-40 text-sm font-medium text-gray-600">Assigned to</span>
                  <span className="text-sm text-gray-900">{formData.assignedTo || '—'}</span>
                </div>
                <div className="flex">
                  <span className="w-40 text-sm font-medium text-gray-600">Phase</span>
                  <span className="text-sm text-gray-900">{formData.phase || '—'}</span>
                </div>
                <div className="flex">
                  <span className="w-40 text-sm font-medium text-gray-600">Status</span>
                  <span className="text-sm text-gray-900">{formData.status || '—'}</span>
                </div>
              </div>
            </div>


            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Start-End Date
              </h3>
              <div className="space-y-3">
                <div className="flex">
                  <span className="w-40 text-sm font-medium text-gray-600">Start Date</span>
                  <span className="text-sm text-gray-900">{formData.startDate || '—'}</span>
                </div>
                <div className="flex">
                  <span className="w-40 text-sm font-medium text-gray-600">End Date</span>
                  <span className="text-sm text-gray-900">{formData.endDate || '—'}</span>
                </div>
                <div className="flex">
                  <span className="w-40 text-sm font-medium text-gray-600">Actual Start Date</span>
                  <span className="text-sm text-gray-900">{formData.actualStartDate || '—'}</span>
                </div>
                <div className="flex">
                  <span className="w-40 text-sm font-medium text-gray-600">Actual End Date</span>
                  <span className="text-sm text-gray-900">{formData.actualEndDate || '—'}</span>
                </div>
              </div>
            </div>

           
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Check-in
              </h3>
              <div className="space-y-3">
                <div className="flex">
                  <span className="w-40 text-sm font-medium text-gray-600">Check-in Oro Verde</span>
                  <span className="text-sm text-gray-900">{formData.checkInOroVerde || '—'}</span>
                </div>
                <div className="flex">
                  <span className="w-40 text-sm font-medium text-gray-600">Check-in User</span>
                  <span className="text-sm text-gray-900">{formData.checkInUser || '—'}</span>
                </div>
                <div className="flex">
                  <span className="w-40 text-sm font-medium text-gray-600">Check-in Communication</span>
                  <span className="text-sm text-gray-900">{formData.checkInCommunication || '—'}</span>
                </div>
                <div className="flex">
                  <span className="w-40 text-sm font-medium text-gray-600">Check-in Gender</span>
                  <span className="text-sm text-gray-900">{formData.checkInGender || '—'}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-4 flex-shrink-0 pt-2">
        <button
          type="button"
          onClick={handleBack}
          disabled={currentStep === 1}
          className={`px-8 py-3 border border-gray-300 text-gray-700 rounded-full font-medium transition-colors ${
            currentStep === 1 
              ? 'opacity-50 cursor-default' 
              : 'hover:bg-gray-50'
          }`}
        >
          Back
        </button>
        
        <button
          type="button"
          onClick={handleNext}
          disabled={isSubmitting}
          className={`flex items-center gap-2 px-8 py-3 rounded-full font-medium transition-colors ${
            isSubmitting 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-green-600 hover:bg-green-700'
          } text-white`}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating...
            </>
          ) : (
            <>
              {currentStep === STEPS.length ? 'Create Task' : 'Next'}
              {currentStep < STEPS.length && <ChevronRight size={20} />}
            </>
          )}
        </button>
      </div>

      {/* Cancel Confirmation Modal */}
      <CancelConfirmationModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleConfirmCancel}
        operationType="task creation"
      />
    </div>
  );
}
