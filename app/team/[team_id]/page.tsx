'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { notFound } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { NetworkSwitcher } from '@/components/NetworkSwitcher';
import { Footer } from '@/components/Footer';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { TeamMembersList } from '@/components/TeamMembersList';
import { InviteMemberModal } from '@/components/InviteMemberModal';
import { TeamTabs } from '@/components/TeamTabs';

interface TeamPageProps {
  params: {
    team_id: string;
  };
}

// Mock team data - will be replaced with smart contract data
const mockTeamData = {
  name: 'Engineering Team',
  createdAt: Date.now() - 86400000 * 30, // 30 days ago
  memberCount: 5,
};

// Mock members data - will be replaced with smart contract data
const mockMembers = [
  {
    address: '0x1234567890123456789012345678901234567890' as `0x${string}`,
    role: 'owner' as const,
    joinedAt: Date.now() - 86400000 * 30,
  },
  {
    address: '0x2345678901234567890123456789012345678901' as `0x${string}`,
    role: 'admin' as const,
    joinedAt: Date.now() - 86400000 * 25,
  },
  {
    address: '0x3456789012345678901234567890123456789012' as `0x${string}`,
    role: 'member' as const,
    joinedAt: Date.now() - 86400000 * 20,
  },
  {
    address: '0x4567890123456789012345678901234567890123' as `0x${string}`,
    role: 'member' as const,
    joinedAt: Date.now() - 86400000 * 15,
  },
  {
    address: '0x5678901234567890123456789012345678901234' as `0x${string}`,
    role: 'member' as const,
    joinedAt: Date.now() - 86400000 * 10,
  },
];

export default function TeamPage({ params }: TeamPageProps) {
  const { address, isConnected } = useAccount();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [members, setMembers] = useState(mockMembers);

  // Determine current user's role in the team
  const currentUserMember = members.find(m => m.address.toLowerCase() === address?.toLowerCase());
  const currentUserRole = currentUserMember?.role || null;
  const isOwner = currentUserRole === 'owner';
  const isAdmin = currentUserRole === 'admin';
  const canInvite = isOwner || isAdmin;

  if (!isConnected) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Team Page</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Connect your wallet to view team details
            </p>
            <ConnectButton />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!currentUserMember) {
    notFound();
  }

  const handleInviteMember = (memberAddress: `0x${string}`, role: 'admin' | 'member') => {
    // TODO: Call smart contract to invite member
    const newMember = {
      address: memberAddress,
      role,
      joinedAt: Date.now(),
    };
    setMembers([...members, newMember]);
  };

  const handleRemoveMember = (memberAddress: `0x${string}`) => {
    // TODO: Call smart contract to remove member
    setMembers(members.filter(m => m.address !== memberAddress));
  };

  const handleChangeRole = (memberAddress: `0x${string}`, newRole: 'admin' | 'member') => {
    // TODO: Call smart contract to change role
    setMembers(members.map(m =>
      m.address === memberAddress ? { ...m, role: newRole } : m
    ));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NetworkSwitcher />
      <Navigation address={address} />

      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Team Header */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold mb-2">{mockTeamData.name}</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  Team ID: <code className="bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded text-sm">{params.team_id}</code>
                </p>
                <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span>{mockTeamData.memberCount} members</span>
                  <span>•</span>
                  <span>Created {new Date(mockTeamData.createdAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <span className="capitalize">Your role: <strong>{currentUserRole}</strong></span>
                </div>
              </div>
              {canInvite && (
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Invite Member
                </button>
              )}
            </div>
          </div>

          {/* Team Tabs */}
          <TeamTabs teamId={params.team_id} />

          {/* Team Members */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-2xl font-bold mb-4">Team Members</h2>
            <TeamMembersList
              members={members}
              currentUserRole={currentUserRole}
              onRemoveMember={handleRemoveMember}
              onChangeRole={handleChangeRole}
            />
          </div>
        </div>
      </div>

      {showInviteModal && (
        <InviteMemberModal
          onClose={() => setShowInviteModal(false)}
          onInvite={handleInviteMember}
          canAssignAdmin={isOwner}
        />
      )}

      <Footer />
    </div>
  );
}
