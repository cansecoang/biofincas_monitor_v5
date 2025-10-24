'use client';

import { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import CancelConfirmationModal from './CancelConfirmationModal';

interface ProductStepWizardProps {
  onComplete: (data: ProductFormData) => void;
  onCancel: () => void;
  editMode?: boolean;
  productId?: number;
  initialData?: Partial<ProductFormData>;
}

interface ProductFormData {
  // Step 1: General Information
  productName: string;
  productObjective: string;
  deliverable: string;
  deliveryDate: string;
  methodologyDescription: string;
  genderSpecificActions: string;
  nextSteps: string;
  
  // Step 2: Location and Context
  output: string;
  workpackage: string;
  workingGroup: string;
  country: string;
  productOwner: string;
  
  // Step 3: Team
  responsable: string;
  otherOrganizations: number[];
  
  // Step 4: Indicators
  selectedIndicators: number[];
  
  // Step 5: Distributors
  distributorOrganizations: number[];
  distributorOthers: Array<{ display_name: string; contact: string }>;
}

interface Output {
  output_id: number;
  output_number: string;
  output_name: string;
}

interface Workpackage {
  workpackage_id: number;
  workpackage_name: string;
}

interface WorkingGroup {
  workinggroup_id: number;
  workinggroup_name: string;
}

interface Country {
  country_id: number;
  country_name: string;
}

interface Organization {
  organization_id: number;
  organization_name: string;
  organization_type?: string;
}

interface User {
  user_id: number;
  user_name: string;
}

interface Indicator {
  indicator_id: number;
  indicator_code: string;
  indicator_description: string;
}

const STEPS = [
  { id: 1, title: 'General Information', subtitle: 'Basic product details' },
  { id: 2, title: 'Location and Context', subtitle: 'Output, workpackage, and location' },
  { id: 3, title: 'Team', subtitle: 'Responsible parties and organizations' },
  { id: 4, title: 'Indicators', subtitle: 'Select related indicators' },
  { id: 5, title: 'Distributors', subtitle: 'Define distribution channels' },
  { id: 6, title: 'Summary', subtitle: 'Review and confirm' },
];

export default function ProductStepWizard({ 
  onComplete, 
  onCancel, 
  editMode = false, 
  productId, 
  initialData 
}: ProductStepWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Data from APIs
  const [outputs, setOutputs] = useState<Output[]>([]);
  const [workpackages, setWorkpackages] = useState<Workpackage[]>([]);
  const [workingGroups, setWorkingGroups] = useState<WorkingGroup[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [productOwnerOrgs, setProductOwnerOrgs] = useState<Organization[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [indicators, setIndicators] = useState<Indicator[]>([]);

  const [formData, setFormData] = useState<ProductFormData>({
    productName: '',
    productObjective: '',
    deliverable: '',
    deliveryDate: '',
    methodologyDescription: '',
    genderSpecificActions: '',
    nextSteps: '',
    output: '',
    workpackage: '',
    workingGroup: '',
    country: '',
    productOwner: '',
    responsable: '',
    otherOrganizations: [],
    selectedIndicators: [],
    distributorOrganizations: [],
    distributorOthers: [],
  });

  // Load all data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [outputsRes, workpackagesRes, workingGroupsRes, countriesRes, orgsRes, usersRes, indicatorsRes] = await Promise.all([
          fetch('/api/outputs'),
          fetch('/api/work-packages'),
          fetch('/api/working-groups'),
          fetch('/api/countries'),
          fetch('/api/organizations'),
          fetch('/api/users'),
          fetch('/api/indicators')
        ]);

        const outputsData = await outputsRes.json();
        const workpackagesData = await workpackagesRes.json();
        const workingGroupsData = await workingGroupsRes.json();
        const countriesData = await countriesRes.json();
        const orgsData = await orgsRes.json();
        const usersData = await usersRes.json();
        const indicatorsData = await indicatorsRes.json();

        if (outputsData.success) setOutputs(outputsData.outputs);
        if (workpackagesData.success) setWorkpackages(workpackagesData.workpackages);
        if (workingGroupsData.workingGroups) setWorkingGroups(workingGroupsData.workingGroups);
        if (countriesData.success) setCountries(countriesData.countries);
        if (orgsData.organizations) {
          setOrganizations(orgsData.organizations);
          // Filter organizations with type 'M' for Product Owner dropdown
          setProductOwnerOrgs(orgsData.organizations.filter((org: Organization) => org.organization_type === 'M'));
        }
        if (usersData.success) setUsers(usersData.users);
        if (indicatorsData.success) setIndicators(indicatorsData.indicators);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Load initial data in edit mode
  useEffect(() => {
    if (editMode && initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData
      }));
    }
  }, [editMode, initialData]);


  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
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

  const updateFormData = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleIndicator = (indicatorId: number) => {
    setFormData(prev => ({
      ...prev,
      selectedIndicators: prev.selectedIndicators.includes(indicatorId)
        ? prev.selectedIndicators.filter(id => id !== indicatorId)
        : [...prev.selectedIndicators, indicatorId]
    }));
  };

  const toggleOrganization = (orgId: number) => {
    setFormData(prev => ({
      ...prev,
      otherOrganizations: prev.otherOrganizations.includes(orgId)
        ? prev.otherOrganizations.filter(id => id !== orgId)
        : [...prev.otherOrganizations, orgId]
    }));
  };

  // Distributor Organizations functions
  const toggleDistributorOrganization = (orgId: number) => {
    setFormData(prev => ({
      ...prev,
      distributorOrganizations: prev.distributorOrganizations.includes(orgId)
        ? prev.distributorOrganizations.filter(id => id !== orgId)
        : [...prev.distributorOrganizations, orgId]
    }));
  };

  // Distributor Others functions
  const addDistributorOther = () => {
    setFormData(prev => ({
      ...prev,
      distributorOthers: [...prev.distributorOthers, { display_name: '', contact: '' }]
    }));
  };

  const removeDistributorOther = (index: number) => {
    setFormData(prev => ({
      ...prev,
      distributorOthers: prev.distributorOthers.filter((_, i) => i !== index)
    }));
  };

  const updateDistributorOther = (index: number, field: 'display_name' | 'contact', value: string) => {
    setFormData(prev => ({
      ...prev,
      distributorOthers: prev.distributorOthers.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleCreateProduct = async () => {
    setIsSubmitting(true);
    
    try {
      const payload = {
        ...(editMode && productId ? { product_id: productId } : {}),
        product_name: formData.productName,
        product_objective: formData.productObjective,
        deliverable: formData.deliverable,
        delivery_date: formData.deliveryDate || null,
        methodology_description: formData.methodologyDescription || null,
        gender_specific_actions: formData.genderSpecificActions || null,
        next_steps: formData.nextSteps || null,
        product_output: formData.output ? parseInt(formData.output) : null,
        workpackage_id: formData.workpackage ? parseInt(formData.workpackage) : null,
        workinggroup_id: formData.workingGroup ? parseInt(formData.workingGroup) : null,
        product_owner_id: formData.productOwner ? parseInt(formData.productOwner) : null,
        country_id: formData.country ? parseInt(formData.country) : null,
        responsibles: formData.responsable ? [{ 
          user_id: parseInt(formData.responsable), 
          is_primary: true,
          position: 1 
        }] : [],
        organizations: formData.otherOrganizations.map((orgId, index) => ({
          organization_id: orgId,
          relation_type: 'collaborator',
          position: index + 1
        })),
        indicators: formData.selectedIndicators,
        distributor_orgs: formData.distributorOrganizations,
        distributor_others: formData.distributorOthers.filter(d => d.display_name.trim() !== ''),
      };

      const endpoint = editMode ? '/api/update-product' : '/api/add-product';
      const method = editMode ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        onComplete(formData);
        router.push('/products/list');
      } else {
        console.error('Server error:', result);
        alert(`Error: ${result.error || result.message}\n${result.details || ''}`);
      }
    } catch (error) {
      console.error(`Error ${editMode ? 'updating' : 'creating'} product:`, error);
      alert(`An error occurred while ${editMode ? 'updating' : 'creating'} the product`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate progress percentage
  const progressPercentage = (currentStep / STEPS.length) * 100;

  if (isLoading) {
    return (
      <div className="w-full max-w-full bg-white rounded-2xl shadow overflow-hidden p-6 flex items-center justify-center" style={{ height: 'calc(100vh - 120px)' }}>
        <Loader2 className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

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
          New Product
        </h3>
      </div>

      {/* Progress Bar */}
      <div className="mb-6 flex-shrink-0">
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 via-blue-500 to-cyan-400 transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 overflow-y-auto mb-2">
        {/* Step 1: General Information */}
        {currentStep === 1 && (
          <div className="grid grid-cols-2 gap-6 px-1">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                value={formData.productName}
                onChange={(e) => updateFormData('productName', e.target.value)}
                placeholder="Product Name"
                className="w-full px-4 py-2 bg-gray-50 border-0 rounded-full text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Product Objective
              </label>
              <textarea
                value={formData.productObjective}
                onChange={(e) => updateFormData('productObjective', e.target.value)}
                placeholder="Product Objective"
                rows={3}
                className="w-full px-4 py-2 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Deliverable
              </label>
              <textarea
                value={formData.deliverable}
                onChange={(e) => updateFormData('deliverable', e.target.value)}
                placeholder="Deliverable"
                rows={2}
                className="w-full px-4 py-2 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
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
                className="w-full px-4 py-2 bg-gray-50 border-0 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Methodology Description
              </label>
              <textarea
                value={formData.methodologyDescription}
                onChange={(e) => updateFormData('methodologyDescription', e.target.value)}
                placeholder="Describe the methodology to be used"
                rows={3}
                className="w-full px-4 py-2 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Gender Specific Actions (See gender action plan)
              </label>
              <textarea
                value={formData.genderSpecificActions}
                onChange={(e) => updateFormData('genderSpecificActions', e.target.value)}
                placeholder="Describe gender-specific actions or considerations"
                rows={2}
                className="w-full px-4 py-2 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Next Steps (Add related products)
              </label>
              <textarea
                value={formData.nextSteps}
                onChange={(e) => updateFormData('nextSteps', e.target.value)}
                placeholder="Describe the next steps for this product"
                rows={2}
                className="w-full px-4 py-2 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>
        )}

        {/* Step 2: Location and Context */}
        {currentStep === 2 && (
          <div className="grid grid-cols-2 gap-6 px-1">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Output
              </label>
              <select
                value={formData.output}
                onChange={(e) => updateFormData('output', e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 border-0 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                <option value="">Select output</option>
                {outputs.map((output) => (
                  <option key={output.output_id} value={output.output_id}>
                    {output.output_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Workpackage
              </label>
              <select
                value={formData.workpackage}
                onChange={(e) => updateFormData('workpackage', e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 border-0 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                <option value="">Select workpackage</option>
                {workpackages.map((wp) => (
                  <option key={wp.workpackage_id} value={wp.workpackage_id}>
                    {wp.workpackage_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Working Group
              </label>
              <select
                value={formData.workingGroup}
                onChange={(e) => updateFormData('workingGroup', e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 border-0 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                <option value="">Select working group</option>
                {workingGroups.map((wg) => (
                  <option key={wg.workinggroup_id} value={wg.workinggroup_id}>
                    {wg.workinggroup_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Country
              </label>
              <select
                value={formData.country}
                onChange={(e) => updateFormData('country', e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 border-0 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                <option value="">Select country</option>
                {countries.map((country) => (
                  <option key={country.country_id} value={country.country_id}>
                    {country.country_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Product Owner
              </label>
              <select
                value={formData.productOwner}
                onChange={(e) => updateFormData('productOwner', e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 border-0 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                <option value="">Select product owner</option>
                {productOwnerOrgs.map((org) => (
                  <option key={org.organization_id} value={org.organization_id}>
                    {org.organization_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Step 3: Team */}
        {currentStep === 3 && (
          <div className="space-y-6 px-1">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Responsible
              </label>
              <select
                value={formData.responsable}
                onChange={(e) => updateFormData('responsable', e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 border-0 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                <option value="">Select responsible</option>
                {users.map((user) => (
                  <option key={user.user_id} value={user.user_id}>
                    {user.user_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">
                Other Organizations
              </label>
              <div className="grid grid-cols-2 gap-3">
                {organizations.filter(org => org.organization_type === 'M').map((org) => (
                  <div
                    key={org.organization_id}
                    onClick={() => toggleOrganization(org.organization_id)}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      formData.otherOrganizations.includes(org.organization_id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <p className="text-sm font-medium text-gray-900">{org.organization_name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Indicators */}
        {currentStep === 4 && (
          <div>
            {formData.output ? (
              <div className="grid grid-cols-2 gap-4 px-1">
                {(() => {
                  // Get the selected output's number
                  const selectedOutput = outputs.find(o => o.output_id.toString() === formData.output);
                  const outputNumber = selectedOutput?.output_number;
                  
                  // Filter indicators that belong to the selected output
                  const filteredIndicators = indicators.filter(indicator => 
                    outputNumber && indicator.indicator_code.startsWith(outputNumber + '.')
                  );

                  if (filteredIndicators.length === 0) {
                    return (
                      <div className="col-span-2 text-center py-8 text-gray-500">
                        No indicators available for this output
                      </div>
                    );
                  }

                  return filteredIndicators.map((indicator) => (
                    <div
                      key={indicator.indicator_id}
                      className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                        formData.selectedIndicators.includes(indicator.indicator_id)
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                      onClick={() => toggleIndicator(indicator.indicator_id)}
                    >
                      {/* Code Label */}
                      <div className="absolute top-4 right-4">
                        <span className="inline-flex items-center justify-center px-3 py-1 bg-white border border-gray-300 text-gray-900 text-sm font-medium rounded-full">
                          {indicator.indicator_code}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-gray-500 mb-2 pr-12">
                        {indicator.indicator_description}
                      </p>
                    </div>
                  ));
                })()}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Please select an output in Step 2 to view available indicators
              </div>
            )}
          </div>
        )}

        {/* Step 5: Distributors */}
        {currentStep === 5 && (
          <div className="space-y-6 px-1">
            {/* Distributor Organizations */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">
                Distributor/Partner (Optional)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {organizations.filter(org => org.organization_type === 'M').map((org) => (
                  <div
                    key={org.organization_id}
                    onClick={() => toggleDistributorOrganization(org.organization_id)}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      formData.distributorOrganizations.includes(org.organization_id)
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <p className="text-sm font-medium text-gray-900">{org.organization_name}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Other Distributors */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-900">
                  Other Distributors (Optional)
                </label>
                <button
                  type="button"
                  onClick={addDistributorOther}
                  className="px-3 py-1.5 bg-blue-500 text-white rounded-full text-xs font-medium hover:bg-blue-600 transition-colors"
                >
                  + Add
                </button>
              </div>

              <div className="space-y-3">
                {formData.distributorOthers.map((distributor, index) => (
                  <div key={index} className="flex gap-2 items-start p-3 border-2 border-gray-200 rounded-xl">
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={distributor.display_name}
                        onChange={(e) => updateDistributorOther(index, 'display_name', e.target.value)}
                        placeholder="Name"
                        className="w-full px-4 py-2 bg-gray-50 border-0 rounded-full text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        value={distributor.contact}
                        onChange={(e) => updateDistributorOther(index, 'contact', e.target.value)}
                        placeholder="Description"
                        className="w-full px-4 py-2 bg-gray-50 border-0 rounded-full text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeDistributorOther(index)}
                      className="p-2 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}

                {formData.distributorOthers.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No other distributors added
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Summary */}
        {currentStep === 6 && (
          <div className="space-y-6 px-1">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                General Information
              </h3>
              <div className="space-y-3">
                <div className="flex">
                  <span className="w-48 text-sm font-medium text-gray-600">Product Name</span>
                  <span className="text-sm font-bold text-gray-900 flex-1">{formData.productName || '—'}</span>
                </div>
                <div className="flex">
                  <span className="w-48 text-sm font-medium text-gray-600">Product Objective</span>
                  <span className="text-sm font-bold text-gray-900 flex-1">{formData.productObjective || '—'}</span>
                </div>
                <div className="flex">
                  <span className="w-48 text-sm font-medium text-gray-600">Deliverable (s)</span>
                  <span className="text-sm font-bold text-gray-900 flex-1">{formData.deliverable || '—'}</span>
                </div>
                <div className="flex">
                  <span className="w-48 text-sm font-medium text-gray-600">Delivery Date</span>
                  <span className="text-sm font-bold text-gray-900 flex-1">{formData.deliveryDate || '—'}</span>
                </div>
                <div className="flex">
                  <span className="w-48 text-sm font-medium text-gray-600">Methodology Description</span>
                  <span className="text-sm font-bold text-gray-900 flex-1">{formData.methodologyDescription || '—'}</span>
                </div>
                <div className="flex">
                  <span className="w-48 text-sm font-medium text-gray-600">Gender Specific Actions (See gender action plan)</span>
                  <span className="text-sm font-bold text-gray-900 flex-1">{formData.genderSpecificActions || '—'}</span>
                </div>
                <div className="flex">
                  <span className="w-48 text-sm font-medium text-gray-600">Next Steps (Add related products)</span>
                  <span className="text-sm font-bold text-gray-900 flex-1">{formData.nextSteps || '—'}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Location and Context
              </h3>
              <div className="space-y-3">
                <div className="flex">
                  <span className="w-40 text-sm font-medium text-gray-600">Output</span>
                  <span className="text-sm font-bold text-gray-900">
                    {outputs.find(o => o.output_id.toString() === formData.output)?.output_name || '—'}
                  </span>
                </div>
                <div className="flex">
                  <span className="w-40 text-sm font-medium text-gray-600">Workpackage</span>
                  <span className="text-sm font-bold text-gray-900">
                    {workpackages.find(w => w.workpackage_id.toString() === formData.workpackage)?.workpackage_name || '—'}
                  </span>
                </div>
                <div className="flex">
                  <span className="w-40 text-sm font-medium text-gray-600">Working Group</span>
                  <span className="text-sm font-bold text-gray-900">
                    {workingGroups.find(wg => wg.workinggroup_id.toString() === formData.workingGroup)?.workinggroup_name || '—'}
                  </span>
                </div>
                <div className="flex">
                  <span className="w-40 text-sm font-medium text-gray-600">Country</span>
                  <span className="text-sm font-bold text-gray-900">
                    {countries.find(c => c.country_id.toString() === formData.country)?.country_name || '—'}
                  </span>
                </div>
                <div className="flex">
                  <span className="w-40 text-sm font-medium text-gray-600">Product Owner</span>
                  <span className="text-sm font-bold text-gray-900">
                    {productOwnerOrgs.find(o => o.organization_id.toString() === formData.productOwner)?.organization_name || '—'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Team
              </h3>
              <div className="space-y-3">
                <div className="flex">
                  <span className="w-40 text-sm font-medium text-gray-600">Responsible</span>
                  <span className="text-sm font-bold text-gray-900">
                    {users.find(u => u.user_id.toString() === formData.responsable)?.user_name || '—'}
                  </span>
                </div>
                <div className="flex">
                  <span className="w-40 text-sm font-medium text-gray-600">Other Organizations</span>
                  <span className="text-sm font-bold text-gray-900">
                    {formData.otherOrganizations.length > 0
                      ? formData.otherOrganizations.map(id => 
                          organizations.find(o => o.organization_id === id)?.organization_name
                        ).join(', ')
                      : '—'}
                  </span>
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
                    const indicator = indicators.find(i => i.indicator_id === id);
                    return (
                      <span key={id} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                        {indicator?.indicator_code}
                      </span>
                    );
                  })
                ) : (
                  <span className="text-sm text-gray-500">No indicators selected</span>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Distributors
              </h3>
              <div className="space-y-3">
                <div className="flex">
                  <span className="w-48 text-sm font-medium text-gray-600">Distributor Organizations</span>
                  <span className="text-sm font-bold text-gray-900 flex-1">
                    {formData.distributorOrganizations.length > 0
                      ? formData.distributorOrganizations.map(id => 
                          organizations.find(o => o.organization_id === id)?.organization_name
                        ).join(', ')
                      : '—'}
                  </span>
                </div>
                <div className="flex">
                  <span className="w-48 text-sm font-medium text-gray-600">Other Distributors</span>
                  <span className="text-sm font-bold text-gray-900 flex-1">
                    {formData.distributorOthers.length > 0
                      ? formData.distributorOthers.map(d => d.display_name).filter(n => n).join(', ')
                      : '—'}
                  </span>
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
          disabled={currentStep === 1 || isSubmitting}
          className={`px-8 py-3 border border-gray-300 text-gray-700 rounded-full font-medium transition-colors ${
            currentStep === 1 || isSubmitting
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:bg-gray-50'
          }`}
        >
          Back
        </button>
        
        {currentStep === STEPS.length ? (
          <button
            type="button"
            onClick={handleCreateProduct}
            disabled={isSubmitting || !formData.productName}
            className="flex items-center gap-2 px-8 py-3 bg-blue-500 text-white rounded-full font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                {editMode ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              editMode ? 'Update Product' : 'Create Product'
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            className="flex items-center gap-2 px-8 py-3 bg-blue-500 text-white rounded-full font-medium hover:bg-blue-600 transition-colors"
          >
            Next
            <ChevronRight size={20} />
          </button>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      <CancelConfirmationModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleConfirmCancel}
        operationType="product creation"
      />
    </div>
  );
}
