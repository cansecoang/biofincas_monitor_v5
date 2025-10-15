'use client';

import { useRouter } from 'next/navigation';
import ProductStepWizard from '@/components/ProductStepWizard';

export default function CreateProductPage() {
  const router = useRouter();

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
      router.push('/products/list');
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Error creating product. Please try again.');
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="pr-4">
      <ProductStepWizard 
        onComplete={handleComplete}
        onCancel={handleCancel}
      />
    </div>
  );
}
