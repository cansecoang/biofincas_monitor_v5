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
  const [selectedWorkpackage, setSelectedWorkpackage] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [matrixData, setMatrixData] = useState<MatrixData | null>(null);
  const [isLoadingMatrix, setIsLoadingMatrix] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Read parameters from URL
  useEffect(() => {
    const urlOutput = searchParams.get('outputId');
    const urlWorkpackage = searchParams.get('workpackageId');
    const urlCountry = searchParams.get('countryId');
    
    setSelectedOutput(urlOutput);
    setSelectedWorkpackage(urlWorkpackage);
    setSelectedCountry(urlCountry);
  }, [searchParams]);

  // Fetch matrix data when any filter changes
  useEffect(() => {
    // Only fetch if at least one filter is selected
    if (!selectedOutput && !selectedWorkpackage && !selectedCountry) {
      // Fetch all data when no filters are selected
      const fetchAllData = async () => {
        setIsLoadingMatrix(true);
        setError(null);
        
        try {
          console.log('🔍 Fetching all matrix data (no filters)');
          const response = await fetch('/api/product-matrix');
          
          if (!response.ok) {
            throw new Error('Failed to fetch matrix data');
          }
          
          const data = await response.json();
          console.log('📦 Raw API Response:', data);
          setMatrixData(data);
          console.log('✅ Matrix data set successfully');
        } catch (err) {
          console.error('❌ Error fetching matrix data:', err);
          setError('Failed to load matrix data. Please try again.');
        } finally {
          setIsLoadingMatrix(false);
        }
      };
      
      fetchAllData();
      return;
    }

    const fetchMatrixData = async () => {
      setIsLoadingMatrix(true);
      setError(null);
      
      try {
        // Build URL with filters
        const params = new URLSearchParams();
        if (selectedOutput) params.set('outputId', selectedOutput);
        if (selectedWorkpackage) params.set('workpackageId', selectedWorkpackage);
        if (selectedCountry) params.set('countryId', selectedCountry);
        
        const url = `/api/product-matrix?${params.toString()}`;
        
        console.log(`🔍 Fetching matrix:`, { selectedOutput, selectedWorkpackage, selectedCountry });
        const response = await fetch(url);
        
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
  }, [selectedOutput, selectedWorkpackage, selectedCountry]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-full mx-auto">
        {error ? (
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
