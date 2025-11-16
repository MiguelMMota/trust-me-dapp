'use client';

import { useState } from 'react';

interface InviteMemberModalProps {
  onClose: () => void;
  onInvite: (address: `0x${string}`, role: 'admin' | 'member') => void;
  canAssignAdmin: boolean;
}

export function InviteMemberModal({ onClose, onInvite, canAssignAdmin }: InviteMemberModalProps) {
  const [address, setAddress] = useState('');
  const [role, setRole] = useState<'admin' | 'member'>('member');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const validateAddress = (addr: string): boolean => {
    if (!addr) return false;
    // Basic Ethereum address validation
    if (!/^0x[a-fA-F0-9]{40}$/.test(addr)) {
      setError('Invalid Ethereum address format');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateAddress(address)) {
      return;
    }

    setIsSubmitting(true);

    // TODO: Call smart contract to invite member
    await new Promise(resolve => setTimeout(resolve, 1000));

    onInvite(address as `0x${string}`, role);
    onClose();
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
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Invite Team Member</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="address"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Member Address
            </label>
            <input
              type="text"
              id="address"
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                setError('');
              }}
              placeholder="0x..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 font-mono text-sm"
              autoFocus
              disabled={isSubmitting}
            />
            {error && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Role
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="role"
                  value="member"
                  checked={role === 'member'}
                  onChange={(e) => setRole('member')}
                  disabled={isSubmitting}
                  className="mr-2"
                />
                <span className="text-sm">
                  <strong>Member</strong> - Can view team content and participate
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="role"
                  value="admin"
                  checked={role === 'admin'}
                  onChange={(e) => setRole('admin')}
                  disabled={isSubmitting || !canAssignAdmin}
                  className="mr-2"
                />
                <span className="text-sm">
                  <strong>Admin</strong> - Can invite and remove members
                  {!canAssignAdmin && (
                    <span className="text-gray-500 dark:text-gray-400"> (Owner only)</span>
                  )}
                </span>
              </label>
            </div>
          </div>

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
              type="submit"
              disabled={!address || isSubmitting}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Inviting...' : 'Invite'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
