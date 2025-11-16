'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChangeRoleModal } from './ChangeRoleModal';
import { RemoveMemberModal } from './RemoveMemberModal';

interface TeamMember {
  address: `0x${string}`;
  role: 'owner' | 'admin' | 'member';
  joinedAt: number;
}

interface TeamMembersListProps {
  members: TeamMember[];
  currentUserRole: 'owner' | 'admin' | 'member' | null;
  onRemoveMember: (address: `0x${string}`) => void;
  onChangeRole: (address: `0x${string}`, newRole: 'admin' | 'member') => void;
}

export function TeamMembersList({
  members,
  currentUserRole,
  onRemoveMember,
  onChangeRole,
}: TeamMembersListProps) {
  const [memberToRemove, setMemberToRemove] = useState<`0x${string}` | null>(null);
  const [memberToChangeRole, setMemberToChangeRole] = useState<TeamMember | null>(null);

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

  const canRemoveMember = (member: TeamMember) => {
    if (member.role === 'owner') return false; // Can't remove owner
    if (!canRemove) return false;
    if (currentUserRole === 'admin' && member.role === 'admin') return false; // Admin can't remove other admins
    return true;
  };

  const canChangeRole = (member: TeamMember) => {
    if (!isOwner) return false; // Only owner can change roles
    if (member.role === 'owner') return false; // Can't change owner's role
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
            {members.map((member) => (
              <tr
                key={member.address}
                className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
              >
                <td className="py-3 px-4">
                  <Link
                    href={`/user/${member.address}`}
                    className="text-sm font-mono text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {member.address.slice(0, 6)}...{member.address.slice(-4)}
                  </Link>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-medium uppercase ${getRoleBadgeColor(
                      member.role
                    )}`}
                  >
                    {member.role}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                  {new Date(member.joinedAt).toLocaleDateString()}
                </td>
                <td className="py-3 px-4">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/user/${member.address}`}
                      className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    >
                      View Profile
                    </Link>
                    {canChangeRole(member) && (
                      <button
                        onClick={() => setMemberToChangeRole(member)}
                        className="px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                      >
                        Change Role
                      </button>
                    )}
                    {canRemoveMember(member) && (
                      <button
                        onClick={() => setMemberToRemove(member.address)}
                        className="px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {memberToRemove && (
        <RemoveMemberModal
          memberAddress={memberToRemove}
          onClose={() => setMemberToRemove(null)}
          onConfirm={() => {
            onRemoveMember(memberToRemove);
            setMemberToRemove(null);
          }}
        />
      )}

      {memberToChangeRole && (
        <ChangeRoleModal
          member={memberToChangeRole}
          onClose={() => setMemberToChangeRole(null)}
          onConfirm={(newRole) => {
            onChangeRole(memberToChangeRole.address, newRole);
            setMemberToChangeRole(null);
          }}
        />
      )}
    </>
  );
}
