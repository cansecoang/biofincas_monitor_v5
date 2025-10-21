'use client';

import { Suspense } from 'react';
import TaskStepWizard from '@/components/TaskStepWizard';

export const dynamic = 'force-dynamic';

function CreateTaskContent({ onComplete, onCancel }: { onComplete: (data: any) => void; onCancel: () => void }) {
  return (
    <div className="pr-4 pl-2 pb-2">
      <TaskStepWizard 
        onComplete={onComplete}
        onCancel={onCancel}
      />
    </div>
  );
}

export default function CreateTaskPage() {
  const handleComplete = async (data: any) => {
    try {
      console.log('Task data:', data);
      
      // TODO: Replace with actual API call
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to create task');
      
      alert('Task created successfully!');
      window.location.href = '/products/list';
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Error creating task. Please try again.');
    }
  };

  const handleCancel = () => {
    window.history.back();
  };

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading task form...</div>
      </div>
    }>
      <CreateTaskContent onComplete={handleComplete} onCancel={handleCancel} />
    </Suspense>
  );
}

