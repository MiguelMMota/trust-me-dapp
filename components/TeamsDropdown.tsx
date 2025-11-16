'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { CreateTeamModal } from './CreateTeamModal';
import { useUserTeams, useTeam } from '@/hooks/useContracts';

interface TeamsDropdownProps {
  address: `0x${string}`;
}

export function TeamsDropdown({ address }: TeamsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get user's teams from contract
  const { teamIds } = useUserTeams(address);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          onMouseEnter={() => setIsOpen(true)}
          className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 flex items-center gap-1"
        >
          Teams
          <svg
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div
            className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50"
            onMouseLeave={() => setIsOpen(false)}
          >
            {teamIds && teamIds.length > 0 ? (
              <>
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  Your Teams
                </div>
                {teamIds.map((teamId) => (
                  <TeamLink key={teamId.toString()} teamId={teamId} onClose={() => setIsOpen(false)} />
                ))}
                <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
              </>
            ) : (
              <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                {teamIds === undefined ? 'Loading...' : 'You\'re not part of any teams yet'}
              </div>
            )}

            <button
              onClick={() => {
                setShowCreateModal(true);
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium"
            >
              + Create New Team
            </button>
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateTeamModal
          address={address}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </>
  );
}

// Helper component to fetch and display team data
function TeamLink({ teamId, onClose }: { teamId: bigint; onClose: () => void }) {
  const { team } = useTeam(teamId);

  if (!team) {
    return (
      <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
        Loading...
      </div>
    );
  }

  return (
    <Link
      href={`/team/${teamId.toString()}`}
      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
      onClick={onClose}
    >
      {team.name}
    </Link>
  );
}
