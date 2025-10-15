'use client';

import { useRouter } from 'next/navigation';
import TaskStepWizard from '@/components/TaskStepWizard';

export default function CreateTaskPage() {
  const router = useRouter();

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
      router.push('/products/list');
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Error creating task. Please try again.');
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="pr-4 pl-2 pb-2">
      <TaskStepWizard 
        onComplete={handleComplete}
        onCancel={handleCancel}
      />
    </div>
  );
}

