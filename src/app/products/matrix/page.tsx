"use client"

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from 'next/navigation';
import { ProductMatrix } from "@/components/product-matrix";

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

export default function MatrixPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-64"><div className="text-muted-foreground">Loading matrix...</div></div>}>
      <MatrixContent />
    </Suspense>
  );
}

function MatrixContent() {
  const searchParams = useSearchParams();
  const [selectedOutput, setSelectedOutput] = useState<string | null>(null);
  const [matrixData, setMatrixData] = useState<MatrixData | null>(null);
  const [isLoadingMatrix, setIsLoadingMatrix] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Read output parameter from URL
  useEffect(() => {
    const urlOutput = searchParams.get('outputId');
    setSelectedOutput(urlOutput);
  }, [searchParams]);

  // Fetch matrix data when output is selected
  useEffect(() => {
    if (!selectedOutput) {
      setMatrixData(null);
      return;
    }

    const fetchMatrixData = async () => {
      setIsLoadingMatrix(true);
      setError(null);
      
      try {
        console.log(`🔍 Fetching matrix for output: ${selectedOutput}`);
        const response = await fetch(`/api/product-matrix?outputId=${selectedOutput}`);
        
        console.log(`📡 Response status: ${response.status}`);
        console.log(`📡 Response ok: ${response.ok}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch matrix data');
        }
        
        const data = await response.json();
        console.log('📦 Raw API Response:', data);
        console.log('📊 Indicators:', data.indicators);
        console.log('🌍 Matrix rows:', data.matrix?.length);
        console.log('📈 Total products:', data.totalProducts);
        
        if (data.matrix && data.matrix.length > 0) {
          console.log('🔍 First row structure:', data.matrix[0]);
          console.log('🔍 First row length:', data.matrix[0]?.length);
        }
        
        setMatrixData(data);
        console.log('✅ Matrix data set successfully');
      } catch (err) {
        console.error('❌ Error fetching matrix data:', err);
        setError('Failed to load matrix data. Please try again.');
      } finally {
        setIsLoadingMatrix(false);
        console.log('🏁 Loading finished');
      }
    };

    fetchMatrixData();
  }, [selectedOutput]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-full mx-auto">
        {!selectedOutput ? (
          // No output selected state
          <div className="bg-white rounded-2xl shadow p-12">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No Output Selected</h3>
              <p className="mt-2 text-gray-500">Please select an output from the dropdown above to view the product matrix.</p>
            </div>
          </div>
        ) : error ? (
          // Error state
          <div className="bg-white rounded-2xl shadow p-12">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Error Loading Matrix</h3>
              <p className="mt-2 text-gray-500">{error}</p>
            </div>
          </div>
        ) : (
          // Matrix view
          <ProductMatrix 
            matrixData={matrixData} 
            isLoadingMatrix={isLoadingMatrix} 
          />
        )}
      </div>
    </div>
  );
}
