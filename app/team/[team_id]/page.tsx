'use client';

import { use, useState } from 'react';
import { useAccount } from 'wagmi';
import { notFound } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { NetworkSwitcher } from '@/components/NetworkSwitcher';
import { Footer } from '@/components/Footer';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { TeamMembersList } from '@/components/TeamMembersList';
import { InviteMemberModal } from '@/components/InviteMemberModal';
import { TeamTabs } from '@/components/TeamTabs';
import { useTeam, useTeamMembers, useTeamMember } from '@/hooks/useContracts';

interface TeamPageProps {
  params: {
    team_id: string;
  };
}

// Role enum matches contract: 0 = none, 1 = MEMBER, 2 = ADMIN, 3 = OWNER
const ROLE_NAMES = ['none', 'member', 'admin', 'owner'] as const;

export default function TeamPage({ params }: TeamPageProps) {
  const { team_id } = use(params);
  const { address, isConnected } = useAccount();
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Get team data from contract
  const { team } = useTeam(team_id);
  const { members: memberAddresses, refetch: refetchMembers } = useTeamMembers(team_id);
  const { member: currentUserMemberData } = useTeamMember(team_id, address);

  // Determine current user's role
  const currentUserRole = currentUserMemberData && currentUserMemberData.isActive
    ? ROLE_NAMES[currentUserMemberData.role]
    : null;
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

  // Check if user is a member
  if (!currentUserRole || currentUserRole === 'none') {
    notFound();
  }

  // Show loading state
  if (!team || !memberAddresses) {
    return (
      <div className="min-h-screen flex flex-col">
        <NetworkSwitcher />
        <Navigation address={address} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">Loading team...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

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
                <h1 className="text-4xl font-bold mb-2">{team.name}</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  Team ID: <code className="bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded text-sm">{team.teamId.toString()}</code>
                </p>
                <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span>{memberAddresses.length} member{memberAddresses.length !== 1 ? 's' : ''}</span>
                  <span>•</span>
                  <span>Created {new Date(Number(team.createdAt) * 1000).toLocaleDateString()}</span>
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
          <TeamTabs teamId={team_id} />

          {/* Team Members */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-2xl font-bold mb-4">Team Members</h2>
            <TeamMembersList
              teamId={team_id}
              memberAddresses={memberAddresses}
              currentUserRole={currentUserRole}
              onMembersUpdated={refetchMembers}
            />
          </div>
        </div>
      </div>

      {showInviteModal && (
        <InviteMemberModal
          teamId={team_id}
          onClose={() => setShowInviteModal(false)}
          onSuccess={() => {
            setShowInviteModal(false);
            refetchMembers();
          }}
          canAssignAdmin={isOwner}
        />
      )}

      <Footer />
    </div>
  );
}
