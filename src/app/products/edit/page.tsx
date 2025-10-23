'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProductStepWizard from '@/components/ProductStepWizard';
import { Loader2 } from 'lucide-react';

interface ProductFormData {
  productName: string;
  productObjective: string;
  deliverable: string;
  deliveryDate: string;
  methodologyDescription: string;
  genderSpecificActions: string;
  nextSteps: string;
  output: string;
  workpackage: string;
  workingGroup: string;
  country: string;
  productOwner: string;
  responsable: string;
  otherOrganizations: number[];
  selectedIndicators: number[];
  distributorOrganizations: number[];
  distributorUsers: number[];
  distributorOthers: Array<{ display_name: string; contact: string }>;
}

function EditProductContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get('productId');

  const [isLoading, setIsLoading] = useState(true);
  const [initialData, setInitialData] = useState<Partial<ProductFormData> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) {
      setError('No product ID provided');
      setIsLoading(false);
      return;
    }

    const fetchProductData = async () => {
      try {
        const response = await fetch(`/api/product-full-details?productId=${productId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch product details');
        }

        const data = await response.json();
        
        // Transform API data to wizard format
        const formData: Partial<ProductFormData> = {
          productName: data.product.name || '',
          productObjective: data.product.objective || '',
          deliverable: data.product.deliverable || '',
          deliveryDate: data.product.deliveryDate || '',
          methodologyDescription: data.product.methodologyDescription || '',
          genderSpecificActions: data.product.genderSpecificActions || '',
          nextSteps: data.product.nextSteps || '',
          output: data.product.outputNumber?.toString() || '',
          workpackage: data.product.workPackageId?.toString() || '',
          workingGroup: data.product.workingGroupId?.toString() || '',
          country: data.product.countryId?.toString() || '',
          productOwner: data.product.primaryOrganizationId?.toString() || '',
          responsable: data.responsibles?.find((r: any) => r.is_primary)?.user_id?.toString() || '',
          otherOrganizations: data.organizations?.map((org: any) => org.organization_id) || [],
          selectedIndicators: data.indicators?.map((ind: any) => ind.indicator_id) || [],
          distributorOrganizations: data.distributors?.organizations?.map((org: any) => org.organization_id) || [],
          distributorUsers: data.distributors?.users?.map((user: any) => user.user_id) || [],
          distributorOthers: data.distributors?.others?.map((other: any) => ({
            display_name: other.display_name || '',
            contact: other.contact || ''
          })) || []
        };

        setInitialData(formData);
      } catch (err) {
        console.error('Error loading product:', err);
        setError('Failed to load product data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductData();
  }, [productId]);

  const handleComplete = () => {
    router.push('/products/list');
  };

  const handleCancel = () => {
    router.push('/products/list');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  if (error || !productId || !initialData) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
        <p className="text-gray-600">{error || 'Failed to load product'}</p>
        <button
          onClick={() => router.push('/products/list')}
          className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
        >
          Back to Products
        </button>
      </div>
    );
  }

  return (
    <ProductStepWizard
      onComplete={handleComplete}
      onCancel={handleCancel}
      editMode={true}
      productId={parseInt(productId)}
      initialData={initialData}
    />
  );
}

export default function EditProductPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin text-blue-500" size={48} />
      </div>
    }>
      <EditProductContent />
    </Suspense>
  );
}
