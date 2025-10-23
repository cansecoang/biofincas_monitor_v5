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
  const handleComplete = (data: any) => {
    // ProductStepWizard ya maneja la creación del producto internamente
    // Esta función solo se llama cuando el producto se creó exitosamente
    console.log('Product created successfully with data:', data);
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
