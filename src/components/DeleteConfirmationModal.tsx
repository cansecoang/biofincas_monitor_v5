'use client';

import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  itemName?: string;
  itemType?: string;
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Deletion',
  message,
  itemName,
  itemType = 'item',
}: DeleteConfirmationModalProps) {
  if (!isOpen) return null;

  const defaultMessage = itemName
    ? `Are you sure you want to delete "${itemName}"? This action cannot be undone.`
    : `Are you sure you want to delete this ${itemType}? This action cannot be undone.`;

  const displayMessage = message || defaultMessage;

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
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="text-red-600" size={24} />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
            {title}
          </h2>

          {/* Message */}
          <p className="text-sm text-gray-600 text-center mb-6">
            {displayMessage}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-full text-sm font-medium hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
