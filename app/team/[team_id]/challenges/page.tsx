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

interface TeamChallengesPageProps {
  params: Promise<{
    team_id: string;
  }>;
}

// Role enum matches contract: 0 = none, 1 = MEMBER, 2 = ADMIN, 3 = OWNER
const ROLE_NAMES = ['none', 'member', 'admin', 'owner'] as const;

export default function TeamChallengesPage({ params }: TeamChallengesPageProps) {
  const { team_id } = use(params);
  const { address, isConnected } = useAccount();

  // TODO: Implement team-scoped challenges once contracts support it
  // const challenges = []; // Fetch from contract when available

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
            <h1 className="text-4xl font-bold mb-4">Team Challenges</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Connect your wallet to view challenges
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
          <div className="mb-6">
            <h1 className="text-4xl font-bold mb-2">Team Challenges</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Test your knowledge and build expertise
            </p>
          </div>

          <TeamTabs teamId={team_id} />

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Challenges</h2>
              <Link
                href={`/team/${team_id}/challenges/create`}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Create Challenge
              </Link>
            </div>

            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 mb-4">No challenges yet for this team</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Create challenges to help team members build expertise
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
