'use client';

import { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import CancelConfirmationModal from './CancelConfirmationModal';

interface TaskStepWizardProps {
  onComplete: (data: TaskFormData) => void;
  onCancel: () => void;
  existingTask?: {
    id: number;
    name: string;
    detail?: string;
    start_planned?: string;
    end_planned?: string;
    start_actual?: string | null;
    end_actual?: string | null;
    checkin_oro_verde?: string | null;
    checkin_user?: string | null;
    checkin_communication?: string | null;
    checkin_gender?: string | null;
    phase_id?: number;
    status_id?: number;
    responsable_id?: number;
    product_id?: number;
  };
}

interface TaskFormData {
  assignToProduct: string;
  taskName: string;
  taskDescription: string;
  assignedTo: string;
  phase: string;
  status: string;
  startDate: string;
  endDate: string;
  actualStartDate: string;
  actualEndDate: string;
  checkins: Checkin[];
}

interface Checkin {
  id: string;
  checkin_with_id: string;
  checkin_date: string;
  checkin_description: string;
}

interface Product {
  product_id: number;
  product_name: string;
}

interface Organization {
  organization_id: number;
  organization_name: string;
  organization_type?: string;
}

interface Phase {
  phase_id: number;
  phase_name: string;
}

interface Status {
  status_id: number;
  status_name: string;
}

const STEPS = [
  { id: 1, title: 'General Information', subtitle: 'Create New Task' },
  { id: 2, title: 'Assignment', subtitle: 'Create New Task' },
  { id: 3, title: 'Start-End Date', subtitle: 'Create New Task' },
  { id: 4, title: 'Check-ins', subtitle: 'Create New Task' },
  { id: 5, title: 'Summary', subtitle: 'Create New Task' },
];

export default function TaskStepWizard({ onComplete, onCancel, existingTask }: TaskStepWizardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get('productId');
  const returnUrl = searchParams.get('returnUrl');
  const isEditMode = !!existingTask;
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  
  // Helper function to format date for input[type="date"]
  const formatDateForInput = (dateString?: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Helper function to format datetime for input[type="datetime-local"]
  const formatDateTimeForInput = (dateString?: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  };

  const [formData, setFormData] = useState<TaskFormData>({
    assignToProduct: existingTask?.product_id?.toString() || productId || '',
    taskName: existingTask?.name || '',
    taskDescription: existingTask?.detail || '',
    assignedTo: existingTask?.responsable_id?.toString() || '',
    phase: existingTask?.phase_id?.toString() || '',
    status: existingTask?.status_id?.toString() || '',
    startDate: formatDateForInput(existingTask?.start_planned) || '',
    endDate: formatDateForInput(existingTask?.end_planned) || '',
    actualStartDate: formatDateForInput(existingTask?.start_actual) || '',
    actualEndDate: formatDateForInput(existingTask?.end_actual) || '',
    checkins: [],
  });

  // Cargar productos al montar el componente
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        const data = await response.json();
        if (data.success) {
          setProducts(data.products);
        }
      } catch (error) {
        console.error('Error loading products:', error);
      }
    };
    
    fetchProducts();
  }, []);

  // Cargar organizaciones
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await fetch('/api/organizations');
        const data = await response.json();
        if (data.organizations) {
          // Filtrar solo organizaciones con organization_type === 'M'
          const filteredOrganizations = data.organizations.filter(
            (org: Organization) => org.organization_type === 'M'
          );
          setOrganizations(filteredOrganizations);
        }
      } catch (error) {
        console.error('Error loading organizations:', error);
      }
    };
    
    fetchOrganizations();
  }, []);

  // Cargar fases
  useEffect(() => {
    const fetchPhases = async () => {
      try {
        const response = await fetch('/api/phases');
        const data = await response.json();
        if (data.phases) {
          setPhases(data.phases);
        }
      } catch (error) {
        console.error('Error loading phases:', error);
      }
    };
    
    fetchPhases();
  }, []);

  // Cargar estatus
  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const response = await fetch('/api/statuses');
        const data = await response.json();
        if (data.statuses) {
          setStatuses(data.statuses);
        }
      } catch (error) {
        console.error('Error loading statuses:', error);
      }
    };
    
    fetchStatuses();
  }, []);

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
    
    // Validación final antes de enviar
    if (!formData.taskName || !formData.assignToProduct) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Mapear los datos del formulario al formato del API
      const taskData = {
        task_name: formData.taskName,
        task_detail: formData.taskDescription,
        start_date_planned: formData.startDate || null,
        end_date_planned: formData.endDate || null,
        start_date_actual: formData.actualStartDate || null,
        end_date_actual: formData.actualEndDate || null,
        phase_id: formData.phase ? parseInt(formData.phase) : null,
        status_id: formData.status ? parseInt(formData.status) : null,
        responsable_id: formData.assignedTo ? parseInt(formData.assignedTo) : null,
        product_id: productId ? parseInt(productId) : parseInt(formData.assignToProduct),
      };

      // Determinar si es creación o actualización
      const url = isEditMode ? `/api/update-task?taskId=${existingTask?.id}` : '/api/add-task';
      const method = isEditMode ? 'PUT' : 'POST';

      // Crear o actualizar la tarea primero
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to ${isEditMode ? 'update' : 'create'} task`);
      }

      const result = await response.json();
      const taskId = isEditMode ? existingTask?.id : result.task?.task_id;

      // Crear todos los checkins asociados al task_id
      if (formData.checkins.length > 0 && taskId) {
        const checkinPromises = formData.checkins
          .filter(checkin => checkin.checkin_with_id && checkin.checkin_date)
          .map(checkin => 
            fetch('/api/add-checkin', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                checkin_with_id: parseInt(checkin.checkin_with_id),
                checkin_date: checkin.checkin_date,
                checkin_description: checkin.checkin_description || null,
                task_id: taskId,
              }),
            })
          );

        await Promise.all(checkinPromises);
      }
      
      toast.success(`Task ${isEditMode ? 'updated' : 'created'} successfully!`);
      
      // Si estamos en modo edición, solo recargar
      if (isEditMode) {
        window.location.reload();
      } else {
        // Si es creación nueva, volver a la URL de origen o al Gantt
        const redirectUrl = returnUrl || (productId 
          ? `/products/gantt?productId=${productId}`
          : '/products/gantt');
        window.location.href = redirectUrl;
      }
      
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} task:`, error);
      toast.error(error instanceof Error ? error.message : `Failed to ${isEditMode ? 'update' : 'create'} task`);
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
    // Si estamos en modo edición, solo cerrar el wizard sin navegar
    if (isEditMode) {
      onCancel();
    } else {
      // Si estamos creando, navegar hacia atrás
      router.back();
    }
  };

  const updateFormData = (field: keyof TaskFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Validar campos requeridos por paso
  const isStepValid = () => {
    switch (currentStep) {
      case 1: // General Information
        return formData.assignToProduct && formData.taskName && formData.taskDescription;
      case 2: // Assignment
        return formData.assignedTo && formData.phase && formData.status;
      case 3: // Start-End Date
        return formData.startDate && formData.endDate;
      case 4: // Check-ins (opcionales)
        return true;
      case 5: // Summary
        return true;
      default:
        return false;
    }
  };

  // Funciones para manejar checkins
  const addCheckin = () => {
    const newCheckin: Checkin = {
      id: Date.now().toString(),
      checkin_with_id: '',
      checkin_date: '',
      checkin_description: '',
    };
    setFormData(prev => ({
      ...prev,
      checkins: [...prev.checkins, newCheckin]
    }));
  };

  const removeCheckin = (id: string) => {
    setFormData(prev => ({
      ...prev,
      checkins: prev.checkins.filter(c => c.id !== id)
    }));
  };

  const updateCheckin = (id: string, field: keyof Checkin, value: string) => {
    setFormData(prev => ({
      ...prev,
      checkins: prev.checkins.map(c => 
        c.id === id ? { ...c, [field]: value } : c
      )
    }));
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
          {isEditMode ? 'Edit Task' : 'New Task'}
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
                Assign to product {productId && <span className="text-gray-500">(pre-selected)</span>}
                {!productId && <span className="text-red-500"> *</span>}
              </label>
              <select
                value={formData.assignToProduct}
                onChange={(e) => updateFormData('assignToProduct', e.target.value)}
                disabled={!!productId}
                required
                className={`w-full px-4 py-2 bg-gray-50 border-0 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600 appearance-none ${
                  productId ? 'cursor-not-allowed opacity-75' : ''
                }`}
              >
                <option value="">Select a product</option>
                {products.map((product) => (
                  <option key={product.product_id} value={product.product_id}>
                    {product.product_name}
                  </option>
                ))}
              </select>
              {productId && (
                <p className="mt-2 text-xs text-gray-500">
                  This task will be assigned to the selected product
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Task Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.taskName}
                  onChange={(e) => updateFormData('taskName', e.target.value)}
                  placeholder="Task Name"
                  required
                  className="w-full px-4 py-2 bg-gray-50 border-0 rounded-full text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Task Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.taskDescription}
                  onChange={(e) => updateFormData('taskDescription', e.target.value)}
                  placeholder="Task Description"
                  required
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600 resize-none overflow-hidden"
                  style={{ minHeight: '48px' }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = target.scrollHeight + 'px';
                  }}
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
                Assigned to <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.assignedTo}
                onChange={(e) => updateFormData('assignedTo', e.target.value)}
                required
                className="w-full px-4 py-2 bg-gray-50 border-0 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600 appearance-none"
              >
                <option value="">Select organization</option>
                {organizations.map((org) => (
                  <option key={org.organization_id} value={org.organization_id}>
                    {org.organization_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Phase <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.phase}
                  onChange={(e) => updateFormData('phase', e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-gray-50 border-0 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600 appearance-none"
                >
                  <option value="">Select phase</option>
                  {phases.map((phase) => (
                    <option key={phase.phase_id} value={phase.phase_id}>
                      {phase.phase_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => updateFormData('status', e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-gray-50 border-0 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600 appearance-none"
                >
                  <option value="">Select status</option>
                  {statuses.map((status) => (
                    <option key={status.status_id} value={status.status_id}>
                      {status.status_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}        {/* Step 3: Start-End Date */}
        {currentStep === 3 && (
          <div className="px-1 grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => updateFormData('startDate', e.target.value)}
                required
                className="w-full px-4 py-2 bg-gray-50 border-0 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => updateFormData('endDate', e.target.value)}
                required
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

        {/* Step 4: Check-ins */}
        {currentStep === 4 && (
          <div className="px-1 space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Check-ins with Organizations
              </h3>
              <button
                type="button"
                onClick={addCheckin}
                className="px-4 py-2 bg-green-600 text-white rounded-full font-medium hover:bg-green-700 transition-colors text-sm"
              >
                + Add Check-in
              </button>
            </div>

            {formData.checkins.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No check-ins added. Click "Add Check-in" to create one.
              </div>
            ) : (
              <div className="space-y-4">
                {formData.checkins.map((checkin, index) => (
                  <div key={checkin.id} className="p-4 border-2 border-gray-200 rounded-2xl relative">
                    <button
                      type="button"
                      onClick={() => removeCheckin(checkin.id)}
                      className="absolute top-4 right-4 text-red-500 hover:text-red-700 font-bold"
                    >
                      ✕
                    </button>

                    <div className="grid grid-cols-2 gap-4 pr-8">
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Check-in with Organization
                        </label>
                        <select
                          value={checkin.checkin_with_id}
                          onChange={(e) => updateCheckin(checkin.id, 'checkin_with_id', e.target.value)}
                          className="w-full px-4 py-2 bg-gray-50 border-0 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600 appearance-none"
                        >
                          <option value="">Select organization</option>
                          {organizations.map((org) => (
                            <option key={org.organization_id} value={org.organization_id}>
                              {org.organization_name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Check-in Date
                        </label>
                        <input
                          type="datetime-local"
                          value={checkin.checkin_date}
                          onChange={(e) => updateCheckin(checkin.id, 'checkin_date', e.target.value)}
                          className="w-full px-4 py-2 bg-gray-50 border-0 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600"
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Description
                        </label>
                        <textarea
                          value={checkin.checkin_description}
                          onChange={(e) => updateCheckin(checkin.id, 'checkin_description', e.target.value)}
                          placeholder="Describe the check-in"
                          rows={2}
                          className="w-full px-4 py-2 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600 resize-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                  <span className="text-sm text-gray-900">
                    {formData.assignToProduct 
                      ? products.find(p => p.product_id.toString() === formData.assignToProduct)?.product_name || formData.assignToProduct
                      : '—'}
                  </span>
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
                  <span className="text-sm text-gray-900">
                    {formData.assignedTo 
                      ? organizations.find(o => o.organization_id.toString() === formData.assignedTo)?.organization_name || formData.assignedTo
                      : '—'}
                  </span>
                </div>
                <div className="flex">
                  <span className="w-40 text-sm font-medium text-gray-600">Phase</span>
                  <span className="text-sm text-gray-900">
                    {formData.phase 
                      ? phases.find(p => p.phase_id.toString() === formData.phase)?.phase_name || formData.phase
                      : '—'}
                  </span>
                </div>
                <div className="flex">
                  <span className="w-40 text-sm font-medium text-gray-600">Status</span>
                  <span className="text-sm text-gray-900">
                    {formData.status 
                      ? statuses.find(s => s.status_id.toString() === formData.status)?.status_name || formData.status
                      : '—'}
                  </span>
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
                Check-ins
              </h3>
              {formData.checkins.length > 0 ? (
                <div className="space-y-3">
                  {formData.checkins.map((checkin, index) => (
                    <div key={checkin.id} className="p-3 bg-gray-50 rounded-xl">
                      <div className="flex">
                        <span className="w-40 text-sm font-medium text-gray-600">Organization</span>
                        <span className="text-sm text-gray-900">
                          {checkin.checkin_with_id 
                            ? organizations.find(o => o.organization_id.toString() === checkin.checkin_with_id)?.organization_name || '—'
                            : '—'}
                        </span>
                      </div>
                      <div className="flex mt-2">
                        <span className="w-40 text-sm font-medium text-gray-600">Date</span>
                        <span className="text-sm text-gray-900">{checkin.checkin_date || '—'}</span>
                      </div>
                      <div className="flex mt-2">
                        <span className="w-40 text-sm font-medium text-gray-600">Description</span>
                        <span className="text-sm text-gray-900">{checkin.checkin_description || '—'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No check-ins added</p>
              )}
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
          disabled={isSubmitting || !isStepValid()}
          className={`flex items-center gap-2 px-8 py-3 rounded-full font-medium transition-colors ${
            isSubmitting || !isStepValid()
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
              {isEditMode ? 'Saving...' : 'Creating...'}
            </>
          ) : (
            <>
              {currentStep === STEPS.length ? (isEditMode ? 'Save Task' : 'Create Task') : 'Next'}
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
