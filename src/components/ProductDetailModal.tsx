'use client';

import { ChevronLeft  } from 'lucide-react';

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

// Datos de ejemplo - reemplazar con datos reales
const mockProductData = {
  generalInformation: {
    productName: 'Línea base de biodiversidad en campo — México',
    deliverables: 'Protocolo de muestreo para México; Resultados del muestreo para México; Análisis de los resultados del muestreo en México; Reporte interno BioFinCas; Publicación científica (posible).',
    deliveryDate: '06/10/2025',
    productObjective: 'Product Objective',
  },
  locationAndContext: {
    output: 'Output 1',
    workpackage: 'WP1',
    country: 'Mexico',
    productOwner: 'Oro Verde',
  },
  team: {
    responsable: 'Oro Verde',
    otherOrganizations: 'Nuup, Partner Organization',
  },
  indicators: [
    'META 1.1',
    'META 1.2',
    'META 1.3',
  ],
};

export default function ProductDetailModal({
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: ProductDetailModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-start justify-center pl-16 pt-20 overflow-y-auto">
      {/* Modal Container */}
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-[94vw] max-h-[calc(100vh-8rem)] flex flex-col"
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
              <p className="text-sm text-gray-500 mt-0.5">View product information</p>
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
              className="px-4 py-1.5 bg-blue-500 text-white rounded-full text-sm font-medium hover:bg-blue-600 transition-colors"
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
              <span className="text-sm text-gray-600 font-medium">Product Name</span>
              <span className="text-sm text-gray-900">{mockProductData.generalInformation.productName}</span>
            </div>

            <div className="grid grid-cols-[160px_1fr] gap-x-6 gap-y-1">
              <span className="text-sm text-gray-600 font-medium">Deliverable (s)</span>
              <span className="text-sm text-gray-900">{mockProductData.generalInformation.deliverables}</span>
            </div>

            <div className="grid grid-cols-[160px_1fr] gap-x-6 gap-y-1">
              <span className="text-sm text-gray-600 font-medium">Delivery Date</span>
              <span className="text-sm text-gray-900">{mockProductData.generalInformation.deliveryDate}</span>
            </div>

            <div className="grid grid-cols-[160px_1fr] gap-x-6 gap-y-1">
              <span className="text-sm text-gray-600 font-medium">Product Objective</span>
              <span className="text-sm text-gray-900">{mockProductData.generalInformation.productObjective}</span>
            </div>
          </div>
        </section>

        {/* Location and Context Section */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Location and Context</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-[160px_1fr] gap-x-6 gap-y-1">
              <span className="text-sm text-gray-600 font-medium">Output</span>
              <span className="text-sm text-gray-900">{mockProductData.locationAndContext.output}</span>
            </div>

            <div className="grid grid-cols-[160px_1fr] gap-x-6 gap-y-1">
              <span className="text-sm text-gray-600 font-medium">Workpackage</span>
              <span className="text-sm text-gray-900">{mockProductData.locationAndContext.workpackage}</span>
            </div>

            <div className="grid grid-cols-[160px_1fr] gap-x-6 gap-y-1">
              <span className="text-sm text-gray-600 font-medium">Country</span>
              <span className="text-sm text-gray-900">{mockProductData.locationAndContext.country}</span>
            </div>

            <div className="grid grid-cols-[160px_1fr] gap-x-6 gap-y-1">
              <span className="text-sm text-gray-600 font-medium">Product Owner</span>
              <span className="text-sm text-gray-900">{mockProductData.locationAndContext.productOwner}</span>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Team</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-[160px_1fr] gap-x-6 gap-y-1">
              <span className="text-sm text-gray-600 font-medium">Responsable</span>
              <span className="text-sm text-gray-900">{mockProductData.team.responsable}</span>
            </div>

            <div className="grid grid-cols-[160px_1fr] gap-x-6 gap-y-1">
              <span className="text-sm text-gray-600 font-medium">Other Organizations</span>
              <span className="text-sm text-gray-900">{mockProductData.team.otherOrganizations}</span>
            </div>
          </div>
        </section>

        {/* Indicators Section */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Indicators</h2>
          <div className="flex flex-wrap gap-2">
            {mockProductData.indicators.map((indicator, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium"
              >
                {indicator}
              </span>
            ))}
          </div>
        </section>

      </div>
    </div>
    </div>
  );
}
