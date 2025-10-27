"use client"

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from 'next/navigation';

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

  // Read output parameter from URL
  useEffect(() => {
    const urlOutput = searchParams.get('outputId');
    setSelectedOutput(urlOutput);
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-8xl mx-auto">
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
        ) : (
          // Matrix view - waiting for further instructions
          <div className="bg-white rounded-2xl shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Matrix</h2>
            <p className="text-gray-600">Output {selectedOutput} selected</p>
            <p className="text-sm text-gray-500 mt-2">Matrix content will be implemented here...</p>
          </div>
        )}
      </div>
    </div>
  );
}
