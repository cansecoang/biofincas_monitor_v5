'use client';

import { AlertTriangle } from 'lucide-react';

interface CancelConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  operationType?: string;
}

export default function CancelConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Cancel Operation',
  message,
  operationType = 'operation',
}: CancelConfirmationModalProps) {
  if (!isOpen) return null;

  const defaultMessage = message || `Are you sure you want to cancel this ${operationType}? All unsaved changes will be lost.`;

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-[400] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Modal Container */}
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon and Content */}
        <div className="p-6">
          {/* Warning Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="text-amber-600" size={24} />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
            {title}
          </h2>

          {/* Message */}
          <p className="text-sm text-gray-600 text-center mb-6">
            {defaultMessage}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Continue Editing
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="flex-1 px-4 py-2.5 bg-amber-600 text-white rounded-full text-sm font-medium hover:bg-amber-700 transition-colors"
            >
              Yes, Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
