"use client"

import { useState } from 'react';
import { ProductDetailModal } from "@/components/product-detail-modal";
import { useProductMatrix } from "@/contexts/ProductMatrixContext";
import { TableSkeleton } from "@/components/loading-states";

interface Country {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  workPackageId: number;
  outputNumber: number;
  deliveryDate?: string;
  productOwnerName?: string;
}

interface Indicator {
  id: number;
  code: string;
  name: string;
  outputNumber: number;
}

interface MatrixCell {
  indicator: Indicator;
  country: Country;
  products: Product[];
}

interface ProductInfo {
  id: string;
  name: string;
  objective?: string;
  deliverable?: string;
  deliveryDate?: string;
  workPackageId: string;
  workPackageName?: string;
  primaryOrganization?: string;
  country?: string;
}

export function ProductMatrix() {
  // Estados para el modal de detalles del producto
  const [selectedProductForModal, setSelectedProductForModal] = useState<ProductInfo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Obtener datos del contexto
  const {
    matrixData,
    isLoadingMatrix,
  } = useProductMatrix();

  // Handler para abrir modal de detalles del producto
  const handleProductClick = async (productId: number) => {
    try {
      const response = await fetch(`/api/product-full-details?productId=${productId}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedProductForModal(data.product);
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Matrix Table */}
      {isLoadingMatrix && (
        <TableSkeleton rows={8} columns={6} />
      )}

      {matrixData && !isLoadingMatrix && (
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b">
                    Country
                  </th>
                  {matrixData.indicators.map((indicator) => (
                    <th key={indicator.id} className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b min-w-[200px]">
                      <div>
                        <div className="font-semibold">{indicator.code}</div>
                        <div className="text-xs text-gray-600 font-normal">
                          {indicator.name}
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrixData.matrix.map((row, rowIndex) => {
                  const country = row[0] as Country;
                  const cells = row.slice(1) as MatrixCell[];
                  
                  return (
                    <tr key={`country-${country.id}-${rowIndex}`} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900 border-b bg-gray-25">
                        {country.name}
                      </td>
                      {cells.map((cell, cellIndex) => (
                        <td key={`cell-${country.id}-${cell.indicator.id}-${cellIndex}`} className="px-4 py-3 border-b align-top">
                          {cell.products.length > 0 ? (
                            <div className="space-y-2">
                              {cell.products.map((product) => (
                                <div 
                                  key={`product-${product.id}-${country.id}-${cell.indicator.id}`} 
                                  className="p-3 bg-blue-50 rounded text-sm cursor-pointer hover:bg-blue-100 hover:shadow-sm transition-all duration-200 border-l-4 border-blue-400"
                                  onClick={() => handleProductClick(product.id)}
                                >
                                  <div className="font-medium text-blue-900 mb-2">
                                    {product.name}
                                  </div>
                                  <div className="space-y-1">
                                    {product.deliveryDate && (
                                      <div className="flex items-center text-xs text-gray-600">
                                        <span className="font-medium mr-1">📅 Delivery:</span>
                                        <span>{new Date(product.deliveryDate).toLocaleDateString('en-US', {
                                          year: 'numeric',
                                          month: 'short',
                                          day: 'numeric'
                                        })}</span>
                                      </div>
                                    )}
                                    {product.productOwnerName && (
                                      <div className="flex items-center text-xs text-gray-600">
                                        <span className="font-medium mr-1">👤 Owner:</span>
                                        <span className="truncate">{product.productOwnerName}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-gray-400 text-sm italic">
                              No products
                            </div>
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Summary */}
          <div className="px-4 py-3 bg-gray-50 border-t">
            <div className="text-sm text-gray-600">
              Total products: {matrixData.totalProducts}
            </div>
          </div>
        </div>
      )}


      {/* Product Detail Modal */}
      {selectedProductForModal && (
        <ProductDetailModal 
          product={selectedProductForModal}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedProductForModal(null);
          }}
          onEdit={() => {
            // No implementamos edición desde la matriz por ahora
            console.log('Edit from matrix not implemented');
          }}
          onDelete={() => {
            // No implementamos eliminación desde la matriz por ahora
            console.log('Delete from matrix not implemented');
          }}
        />
      )}
    </div>
  );
}