'use client';

import { useState, useEffect } from 'react';

interface Indicator {
  indicator_id: number;
  indicator_code: string;
  indicator_name: string;
  indicator_description?: string;
  workpackage_name?: string;
}

interface Output {
  output_id: number;
  output_number: string;
  output_name: string;
}

export default function OutputIndicatorsPage() {
  const [outputs, setOutputs] = useState<Output[]>([]);
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [selectedOutput, setSelectedOutput] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Fetch outputs
  useEffect(() => {
    const fetchOutputs = async () => {
      try {
        const response = await fetch('/api/outputs');
        const data = await response.json();
        if (data.success) {
          setOutputs(data.outputs);
        }
      } catch (error) {
        console.error('Error fetching outputs:', error);
      }
    };
    fetchOutputs();
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

  return (
    <div className="space-y-6">
      
    </div>
  );
}
