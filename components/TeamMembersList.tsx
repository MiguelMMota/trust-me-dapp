'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChangeRoleModal } from './ChangeRoleModal';
import { RemoveMemberModal } from './RemoveMemberModal';
import { useTeamMember } from '@/hooks/useContracts';
import type { Address } from '@/lib/types';

interface TeamMembersListProps {
  teamId: string;
  memberAddresses: Address[];
  currentUserRole: 'owner' | 'admin' | 'member' | 'none' | null;
  onMembersUpdated: () => void;
}

// Role enum matches contract: 0 = none, 1 = MEMBER, 2 = ADMIN, 3 = OWNER
const ROLE_NAMES = ['none', 'member', 'admin', 'owner'] as const;

export function TeamMembersList({
  teamId,
  memberAddresses,
  currentUserRole,
  onMembersUpdated,
}: TeamMembersListProps) {
  const [memberToRemove, setMemberToRemove] = useState<Address | null>(null);
  const [memberToChangeRole, setMemberToChangeRole] = useState<{address: Address; role: string} | null>(null);

  const isOwner = currentUserRole === 'owner';
  const isAdmin = currentUserRole === 'admin';
  const canRemove = isOwner || isAdmin;

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300';
      case 'admin':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
      case 'member':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    }
  };

  const canRemoveMember = (memberRole: string) => {
    if (memberRole === 'owner') return false; // Can't remove owner
    if (!canRemove) return false;
    if (currentUserRole === 'admin' && memberRole === 'admin') return false; // Admin can't remove other admins
    return true;
  };

  const canChangeRole = (memberRole: string) => {
    if (!isOwner) return false; // Only owner can change roles
    if (memberRole === 'owner') return false; // Can't change owner's role
    return true;
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300">
                Address
              </th>
              <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300">
                Role
              </th>
              <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300">
                Joined
              </th>
              <th className="text-right py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {memberAddresses.map((address) => (
              <MemberRow
                key={address}
                teamId={teamId}
                address={address}
                getRoleBadgeColor={getRoleBadgeColor}
                canRemoveMember={canRemoveMember}
                canChangeRole={canChangeRole}
                onRemove={setMemberToRemove}
                onChangeRole={(addr, role) => setMemberToChangeRole({address: addr, role})}
              />
            ))}
          </tbody>
        </table>
      </div>

      {memberToRemove && (
        <RemoveMemberModal
          teamId={teamId}
          memberAddress={memberToRemove}
          onClose={() => setMemberToRemove(null)}
          onSuccess={() => {
            setMemberToRemove(null);
            onMembersUpdated();
          }}
        />
      )}

      {memberToChangeRole && (
        <ChangeRoleModal
          teamId={teamId}
          memberAddress={memberToChangeRole.address}
          currentRole={memberToChangeRole.role}
          onClose={() => setMemberToChangeRole(null)}
          onSuccess={() => {
            setMemberToChangeRole(null);
            onMembersUpdated();
          }}
        />
      )}
    </>
  );
}

// Helper component to fetch and display individual member data
function MemberRow({
  teamId,
  address,
  getRoleBadgeColor,
  canRemoveMember,
  canChangeRole,
  onRemove,
  onChangeRole,
}: {
  teamId: string;
  address: Address;
  getRoleBadgeColor: (role: string) => string;
  canRemoveMember: (role: string) => boolean;
  canChangeRole: (role: string) => boolean;
  onRemove: (address: Address) => void;
  onChangeRole: (address: Address, role: string) => void;
}) {
  const { member } = useTeamMember(teamId, address);

  if (!member || !member.isActive) {
    return null;
  }

  const role = ROLE_NAMES[member.role];

  return (
    <tr className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
      <td className="py-3 px-4">
        <Link
          href={`/user/${address}`}
          className="text-sm font-mono text-blue-600 dark:text-blue-400 hover:underline"
        >
          {address.slice(0, 6)}...{address.slice(-4)}
        </Link>
      </td>
      <td className="py-3 px-4">
        <span
          className={`inline-block px-2 py-1 rounded text-xs font-medium uppercase ${getRoleBadgeColor(role)}`}
        >
          {role}
        </span>
      </td>
      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
        {new Date(Number(member.joinedAt) * 1000).toLocaleDateString()}
      </td>
      <td className="py-3 px-4">
        <div className="flex justify-end gap-2">
          <Link
            href={`/user/${address}`}
            className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          >
            View Profile
          </Link>
          {canChangeRole(role) && (
            <button
              onClick={() => onChangeRole(address, role)}
              className="px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
            >
              Change Role
            </button>
          )}
          {canRemoveMember(role) && (
            <button
              onClick={() => onRemove(address)}
              className="px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
            >
              Remove
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
