'use client';

import { useState } from 'react';

interface RemoveMemberModalProps {
  memberAddress: `0x${string}`;
  onClose: () => void;
  onConfirm: () => void;
}

export function RemoveMemberModal({ memberAddress, onClose, onConfirm }: RemoveMemberModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);

    // TODO: Call smart contract to remove member
    await new Promise(resolve => setTimeout(resolve, 1000));

    onConfirm();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl border border-red-200 dark:border-red-800 p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-red-600 dark:text-red-400">Remove Member</h2>

        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Are you sure you want to remove this member from the team?
        </p>

        <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded-lg mb-6">
          <code className="text-sm font-mono break-all">{memberAddress}</code>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          This action cannot be undone. The member will lose access to all team resources.
        </p>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Removing...' : 'Remove Member'}
          </button>
        </div>
      </div>
    </div>
  );
}
