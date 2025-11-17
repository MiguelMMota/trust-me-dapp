'use client';

import { use, useState, useEffect } from 'react';
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
import {
  useTeamMember,
  useAllTopics,
  useAllTeamTopics,
  useCreateTeamTopic,
  useSetTopicEnabledInTeam
} from '@/hooks/useContracts';

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
  const { topics: globalTopics, isLoading: isLoadingGlobalTopics } = useAllTopics();

  // Fetch team topics from TopicRegistry contract
  const { teamTopics, isLoading: isLoadingTeamTopics } = useAllTeamTopics(team_id);

  // Contract write hooks
  const {
    createTeamTopic,
    isPending: isCreating,
    isConfirming: isConfirmingCreate,
    isSuccess: isCreateSuccess,
    error: createError,
  } = useCreateTeamTopic();

  const {
    setTopicEnabled,
    isPending: isToggling,
    isConfirming: isConfirmingToggle,
    isSuccess: isToggleSuccess,
    error: toggleError,
  } = useSetTopicEnabledInTeam();

  // Get team member data from contract
  const { member: currentUserMemberData } = useTeamMember(team_id, address);

  // Reset create modal on success
  useEffect(() => {
    if (isCreateSuccess) {
      setShowCreateModal(false);
    }
  }, [isCreateSuccess]);

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
  if (!currentUserMemberData || isLoadingGlobalTopics || isLoadingTeamTopics) {
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
    createTeamTopic(team_id, name, parentId);
  };

  const handleToggleActive = (topicId: number, isEnabled: boolean) => {
    setTopicEnabled(team_id, topicId, isEnabled);
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
                disabled={isCreating || isConfirmingCreate}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating || isConfirmingCreate ? 'Creating...' : 'Create Topic'}
              </button>
            </div>

            {/* Transaction status messages */}
            {createError && (
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-800 dark:text-red-200 text-sm">
                  Error creating topic: {createError.message}
                </p>
              </div>
            )}
            {toggleError && (
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-800 dark:text-red-200 text-sm">
                  Error toggling topic: {toggleError.message}
                </p>
              </div>
            )}
            {isConfirmingCreate && (
              <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-blue-800 dark:text-blue-200 text-sm">
                  Confirming transaction...
                </p>
              </div>
            )}

            <TeamTopicManager
              teamId={team_id}
              globalTopics={globalTopics}
              teamTopics={teamTopics}
              onToggleActive={handleToggleActive}
              isToggling={isToggling || isConfirmingToggle}
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
