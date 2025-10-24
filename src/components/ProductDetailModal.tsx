'use client';

import { ChevronLeft, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

interface ProductData {
  product: {
    id: number;
    name: string;
    objective: string;
    deliverable: string;
    deliveryDate: string;
    outputNumber: number;
    methodologyDescription: string;
    genderSpecificActions: string;
    nextSteps: string;
    workPackageId: number;
    workPackageName: string;
    workingGroupId: number;
    workingGroupName: string;
    primaryOrganizationId: number;
    primaryOrganization: string;
    countryId: number;
    country: string;
  };
  primaryOrganization: {
    organization_name: string;
    organization_description: string;
  } | null;
  organizations: Array<{
    organization_id: number;
    organization_name: string;
    organization_description: string;
    relation_type: string;
    position: number;
  }>;
  responsibles: Array<{
    user_id: number;
    user_name: string;
    user_last_name: string;
    user_email: string;
    role_label: string;
    is_primary: boolean;
    position: number;
  }>;
  indicators: Array<{
    indicator_id: number;
    indicator_code: string;
    output_number: string;
    indicator_name: string;
    indicator_description: string;
  }>;
  distributors: {
    organizations: Array<{
      organization_id: number;
      organization_name: string;
      organization_description: string;
      position: number;
    }>;
    users: Array<{
      user_id: number;
      user_name: string;
      user_last_name: string;
      user_email: string;
      position: number;
    }>;
    others: Array<{
      display_name: string;
      contact: string;
      position: number;
    }>;
  };
}

export default function ProductDetailModal({
  isOpen,
  onClose,
  productId,
  onEdit,
  onDelete,
}: ProductDetailModalProps) {
  const [productData, setProductData] = useState<ProductData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    if (isOpen && productId) {
      loadProductData();
    }
  }, [isOpen, productId]);

  const loadProductData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/product-full-details?productId=${productId}`);
      const data = await response.json();
      
      if (response.ok) {
        setProductData(data);
      } else {
        setError(data.error || 'Failed to load product details');
      }
    } catch (err) {
      setError('An error occurred while loading product details');
      console.error('Error loading product:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

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
                <h1 className="text-2xl font-bold text-gray-900">Product Detail</h1>
                <p className="text-sm text-gray-500 mt-0.5">View complete product information</p>
              </div>
            </div>

            {/* Right: Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-1.5 border border-gray-300 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={onDelete}
                className="px-4 py-1.5 border border-red-300 text-red-600 rounded-full text-sm font-medium hover:bg-red-50 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={onEdit}
                className="px-4 py-1.5 bg-blue-500 text-white rounded-full text-sm font-medium hover:bg-blue-600 transition-colors"
              >
                Edit
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-16 py-8 overflow-y-auto flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-blue-500" size={48} />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          ) : productData ? (
            <div className="space-y-8">
              {/* General Information Section */}
              <section>
                <h2 className="text-lg font-bold text-gray-900 mb-4">General Information</h2>
                <div className="space-y-3">
                  <div className="grid grid-cols-[200px_1fr] gap-x-6">
                    <span className="text-sm text-gray-600 font-medium">Product Name</span>
                    <span className="text-sm text-gray-900 font-bold">{productData.product.name}</span>
                  </div>
                  {productData.product.objective && (
                    <div className="grid grid-cols-[200px_1fr] gap-x-6">
                      <span className="text-sm text-gray-600 font-medium">Product Objective</span>
                      <span className="text-sm text-gray-900">{productData.product.objective}</span>
                    </div>
                  )}
                  {productData.product.deliverable && (
                    <div className="grid grid-cols-[200px_1fr] gap-x-6">
                      <span className="text-sm text-gray-600 font-medium">Deliverable(s)</span>
                      <span className="text-sm text-gray-900">{productData.product.deliverable}</span>
                    </div>
                  )}
                  {productData.product.deliveryDate && (
                    <div className="grid grid-cols-[200px_1fr] gap-x-6">
                      <span className="text-sm text-gray-600 font-medium">Delivery Date</span>
                      <span className="text-sm text-gray-900">{new Date(productData.product.deliveryDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                  )}
                  {productData.product.methodologyDescription && (
                    <div className="grid grid-cols-[200px_1fr] gap-x-6">
                      <span className="text-sm text-gray-600 font-medium">Methodology Description</span>
                      <span className="text-sm text-gray-900">{productData.product.methodologyDescription}</span>
                    </div>
                  )}
                  {productData.product.genderSpecificActions && (
                    <div className="grid grid-cols-[200px_1fr] gap-x-6">
                      <span className="text-sm text-gray-600 font-medium">Gender Specific Actions</span>
                      <span className="text-sm text-gray-900">{productData.product.genderSpecificActions}</span>
                    </div>
                  )}
                  {productData.product.nextSteps && (
                    <div className="grid grid-cols-[200px_1fr] gap-x-6">
                      <span className="text-sm text-gray-600 font-medium">Next Steps</span>
                      <span className="text-sm text-gray-900">{productData.product.nextSteps}</span>
                    </div>
                  )}
                </div>
              </section>

              {/* Location and Context Section */}
              <section>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Location and Context</h2>
                <div className="space-y-3">
                  {productData.product.outputNumber && (
                    <div className="grid grid-cols-[200px_1fr] gap-x-6">
                      <span className="text-sm text-gray-600 font-medium">Output</span>
                      <span className="text-sm text-gray-900">Output {productData.product.outputNumber}</span>
                    </div>
                  )}
                  {productData.product.workPackageName && (
                    <div className="grid grid-cols-[200px_1fr] gap-x-6">
                      <span className="text-sm text-gray-600 font-medium">Workpackage</span>
                      <span className="text-sm text-gray-900">{productData.product.workPackageName}</span>
                    </div>
                  )}
                  {productData.product.workingGroupName && (
                    <div className="grid grid-cols-[200px_1fr] gap-x-6">
                      <span className="text-sm text-gray-600 font-medium">Working Group</span>
                      <span className="text-sm text-gray-900">{productData.product.workingGroupName}</span>
                    </div>
                  )}
                  {productData.product.country && (
                    <div className="grid grid-cols-[200px_1fr] gap-x-6">
                      <span className="text-sm text-gray-600 font-medium">Country</span>
                      <span className="text-sm text-gray-900">{productData.product.country}</span>
                    </div>
                  )}
                  {productData.product.primaryOrganization && (
                    <div className="grid grid-cols-[200px_1fr] gap-x-6">
                      <span className="text-sm text-gray-600 font-medium">Product Owner</span>
                      <span className="text-sm text-gray-900">{productData.product.primaryOrganization}</span>
                    </div>
                  )}
                </div>
              </section>

              {/* Team Section */}
              <section>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Team</h2>
                <div className="space-y-3">
                  {productData.responsibles && productData.responsibles.length > 0 && (
                    <div className="grid grid-cols-[200px_1fr] gap-x-6">
                      <span className="text-sm text-gray-600 font-medium">Responsibles</span>
                      <div className="space-y-2">
                        {productData.responsibles.map((responsible) => (
                          <div key={responsible.user_id} className="text-sm">
                            <span className="text-gray-900 font-medium">
                              {responsible.user_name} {responsible.user_last_name}
                            </span>
                            {responsible.is_primary && (
                              <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">Primary</span>
                            )}
                            {responsible.role_label && (
                              <span className="block text-gray-600 text-xs">{responsible.role_label}</span>
                            )}
                            <span className="block text-gray-500 text-xs">{responsible.user_email}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {productData.organizations && productData.organizations.length > 0 && (
                    <div className="grid grid-cols-[200px_1fr] gap-x-6">
                      <span className="text-sm text-gray-600 font-medium">Other Organizations</span>
                      <div className="space-y-2">
                        {productData.organizations.map((org) => (
                          <div key={org.organization_id} className="text-sm">
                            <span className="text-gray-900 font-medium">{org.organization_name}</span>
                            {org.relation_type && (
                              <span className="ml-2 text-gray-600 text-xs">({org.relation_type})</span>
                            )}
                            {org.organization_description && (
                              <span className="block text-gray-600 text-xs">{org.organization_description}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Indicators Section */}
              {productData.indicators && productData.indicators.length > 0 && (
                <section>
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Indicators</h2>
                  <div className="flex flex-wrap gap-2">
                    {productData.indicators.map((indicator) => (
                      <div key={indicator.indicator_id} className="group relative">
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium cursor-help">
                          {indicator.indicator_code}
                        </span>
                        <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-10 w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg">
                          <p className="font-medium mb-1">{indicator.indicator_name}</p>
                          <p className="text-gray-300">{indicator.indicator_description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Distributors Section */}
              {(productData.distributors.organizations.length > 0 || 
                productData.distributors.users.length > 0 || 
                productData.distributors.others.length > 0) && (
                <section>
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Distributors</h2>
                  <div className="space-y-4">
                    {productData.distributors.organizations.length > 0 && (
                      <div className="grid grid-cols-[200px_1fr] gap-x-6">
                        <span className="text-sm text-gray-600 font-medium">Distributor Organizations</span>
                        <div className="space-y-2">
                          {productData.distributors.organizations.map((org) => (
                            <div key={org.organization_id} className="text-sm">
                              <span className="text-gray-900 font-medium">{org.organization_name}</span>
                              {org.organization_description && (
                                <span className="block text-gray-600 text-xs">{org.organization_description}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {productData.distributors.users.length > 0 && (
                      <div className="grid grid-cols-[200px_1fr] gap-x-6">
                        <span className="text-sm text-gray-600 font-medium">Distributor Users</span>
                        <div className="space-y-2">
                          {productData.distributors.users.map((user) => (
                            <div key={user.user_id} className="text-sm">
                              <span className="text-gray-900 font-medium">
                                {user.user_name} {user.user_last_name}
                              </span>
                              <span className="block text-gray-500 text-xs">{user.user_email}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {productData.distributors.others.length > 0 && (
                      <div className="grid grid-cols-[200px_1fr] gap-x-6">
                        <span className="text-sm text-gray-600 font-medium">Other Distributors</span>
                        <div className="space-y-2">
                          {productData.distributors.others.map((other, index) => (
                            <div key={index} className="text-sm">
                              <span className="text-gray-900 font-medium">{other.display_name}</span>
                              {other.contact && (
                                <span className="block text-gray-500 text-xs">{other.contact}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              )}
            </div>
          ) : null}
        </div>
      </div>
      </div>
    </>
  );
}
