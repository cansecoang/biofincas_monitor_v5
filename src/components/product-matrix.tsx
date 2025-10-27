"use client"

import { useRouter } from 'next/navigation';

// Simple skeleton component for the matrix
function MatrixSkeleton() {
  return (
    <div className="bg-white rounded-2xl border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 py-3 text-left border-b">
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
              </th>
              {[...Array(4)].map((_, i) => (
                <th key={i} className="px-4 py-3 text-left border-b min-w-[200px]">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-32 animate-pulse"></div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(6)].map((_, rowIndex) => (
              <tr key={rowIndex}>
                <td className="px-4 py-3 border-b">
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                </td>
                {[...Array(4)].map((_, cellIndex) => (
                  <td key={cellIndex} className="px-4 py-3 border-b">
                    <div className="space-y-2">
                      <div className="h-20 bg-gray-100 rounded animate-pulse"></div>
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

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

interface MatrixData {
  indicators: Indicator[];
  matrix: (Country | MatrixCell)[][];
  totalProducts: number;
}

interface ProductMatrixProps {
  matrixData: MatrixData | null;
  isLoadingMatrix: boolean;
}

export function ProductMatrix({ matrixData, isLoadingMatrix }: ProductMatrixProps) {
  const router = useRouter();

  // Log when component receives data
  console.log('🎨 ProductMatrix render:', {
    hasMatrixData: !!matrixData,
    isLoading: isLoadingMatrix,
    indicatorsCount: matrixData?.indicators?.length || 0,
    matrixRows: matrixData?.matrix?.length || 0,
    totalProducts: matrixData?.totalProducts || 0
  });

  // Handler para navegar al producto
  const handleProductClick = (productId: number) => {
    console.log('🖱️ Product clicked:', productId);
    router.push(`/products/list?productId=${productId}`);
  };

  return (
    <div className="space-y-6">
      {/* Matrix Table */}
      {isLoadingMatrix && (
        <MatrixSkeleton />
      )}

      {matrixData && !isLoadingMatrix && (
        <div className="bg-white rounded-2xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b">
                    Country
                  </th>
                  {matrixData.indicators.map((indicator: Indicator) => {
                    console.log('📊 Rendering indicator header:', indicator.code);
                    return (
                      <th key={indicator.id} className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b min-w-[200px]">
                        <div>
                          <div className="font-semibold">
                            META {indicator.code}
                          </div>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {matrixData.matrix.map((row: (Country | MatrixCell)[], rowIndex: number) => {
                  const country = row[0] as Country;
                  const cells = row.slice(1) as MatrixCell[];
                  
                  console.log(`🌍 Rendering row ${rowIndex}:`, country.name, 'with', cells.length, 'cells');
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
                                    <div className="flex items-center text-xs text-gray-600">
                                      <span className="font-bold mr-1">Country:</span>
                                      <span>{country.name}</span>
                                    </div>
                                    {product.productOwnerName && (
                                      <div className="flex items-center text-xs text-gray-600">
                                        <span className="font-bold mr-1">Owner:</span>
                                        <span className="truncate">{product.productOwnerName}</span>
                                      </div>
                                    )}
                                    {product.deliveryDate && (
                                      <div className="flex items-center text-xs text-gray-600">
                                        <span className="font-bold mr-1">Delivery:</span>
                                        <span>{new Date(product.deliveryDate).toLocaleDateString('en-US', {
                                          year: 'numeric',
                                          month: 'short',
                                          day: 'numeric'
                                        })}</span>
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
    </div>
  );
}