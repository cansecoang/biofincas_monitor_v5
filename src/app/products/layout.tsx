'use client';

import { ReactNode, useState, useEffect, Suspense } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import TabsLayout from '@/components/TabsLayout';
import ProductDetailModal from '@/components/ProductDetailModal';
import TaskDetailModal from '@/components/TaskDetailModal';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';

const productTabs = [
  { id: 'list', label: 'List', href: '/products/list' },
  { id: 'gantt', label: 'Gantt', href: '/products/gantt' },
  { id: 'metrics', label: 'Metrics', href: '/products/metrics' },
];

interface Workpackage {
  workpackage_id: number;
  workpackage_name: string;
}

interface Output {
  output_id: number;
  output_number: string;
  output_name: string;
}

interface Product {
  product_id: number;
  product_name: string;
  workpackage_id: number;
  product_output: number;
  country_name?: string;
  product_owner_name?: string;
  delivery_date?: string;
}

function ProductsLayoutContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [workpackages, setWorkpackages] = useState<Workpackage[]>([]);
  const [outputs, setOutputs] = useState<Output[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  const [selectedWorkpackage, setSelectedWorkpackage] = useState<string>('');
  const [selectedOutput, setSelectedOutput] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isTaskDetailModalOpen, setIsTaskDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Cargar catálogos al montar
  useEffect(() => {
    const fetchCatalogs = async () => {
      try {
        const [workpackagesRes, outputsRes] = await Promise.all([
          fetch('/api/work-packages'),
          fetch('/api/outputs')
        ]);
        
        const workpackagesData = await workpackagesRes.json();
        const outputsData = await outputsRes.json();
        
        if (workpackagesData.success) setWorkpackages(workpackagesData.workpackages);
        if (outputsData.success) setOutputs(outputsData.outputs);
      } catch (error) {
        console.error('Error loading catalogs:', error);
      }
    };
    
    fetchCatalogs();
  }, []);

  // Cargar productos filtrados
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const params = new URLSearchParams();
        if (selectedWorkpackage) params.append('workpackageId', selectedWorkpackage);
        if (selectedOutput) params.append('outputId', selectedOutput);
        
        const url = `/api/products${params.toString() ? `?${params.toString()}` : ''}`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success) {
          setProducts(data.products);
        }
      } catch (error) {
        console.error('Error loading products:', error);
      }
    };
    
    fetchProducts();
  }, [selectedWorkpackage, selectedOutput]);

  // Sincronizar con URL params al cargar
  useEffect(() => {
    const workpackageId = searchParams.get('workpackageId') || '';
    const outputId = searchParams.get('outputId') || '';
    const productId = searchParams.get('productId') || '';
    
    setSelectedWorkpackage(workpackageId);
    setSelectedOutput(outputId);
    setSelectedProduct(productId);
  }, [searchParams]);

  // Actualizar URL manteniendo la ruta actual
  const updateURL = (workpackageId: string, outputId: string, productId: string) => {
    const params = new URLSearchParams();
    if (workpackageId) params.set('workpackageId', workpackageId);
    if (outputId) params.set('outputId', outputId);
    if (productId) params.set('productId', productId);
    
    const queryString = params.toString();
    router.push(`${pathname}${queryString ? `?${queryString}` : ''}`, { scroll: false });
  };

  const handleWorkpackageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedWorkpackage(value);
    setSelectedProduct(''); // Reset product
    updateURL(value, selectedOutput, '');
  };

  const handleOutputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedOutput(value);
    setSelectedProduct(''); // Reset product
    updateURL(selectedWorkpackage, value, '');
  };

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedProduct(value);
    updateURL(selectedWorkpackage, selectedOutput, value);
  };

  // Obtener datos del producto seleccionado
  const selectedProductData = products.find(p => p.product_id.toString() === selectedProduct);
  const selectedProductName = selectedProductData?.product_name || 'Select Product';
  
  // Formatear fecha de entrega
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <TabsLayout tabs={productTabs} basePath="/products">
      <div className="mb-6 flex items-start justify-between">
        {/* Header Section */}
        <div className="max-w-2xl">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 break-words line-clamp-2 overflow-y-auto max-h-[4.5rem]">{selectedProductName}</h1>
          <p className="text-gray-600 text-sm">
            {selectedProductData ? (
              <>
                <span className="font-bold">Country:</span> {selectedProductData.country_name || 'N/A'} • 
                <span className="font-bold ml-2">Owner:</span> {selectedProductData.product_owner_name || 'N/A'} • 
                <span className="font-bold ml-2">Delivery:</span> {formatDate(selectedProductData.delivery_date)}
              </>
            ) : (
              'Select a product to view details'
            )}
          </p>
        </div>

        {/* Dropdowns Section */}
        <div className="flex gap-3 pr-6">
        
          {/*Botón agregar tarea */}
          <div className="relative">
            {selectedProduct ? (
              <button
                onClick={() => {
                  const currentUrl = window.location.pathname + window.location.search;
                  router.push(`/create/task?productId=${selectedProduct}&returnUrl=${encodeURIComponent(currentUrl)}`);
                }}
                className="bg-green-600 text-white rounded-full px-4 py-2 text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 transition-colors inline-block"
              >
                + Add Task
              </button>
            ) : (
              <button
                disabled
                className="bg-gray-300 text-gray-500 rounded-full px-4 py-2 text-sm font-medium cursor-not-allowed inline-block"
                title="Select a product first"
              >
                + Add Task
              </button>
            )}
          </div>
          {/* Workpackage Dropdown */}
          <div className="relative w-36">
            <select 
              value={selectedWorkpackage}
              onChange={handleWorkpackageChange}
              className="appearance-none w-full bg-white border border-gray-300 rounded-full px-4 py-2 pr-10 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer truncate"
            >
              <option value="">Workpackage</option>
              {workpackages.map((wp) => (
                <option key={wp.workpackage_id} value={wp.workpackage_id}>
                  {wp.workpackage_name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Output Dropdown */}
          <div className="relative w-36">
            <select 
              value={selectedOutput}
              onChange={handleOutputChange}
              className="appearance-none w-full bg-white border border-gray-300 rounded-full px-4 py-2 pr-10 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer truncate"
            >
              <option value="">Output</option>
              {outputs.map((output) => (
                <option key={output.output_id} value={output.output_id}>
                  {output.output_name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Product Dropdown */}
          <div className="relative w-36">
            <select 
              value={selectedProduct}
              onChange={handleProductChange}
              className="appearance-none w-full bg-white border border-gray-300 rounded-full px-4 py-2 pr-10 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer truncate"
            >
              <option value="">Product</option>
              {products.map((product) => (
                <option key={product.product_id} value={product.product_id}>
                  {product.product_name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      {children}

      {/* Product Detail Modal */}
      <ProductDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onEdit={() => {
          console.log('Edit clicked');
          // Aquí puedes agregar la lógica de edición
        }}
        onDelete={() => {
          console.log('Delete clicked');
          // Aquí puedes agregar la lógica de eliminación
        }}
      />

      {/* Task Detail Modal */}
      <TaskDetailModal
        isOpen={isTaskDetailModalOpen}
        onClose={() => setIsTaskDetailModalOpen(false)}
        onEdit={() => {
          console.log('Edit task clicked');
          // Aquí puedes agregar la lógica de edición de tarea
        }}
        onDelete={() => {
          console.log('Delete task clicked');
          // Aquí puedes agregar la lógica de eliminación de tarea
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => {
          console.log('Item deleted confirmed!');
          // Aquí puedes agregar la lógica de eliminación real
        }}
        itemName="Línea base de biodiversidad en campo — México"
        itemType="product"
      />
    </TabsLayout>
  );
}

export default function ProductsLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductsLayoutContent>{children}</ProductsLayoutContent>
    </Suspense>
  );
}

