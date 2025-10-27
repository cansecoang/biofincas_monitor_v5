import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Package2, User, MapPin, Calendar } from "lucide-react";

interface Product {
  product_id: number;
  product_name: string;
  product_owner: string;
  country_name: string;
  delivery_date: string;
}

interface ProductListModalProps {
  open: boolean;
  onClose: () => void;
  products: Product[];
  title: string;
}

export default function ProductListModal({ open, onClose, products, title }: ProductListModalProps) {
  const router = useRouter();

  // Debug log
  useEffect(() => {
    if (open) {
      console.log('🔍 ProductListModal opened');
      console.log('📦 Products received:', products);
      console.log('📝 Title:', title);
      console.log('🔢 Products count:', products?.length);
    }
  }, [open, products, title]);

  // Block body scroll when modal is open
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

  // Navigate to product detail
  const handleProductClick = (productId: number) => {
    router.push(`/products/list?productId=${productId}`);
    onClose(); // Close modal after navigation
  };

  // Format date function
  const formatDate = (dateString: string) => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
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
                  <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                  <p className="text-sm text-gray-500 mt-0.5">{products.length} product{products.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
              
              {/* Right: Action Button */}
              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-1.5 border border-gray-300 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-4 py-4 rounded-t-2xl">
            {products.length === 0 ? (
              <div className="text-center py-12">
                <Package2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">No products to display</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Country
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Owner
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Delivery Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr
                        key={product.product_id}
                        onClick={() => handleProductClick(product.product_id)}
                        className="hover:bg-blue-50 cursor-pointer transition-colors"
                      >
                        <td className="px-6 py-4 max-w-xs">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-50 rounded-lg flex-shrink-0 mt-0.5">
                              <Package2 className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="text-sm font-medium text-gray-900 line-clamp-3">
                              {product.product_name}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-700">
                              {product.country_name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-700">
                              {product.product_owner || 'Unassigned'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-700">
                              {formatDate(product.delivery_date)}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
