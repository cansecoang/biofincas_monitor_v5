'use client';

import { useState, useEffect } from 'react';

interface Indicator {
  indicator_id: number;
  indicator_code: string;
  indicator_name: string;
  indicator_description?: string;
  workpackage_id?: number;
  workpackage_name?: string;
}

interface WorkPackage {
  workpackage_id: number;
  workpackage_name: string;
  workpackage_description?: string;
}

export default function WorkpackageIndicatorsPage() {
  const [workPackages, setWorkPackages] = useState<WorkPackage[]>([]);
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [selectedWorkPackage, setSelectedWorkPackage] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Fetch work packages
  useEffect(() => {
    const fetchWorkPackages = async () => {
      try {
        const response = await fetch('/api/work-packages');
        const data = await response.json();
        if (data.success) {
          setWorkPackages(data.workPackages);
        }
      } catch (error) {
        console.error('Error fetching work packages:', error);
      }
    };
    fetchWorkPackages();
  }, []);

  // Fetch all indicators
  useEffect(() => {
    const fetchIndicators = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/indicators');
        const data = await response.json();
        if (data.success) {
          setIndicators(data.indicators);
        }
      } catch (error) {
        console.error('Error fetching indicators:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchIndicators();
  }, []);

  // Filter indicators by selected work package
  const filteredIndicators = selectedWorkPackage
    ? indicators.filter(ind => ind.workpackage_id?.toString() === selectedWorkPackage)
    : indicators;

  // Group indicators by work package
  const groupedIndicators = filteredIndicators.reduce((acc, indicator) => {
    const wpName = indicator.workpackage_name || 'Unassigned';
    if (!acc[wpName]) {
      acc[wpName] = [];
    }
    acc[wpName].push(indicator);
    return acc;
  }, {} as Record<string, Indicator[]>);

  return (
    <div className="space-y-6">
      
    </div>
  );
}
