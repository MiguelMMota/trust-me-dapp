'use client';

import { use, useState } from 'react';
import { useAccount } from 'wagmi';
import { notFound } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { NetworkSwitcher } from '@/components/NetworkSwitcher';
import { Footer } from '@/components/Footer';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { TeamTabs } from '@/components/TeamTabs';
import { TeamTopicManager } from '@/components/TeamTopicManager';
import { CreateTopicModal } from '@/components/CreateTopicModal';
import { Topic } from '@/lib/types';
import { useTeamMember, useAllTopics } from '@/hooks/useContracts';

interface TeamTopicsPageProps {
  params: Promise<{
    team_id: string;
  }>;
}

// Role enum matches contract: 0 = none, 1 = MEMBER, 2 = ADMIN, 3 = OWNER
const ROLE_NAMES = ['none', 'member', 'admin', 'owner'] as const;

export default function TeamTopicsPage({ params }: TeamTopicsPageProps) {
  const { team_id } = use(params);
  const { address, isConnected } = useAccount();
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Fetch all global topics from TopicRegistry contract
  const { topics: globalTopics, isLoading: isLoadingTopics } = useAllTopics();

  // TODO: Fetch team topics from TopicRegistry contract using getTeamChildTopics() and getTeamTopic()
  // Use createTeamTopic() for creating new team-specific topics
  const [teamTopics, setTeamTopics] = useState<Topic[]>([
    {
      id: 100,
      name: 'Smart Contract Security',
      parentId: 3, // Child of Blockchain
      isActive: true,
      createdAt: BigInt(Date.now() - 86400000 * 10),
      teamId: BigInt(team_id),
      creatorAddress: '0x1234567890123456789012345678901234567890',
    },
    {
      id: 101,
      name: 'Solidity Best Practices',
      parentId: 100, // Child of Smart Contract Security
      isActive: true,
      createdAt: BigInt(Date.now() - 86400000 * 5),
      teamId: BigInt(team_id),
      creatorAddress: '0x1234567890123456789012345678901234567890',
    },
  ]);

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
            <h1 className="text-4xl font-bold mb-4">Team Topics</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Connect your wallet to view team topics
            </p>
            <ConnectButton />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Show loading state
  if (!currentUserMemberData || isLoadingTopics) {
    return (
      <div className="min-h-screen flex flex-col">
        <NetworkSwitcher />
        <Navigation address={address} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">
              {!currentUserMemberData ? 'Loading team...' : 'Loading topics...'}
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isMember) {
    notFound();
  }

  const handleCreateTopic = (name: string, parentId: number) => {
    // TODO: Call smart contract to create topic
    const newTopic: Topic = {
      id: Date.now(), // Mock ID
      name,
      parentId,
      isActive: true,
      createdAt: BigInt(Date.now()),
      teamId: BigInt(team_id),
      creatorAddress: address,
    };
    setTeamTopics([...teamTopics, newTopic]);
  };

  const handleToggleActive = (topicId: number, isActive: boolean) => {
    // TODO: Call smart contract to activate/deactivate topic
    setTeamTopics(teamTopics.map(t =>
      t.id === topicId ? { ...t, isActive } : t
    ));
  };

  // Combine global and team topics for parent selection
  const allTopics = [...globalTopics, ...teamTopics];

  return (
    <div className="min-h-screen flex flex-col">
      <NetworkSwitcher />
      <Navigation address={address} />

      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-4xl font-bold mb-2">Team Topics</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage team-specific topics for polls and challenges
            </p>
          </div>

          <TeamTabs teamId={team_id} />

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Topics</h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Create Topic
              </button>
            </div>

            <TeamTopicManager
              teamId={team_id}
              globalTopics={globalTopics}
              teamTopics={teamTopics}
              onToggleActive={handleToggleActive}
            />
          </div>
        </div>
      </div>

      {showCreateModal && (
        <CreateTopicModal
          teamId={team_id}
          availableTopics={allTopics}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateTopic}
        />
      )}

      <Footer />
    </div>
  );
}
