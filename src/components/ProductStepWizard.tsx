'use client';

import { useState } from 'react';
import { ChevronRight } from 'lucide-react';

interface ProductStepWizardProps {
  onComplete: (data: ProductFormData) => void;
  onCancel: () => void;
}

interface ProductFormData {
  [x: string]: string | number | readonly string[] | undefined;
  // Step 1: General Information
  productName: string;
  productObjective: string;
  deliverable: string;
  deliveryDate: string;
  
  // Step 2: Location and Context
  output: string;
  workpackage: string;
  country: string;
  productOwner: string;
  
  // Step 3: Team
  responsable: string;
  otherOrganizations: string;
  
  // Step 4: Indicators
  selectedIndicators: string[];
}

const STEPS = [
  { id: 1, title: 'Location and Context', subtitle: 'View your income in a certain period of time' },
  { id: 2, title: 'General Information', subtitle: 'View your income in a certain period of time' },
  { id: 3, title: 'Team', subtitle: 'View your income in a certain period of time' },
  { id: 4, title: 'Indicators', subtitle: 'View your income in a certain period of time' },
  { id: 5, title: 'Summary', subtitle: 'View your income in a certain period of time' },
];

const INDICATORS = [
  {
    id: '1.1',
    code: 'META 1.1',
    description: 'The state of biodiversity under different production systems in cocoa, coffee, and banana is identified (Milestone [1]) and related to the agricultural practices used in order to scale the best practices.',
  },
  {
    id: '1.2',
    code: 'META 1.2',
    description: 'The state of biodiversity under different production systems in cocoa, coffee, and banana is identified (Milestone [1]) and related to the agricultural practices used in order to scale the best practices.',
  },
  {
    id: '1.3',
    code: 'META 1.3',
    description: 'The state of biodiversity under different production systems in cocoa, coffee, and banana is identified (Milestone [1]) and related to the agricultural practices used in order to scale the best practices.',
  },
  {
    id: '1.4',
    code: 'META 1.4',
    description: 'The state of biodiversity under different production systems in cocoa, coffee, and banana is identified (Milestone [1]) and related to the agricultural practices used in order to scale the best practices.',
  },
  {
    id: '1.5',
    code: 'META 1.5',
    description: 'The state of biodiversity under different production systems in cocoa, coffee, and banana is identified (Milestone [1]) and related to the agricultural practices used in order to scale the best practices.',
  },
  {
    id: '1.6',
    code: 'META 1.6',
    description: 'The state of biodiversity under different production systems in cocoa, coffee, and banana is identified (Milestone [1]) and related to the agricultural practices used in order to scale the best practices.',
  },
];

export default function ProductStepWizard({ onComplete, onCancel }: ProductStepWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ProductFormData>({
    productName: '',
    productObjective: '',
    deliverable: '',
    deliveryDate: '',
    output: '',
    workpackage: '',
    country: '',
    productOwner: '',
    responsable: '',
    otherOrganizations: '',
    selectedIndicators: [],
  });

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
    // No hacer nada en el último step (Create Product)
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      onCancel();
    }
  };

  const updateFormData = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleIndicator = (indicatorId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedIndicators: prev.selectedIndicators.includes(indicatorId)
        ? prev.selectedIndicators.filter(id => id !== indicatorId)
        : [...prev.selectedIndicators, indicatorId]
    }));
  };

  // Calculate progress percentage
  const progressPercentage = (currentStep / STEPS.length) * 100;

  return (
    <div className="w-full max-w-full bg-white rounded-2xl shadow overflow-hidden p-6 flex flex-col" style={{ height: 'calc(100vh - 100px)' }}>
      {/* Header */}
      <div className="mb-4 flex-shrink-0">{/* Header */}
        <h2 className="text-2xl font-bold text-gray-900 mb-1">
          {STEPS[currentStep - 1].title}
          
        </h2>
        <h3 className="text-xl text-gray-500">
          Create New Product
        </h3>
      </div>

      {/* Progress Bar */}
      <div className="mb-6 flex-shrink-0">
        <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-400 transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 overflow-y-auto mb-2">
        {/* Step 1: Location and Context */}
        {currentStep === 1 && (
          <div className="grid grid-cols-2 gap-6 px-1">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Output
              </label>
              <select
                value={formData.output}
                onChange={(e) => updateFormData('output', e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 border-0 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
              >
                <option value="">Select output</option>
                <option value="output1">Output 1 - Biodiversity Assessment</option>
                <option value="output2">Output 2 - Best Practices Guide</option>
                <option value="output3">Output 3 - Training Materials</option>
                <option value="output4">Output 4 - Monitoring System</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Workpackage
              </label>
              <select
                value={formData.workpackage}
                onChange={(e) => updateFormData('workpackage', e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 border-0 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
              >
                <option value="">Select workpackage</option>
                <option value="wp1">WP1 - Research and Development</option>
                <option value="wp2">WP2 - Implementation</option>
                <option value="wp3">WP3 - Monitoring and Evaluation</option>
                <option value="wp4">WP4 - Communication and Dissemination</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Country
              </label>
              <select
                value={formData.country}
                onChange={(e) => updateFormData('country', e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 border-0 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
              >
                <option value="">Select country</option>
                <option value="mexico">Mexico</option>
                <option value="colombia">Colombia</option>
                <option value="peru">Peru</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Product Owner
              </label>
              <select
                value={formData.productOwner}
                onChange={(e) => updateFormData('productOwner', e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 border-0 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
              >
                <option value="">Select product owner</option>
                <option value="nuup">Nuup</option>
                <option value="oro-verde">Oro Verde</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 2: General Information */}
        {currentStep === 2 && (
          <div className="grid grid-cols-2 gap-6 px-1">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Product Name
              </label>
              <input
                type="text"
                value={formData.productName}
                onChange={(e) => updateFormData('productName', e.target.value)}
                placeholder="Product Name"
                className="w-full px-4 py-2 bg-gray-50 border-0 rounded-full text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Product Objective
              </label>
              <input
                type="text"
                value={formData.productObjective}
                onChange={(e) => updateFormData('productObjective', e.target.value)}
                placeholder="Product Objective"
                className="w-full px-4 py-2 bg-gray-50 border-0 rounded-full text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Deliverable
              </label>
              <input
                type="text"
                value={formData.deliverable}
                onChange={(e) => updateFormData('deliverable', e.target.value)}
                placeholder="Deliverable"
                className="w-full px-4 py-2 bg-gray-50 border-0 rounded-full text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Delivery Date
              </label>
              <input
                type="date"
                value={formData.deliveryDate}
                onChange={(e) => updateFormData('deliveryDate', e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 border-0 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        )}

        {/* Step 3: Team */}
        {currentStep === 3 && (
          <div className="grid grid-cols-2 gap-6 px-1">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Responsable
              </label>
              <select
                value={formData.responsable}
                onChange={(e) => updateFormData('responsable', e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 border-0 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
              >
                <option value="">Select responsable</option>
                <option value="oro-verde">Oro Verde</option>
                <option value="nuup">Nuup</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Other Organizations
              </label>
              <select
                value={formData.otherOrganizations}
                onChange={(e) => updateFormData('otherOrganizations', e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 border-0 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
              >
                <option value="">Select organizations</option>
                <option value="nuup">Nuup</option>
                <option value="oro-verde">Oro Verde</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 4: Indicators */}
        {currentStep === 4 && (
          <div>
            <div className="grid grid-cols-2 gap-4 px-1">
              {INDICATORS.map((indicator) => (
                  <div
                    key={indicator.id}
                    className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      formData.selectedIndicators.includes(indicator.id)
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                    onClick={() => toggleIndicator(indicator.id)}
                  >
                    {/* Index Pill Label */}
                    <div className="absolute top-4 right-4">
                      <span className="inline-flex items-center justify-center px-3 py-1 bg-white border border-gray-300 text-gray-900 text-sm font-medium rounded-full">
                        {indicator.id}
                      </span>
                    </div>

                    {/* Content */}
                    <p className="text-xs text-gray-500 mb-2 pr-12">
                      {indicator.description}
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {indicator.code}
                    </p>
                  </div>
                ))}
              </div>
            </div>
        )}

        {/* Step 5: Resume */}
        {currentStep === 5 && (
          <div className="space-y-6 px-1">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Location and Context
              </h3>
              <div className="space-y-3">
                <div className="flex">
                  <span className="w-40 text-sm font-medium text-gray-600">Output</span>
                  <span className="text-sm font-bold text-gray-900">{formData.output || '—'}</span>
                </div>
                <div className="flex">
                  <span className="w-40 text-sm font-medium text-gray-600">Workpackage</span>
                  <span className="text-sm font-bold text-gray-900">{formData.workpackage || '—'}</span>
                </div>
                <div className="flex">
                  <span className="w-40 text-sm font-medium text-gray-600">Country</span>
                  <span className="text-sm font-bold text-gray-900">{formData.country || '—'}</span>
                </div>
                <div className="flex">
                  <span className="w-40 text-sm font-medium text-gray-600">Product Owner</span>
                  <span className="text-sm font-bold text-gray-900">{formData.productOwner || '—'}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                General Information
              </h3>
              <div className="space-y-3">
                <div className="flex">
                  <span className="w-40 text-sm font-medium text-gray-600">Product Name</span>
                  <span className="text-sm font-bold text-gray-900">{formData.productName || '—'}</span>
                </div>
                <div className="flex">
                  <span className="w-40 text-sm font-medium text-gray-600">Product Objective</span>
                  <span className="text-sm font-bold text-gray-900">{formData.productObjective || '—'}</span>
                </div>
                <div className="flex">
                  <span className="w-40 text-sm font-medium text-gray-600">Deliverable (s)</span>
                  <span className="text-sm font-bold text-gray-900">{formData.deliverable || '—'}</span>
                </div>
                <div className="flex">
                  <span className="w-40 text-sm font-medium text-gray-600">Delivery Date</span>
                  <span className="text-sm font-bold text-gray-900">{formData.deliveryDate || '—'}</span>
                </div>
                
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Team
              </h3>
              <div className="space-y-3">
                <div className="flex">
                  <span className="w-40 text-sm font-medium text-gray-600">Responsable</span>
                  <span className="text-sm font-bold text-gray-900">{formData.responsable || '—'}</span>
                </div>
                <div className="flex">
                  <span className="w-40 text-sm font-medium text-gray-600">Other Organizations</span>
                  <span className="text-sm font-bold text-gray-900">{formData.otherOrganizations || '—'}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Indicators
              </h3>
              <div className="flex flex-wrap gap-2">
                {formData.selectedIndicators.length > 0 ? (
                  formData.selectedIndicators.map(id => {
                    const indicator = INDICATORS.find(i => i.id === id);
                    return (
                      <span key={id} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                        {indicator?.code}
                      </span>
                    );
                  })
                ) : (
                  <span className="text-sm text-gray-500">No indicators selected</span>
                )}
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
          className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700 transition-colors"
        >
          {currentStep === STEPS.length ? 'Create Product' : 'Next'}
          {currentStep < STEPS.length}
        </button>
      </div>
    </div>
  );
}
