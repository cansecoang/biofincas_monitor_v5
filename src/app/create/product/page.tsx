'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Package } from 'lucide-react';

export default function CreateProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const data = Object.fromEntries(formData);
      
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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Back</span>
          </button>
          
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
              <Package size={24} className="text-indigo-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Create New Product
              </h1>
              <p className="text-gray-600">
                Fill in the information below to create a new product
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            {/* 
              🎨 PLACEHOLDER - ESPERANDO TU DISEÑO
              
              Estilos disponibles:
              - Input: w-full px-4 py-2 border border-gray-300 rounded-xl
              - Label: block text-sm font-medium text-gray-700 mb-2
              - Section: space-y-6
              - Grid: grid grid-cols-1 md:grid-cols-2 gap-4
            */}
            
            <div className="space-y-6">
              {/* Example Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g., Web System Development"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Placeholder for more fields */}
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                <Package size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-700 mb-2">
                  Waiting for Form Design
                </p>
                <p className="text-sm text-gray-500">
                  Add your form fields here
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex items-center gap-2 px-8 py-2 bg-indigo-600 text-white rounded-xl font-medium transition-colors ${
                isSubmitting 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-indigo-700'
              }`}
            >
              <Save size={20} />
              {isSubmitting ? 'Creating...' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
