'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateTeam, useUserTeams } from '@/hooks/useContracts';
import { getTeamErrorMessage } from '@/lib/errors';

interface CreateTeamModalProps {
  address: `0x${string}`;
  onClose: () => void;
}

export function CreateTeamModal({ address, onClose }: CreateTeamModalProps) {
  const [teamName, setTeamName] = useState('');
  const router = useRouter();

  const { createTeam, isPending, isConfirming, isSuccess, error } = useCreateTeam();
  const { teamIds, refetch: refetchTeams } = useUserTeams(address);

  const isSubmitting = isPending || isConfirming;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) return;
    createTeam(teamName.trim());
  };

  // Handle success - refetch teams and navigate to the new team
  useEffect(() => {
    if (isSuccess && teamIds) {
      refetchTeams().then((result) => {
        const newTeamIds = result.data;
        if (newTeamIds && newTeamIds.length > 0) {
          // The newest team will be the last one
          const latestTeamId = newTeamIds[newTeamIds.length - 1];
          router.push(`/team/${latestTeamId.toString()}`);
        } else {
          // Fallback if refetch didn't work
          onClose();
        }
      });
    }
  }, [isSuccess, teamIds, refetchTeams, router, onClose]);

  // Close modal when clicking on backdrop
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
        <h2 className="text-2xl font-bold mb-4">Create New Team</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label
              htmlFor="teamName"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Team Name
            </label>
            <input
              type="text"
              id="teamName"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Enter team name"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              autoFocus
              disabled={isSubmitting}
            />
            {error && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                {getTeamErrorMessage(error)}
              </p>
            )}
            {isConfirming && (
              <p className="mt-2 text-sm text-blue-600 dark:text-blue-400">
                Waiting for transaction confirmation...
              </p>
            )}
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
              disabled={!teamName.trim() || isSubmitting}
              className="px-6 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg font-medium hover:bg-gray-700 dark:hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Creating...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
