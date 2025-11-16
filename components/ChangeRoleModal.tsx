'use client';

import { useState } from 'react';

interface TeamMember {
  address: `0x${string}`;
  role: 'owner' | 'admin' | 'member';
  joinedAt: number;
}

interface ChangeRoleModalProps {
  member: TeamMember;
  onClose: () => void;
  onConfirm: (newRole: 'admin' | 'member') => void;
}

export function ChangeRoleModal({ member, onClose, onConfirm }: ChangeRoleModalProps) {
  const [newRole, setNewRole] = useState<'admin' | 'member'>(
    member.role === 'admin' ? 'member' : 'admin'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);

    // TODO: Call smart contract to change role
    await new Promise(resolve => setTimeout(resolve, 1000));

    onConfirm(newRole);
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
        <h2 className="text-2xl font-bold mb-4">Change Member Role</h2>

        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Change the role for this team member:
        </p>

        <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded-lg mb-4">
          <code className="text-sm font-mono break-all">{member.address}</code>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Current Role: <strong className="capitalize">{member.role}</strong>
          </label>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            New Role
          </label>
          <div className="space-y-3">
            <label className="flex items-start p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
              <input
                type="radio"
                name="role"
                value="member"
                checked={newRole === 'member'}
                onChange={() => setNewRole('member')}
                disabled={isSubmitting}
                className="mt-1 mr-3"
              />
              <div>
                <div className="font-medium">Member</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Can view team content and participate in team activities
                </div>
              </div>
            </label>

            <label className="flex items-start p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
              <input
                type="radio"
                name="role"
                value="admin"
                checked={newRole === 'admin'}
                onChange={() => setNewRole('admin')}
                disabled={isSubmitting}
                className="mt-1 mr-3"
              />
              <div>
                <div className="font-medium">Admin</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Can invite and remove members, plus all member permissions
                </div>
              </div>
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
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting || newRole === member.role}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Updating...' : 'Update Role'}
          </button>
        </div>
      </div>
    </div>
  );
}
