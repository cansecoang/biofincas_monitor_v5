'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save } from 'lucide-react';

export default function CreateTaskPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const data = Object.fromEntries(formData);
      
      console.log('Task data:', data);
      
      // TODO: Replace with actual API call
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to create task');
      
      alert('Task created successfully!');
      router.push('/tasks'); // Adjust redirect as needed
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Error creating task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="space-y-6">
          {/* Task Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              required
              placeholder="e.g., Review project documentation"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              rows={4}
              placeholder="Describe the task in detail..."
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Priority and Due Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority <span className="text-red-500">*</span>
              </label>
              <select
                name="priority"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Select priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date
              </label>
              <input
                type="date"
                name="dueDate"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Assignee */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assignee
            </label>
            <select
              name="assignee"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Select assignee</option>
              <option value="user1">Ana López</option>
              <option value="user2">Pedro Martínez</option>
              <option value="user3">Laura Sánchez</option>
              <option value="user4">Diego Torres</option>
            </select>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex items-center justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-full font-medium hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className={`flex items-center gap-2 px-8 py-2 bg-green-600 text-white rounded-full font-medium transition-colors ${
            isSubmitting 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:bg-green-700'
          }`}
        >
          <Save size={20} />
          {isSubmitting ? 'Creating...' : 'Create Task'}
        </button>
      </div>
    </form>
  );
}
