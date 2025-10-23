import React, { useEffect } from "react";
import { ChevronLeft, Activity, BarChart3, Eye, MapPin, Package2, Target } from "lucide-react";
import { IndicatorPerformance } from "@/types/indicators";

interface IndicatorDetailModalProps {
  open: boolean;
  onClose: () => void;
  indicator?: IndicatorPerformance;
  onProductClick: (productId: number) => void;
}

export default function IndicatorDetailModal({ open, onClose, indicator, onProductClick }: IndicatorDetailModalProps) {
  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    if (open) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      return () => {
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
      };
    }
  }, [open]);

  if (!open || !indicator) return null;

  // Estructura de datos para mostrar en secciones
  const indicatorData = {
    general: {
      code: indicator.indicator_code,
      name: indicator.indicator_name,
      description: indicator.indicator_description || 'Sin descripción disponible',
    },
    metrics: {
      completion: indicator.completion_percentage,
      total: indicator.total_tasks,
      completed: indicator.completed_tasks,
      overdue: indicator.overdue_tasks,
    },
    products: indicator.assigned_products,
    status: indicator.status_distribution,
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
          className="bg-white rounded-2xl border border-gray-200 shadow-xl w-full max-w-[90vw] max-h-[calc(100vh-8rem)] flex flex-col"
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
                  <h1 className="text-2xl font-bold text-gray-900">Indicador</h1>
                  <p className="text-sm text-gray-500 mt-0.5">Detalle del indicador</p>
                </div>
              </div>
              {/* Right: Action Buttons (puedes agregar más si lo necesitas) */}
              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-1.5 border border-gray-300 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
          {/* Content */}
          <div className="px-10 pt-8 overflow-y-auto flex-1">
            {/* General Information Section */}
            <section className="mb-8">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Información General</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-[160px_1fr] gap-x-6 gap-y-1">
                  <span className="text-sm text-gray-600 font-medium">Código</span>
                  <span className="text-sm text-gray-900">{indicatorData.general.code}</span>
                </div>
                <div className="grid grid-cols-[160px_1fr] gap-x-6 gap-y-1">
                  <span className="text-sm text-gray-600 font-medium">Nombre</span>
                  <span className="text-sm text-gray-900">{indicatorData.general.name}</span>
                </div>
                <div className="grid grid-cols-[160px_1fr] gap-x-6 gap-y-1">
                  <span className="text-sm text-gray-600 font-medium">Descripción</span>
                  <span className="text-sm text-gray-900">{indicatorData.general.description}</span>
                </div>
              </div>
            </section>
            {/* Metrics Section */}
            <section className="mb-8">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Métricas</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-[160px_1fr] gap-x-6 gap-y-1">
                  <span className="text-sm text-gray-600 font-medium">Progreso</span>
                  <span className="text-sm text-blue-700 font-bold">{indicatorData.metrics.completion.toFixed(1)}%</span>
                </div>
                <div className="grid grid-cols-[160px_1fr] gap-x-6 gap-y-1">
                  <span className="text-sm text-gray-600 font-medium">Total Tareas</span>
                  <span className="text-sm text-gray-900">{indicatorData.metrics.total}</span>
                </div>
                <div className="grid grid-cols-[160px_1fr] gap-x-6 gap-y-1">
                  <span className="text-sm text-gray-600 font-medium">Completadas</span>
                  <span className="text-sm text-green-600">{indicatorData.metrics.completed}</span>
                </div>
                <div className="grid grid-cols-[160px_1fr] gap-x-6 gap-y-1">
                  <span className="text-sm text-gray-600 font-medium">Vencidas</span>
                  <span className="text-sm text-red-600">{indicatorData.metrics.overdue}</span>
                </div>
              </div>
            </section>
            {/* Status Distribution Section */}
            <section className="mb-8">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Distribución de Estados</h2>
              <div className="space-y-2">
                {indicatorData.status && indicatorData.status.length > 0 ? (
                  indicatorData.status.map((status, idx) => (
                    <div key={idx} className="grid grid-cols-[160px_1fr_1fr] gap-x-6 gap-y-1 items-center">
                      <span className="text-sm text-gray-600 font-medium">{status.status_name}</span>
                      <span className="text-sm text-gray-900">{status.count}</span>
                      <span className="text-sm text-blue-700">{Number(status.percentage).toFixed(1)}%</span>
                    </div>
                  ))
                ) : (
                  <span className="text-sm text-gray-500">No hay datos de estados</span>
                )}
              </div>
            </section>
            {/* Assigned Products Section */}
            <section className="mb-8">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Productos Asignados ({indicatorData.products.length})</h2>
              <div className="space-y-2">
                {indicatorData.products && indicatorData.products.length > 0 ? (
                  indicatorData.products.map((product, idx) => (
                    <div key={idx} className="grid grid-cols-[160px_1fr_1fr] gap-x-6 gap-y-1 items-center cursor-pointer hover:bg-blue-50 rounded-lg px-2 py-1 transition-all"
                      onClick={() => onProductClick(product.product_id)}
                    >
                      <span className="text-sm text-gray-600 font-medium">{product.product_name}</span>
                      <span className="text-xs text-gray-500">{product.country_name}</span>
                      <span className="text-xs text-gray-500">{product.workpackage_name}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-sm text-gray-500">No hay productos asignados</span>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
