'use client';

import { Suspense } from 'react';
import ProductStepWizard from '@/components/ProductStepWizard';

export const dynamic = 'force-dynamic';

function CreateProductContent({ onComplete, onCancel }: { onComplete: (data: any) => void; onCancel: () => void }) {
  return (
    <div className="pr-4 pl-2 pb-2">
      <ProductStepWizard 
        onComplete={onComplete}
        onCancel={onCancel}
      />
    </div>
  );
}

export default function CreateProductPage() {
  const handleComplete = async (data: any) => {
    try {
      console.log('Product data:', data);
      
      // TODO: Replace with actual API call
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to create product');
      
      alert('Product created successfully!');
      window.location.href = '/products/list';
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Error creating product. Please try again.');
    }
  };

  const handleCancel = () => {
    window.history.back();
  };

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading product form...</div>
      </div>
    }>
      <CreateProductContent onComplete={handleComplete} onCancel={handleCancel} />
    </Suspense>
  );
}
