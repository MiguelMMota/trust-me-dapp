'use client';

import { use } from 'react';
import { useAccount } from 'wagmi';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { NetworkSwitcher } from '@/components/NetworkSwitcher';
import { Footer } from '@/components/Footer';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { TeamTabs } from '@/components/TeamTabs';
import { useTeamMember } from '@/hooks/useContracts';

interface TeamPollsPageProps {
  params: Promise<{
    team_id: string;
  }>;
}

// Role enum matches contract: 0 = none, 1 = MEMBER, 2 = ADMIN, 3 = OWNER
const ROLE_NAMES = ['none', 'member', 'admin', 'owner'] as const;

export default function TeamPollsPage({ params }: TeamPollsPageProps) {
  const { team_id } = use(params);
  const { address, isConnected } = useAccount();

  // TODO: Implement team-scoped polls once contracts support it
  // const polls = []; // Fetch from contract when available

  // Get team member data from contract
  const { member: currentUserMemberData } = useTeamMember(team_id, address);

  // Determine current user's role
  const currentUserRole = currentUserMemberData && currentUserMemberData.isActive
    ? ROLE_NAMES[currentUserMemberData.role]
    : null;
  const isMember = currentUserRole !== null && currentUserRole !== 'none';

  if (!isConnected) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Team Polls</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Connect your wallet to view team polls
            </p>
            <ConnectButton />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Show loading state
  if (!currentUserMemberData) {
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

  if (!isMember) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col">
      <NetworkSwitcher />
      <Navigation address={address} />

      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-4xl font-bold mb-2">Team Polls</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Vote on team decisions with expertise-weighted voting
            </p>
          </div>

          <TeamTabs teamId={team_id} />

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Polls</h2>
              <Link
                href={`/team/${team_id}/polls/create`}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Create Poll
              </Link>
            </div>

            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 mb-4">No polls yet for this team</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Create a poll to get team input on decisions
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
