'use client';

import { use, useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { NetworkSwitcher } from '@/components/NetworkSwitcher';
import { Footer } from '@/components/Footer';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { TeamTabs } from '@/components/TeamTabs';
import { TeamPollsList } from '@/components/TeamPollsList';
import {
  useTeamMember,
  useAllTeamTopics,
  useTopicPolls,
  useChainId,
} from '@/hooks/useContracts';
import { createPublicClient, http } from 'viem';
import { sepolia, hardhat } from 'viem/chains';
import { getContract } from '@/lib/contracts';

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
  const chainId = useChainId();
  const [polls, setPolls] = useState<any[]>([]);
  const [isLoadingPolls, setIsLoadingPolls] = useState(true);

  // Get team member data from contract
  const { member: currentUserMemberData } = useTeamMember(team_id, address);

  // Fetch all team topics
  const { teamTopics, isLoading: isLoadingTopics } = useAllTeamTopics(team_id);

  // Determine current user's role
  const currentUserRole = currentUserMemberData && currentUserMemberData.isActive
    ? ROLE_NAMES[currentUserMemberData.role]
    : null;
  const isMember = currentUserRole !== null && currentUserRole !== 'none';
  const canCreatePoll = currentUserRole === 'admin' || currentUserRole === 'owner';

  // Fetch polls for all team topics
  useEffect(() => {
    if (!teamTopics || teamTopics.length === 0) {
      setIsLoadingPolls(false);
      setPolls([]);
      return;
    }

    const fetchPolls = async () => {
      try {
        setIsLoadingPolls(true);

        const publicClient = createPublicClient({
          chain: chainId === 11155111 ? sepolia : hardhat,
          transport: http(),
        });

        const pollContract = getContract(chainId, 'Poll');
        const allPolls: any[] = [];

        // Fetch polls for each team topic
        for (const topic of teamTopics) {
          try {
            // Get poll IDs for this topic
            const pollIds = (await publicClient.readContract({
              address: pollContract.address,
              abi: pollContract.abi,
              functionName: 'getTopicPolls',
              args: [topic.id],
            })) as bigint[];

            // Fetch each poll's data
            for (const pollId of pollIds) {
              try {
                const [pollData, options, results] = await Promise.all([
                  publicClient.readContract({
                    address: pollContract.address,
                    abi: pollContract.abi,
                    functionName: 'getPoll',
                    args: [pollId],
                  }),
                  publicClient.readContract({
                    address: pollContract.address,
                    abi: pollContract.abi,
                    functionName: 'getPollOptions',
                    args: [pollId],
                  }),
                  publicClient.readContract({
                    address: pollContract.address,
                    abi: pollContract.abi,
                    functionName: 'getPollResults',
                    args: [pollId],
                  }),
                ]);

                // Transform contract data to Poll UI type
                const poll: any = pollData;
                const pollOptions: any[] = options as any[];
                const pollResults: any = results;

                // Calculate percentages
                const totalVotes = pollOptions.reduce((sum, opt) => sum + Number(opt.voteCount), 0);
                const totalWeight = pollOptions.reduce((sum, opt) => sum + Number(opt.totalWeight), 0);

                const transformedPoll = {
                  id: pollId,
                  question: poll.question,
                  topicId: topic.id,
                  topicName: topic.name,
                  creator: poll.creator,
                  createdAt: new Date(Number(poll.createdAt) * 1000),
                  endTime: new Date(Number(poll.endTime) * 1000),
                  status: poll.status,
                  options: pollOptions.map((opt, idx) => ({
                    id: opt.optionId,
                    text: opt.optionText,
                    votes: opt.voteCount,
                    weight: Number(opt.totalWeight),
                    percentage: totalVotes > 0 ? (opt.voteCount / totalVotes) * 100 : 0,
                    weightedPercentage: totalWeight > 0 ? (Number(opt.totalWeight) / totalWeight) * 100 : 0,
                  })),
                  totalVoters: poll.totalVoters,
                  isActive: poll.status === 0, // PollStatus.Active = 0
                  teamId: BigInt(team_id),
                };

                allPolls.push(transformedPoll);
              } catch (err) {
                console.error(`Error fetching poll ${pollId}:`, err);
              }
            }
          } catch (err) {
            console.error(`Error fetching polls for topic ${topic.id}:`, err);
          }
        }

        setPolls(allPolls);
      } catch (error) {
        console.error('Error fetching team polls:', error);
        setPolls([]);
      } finally {
        setIsLoadingPolls(false);
      }
    };

    fetchPolls();
  }, [teamTopics, chainId]);

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
              {canCreatePoll && (
                <Link
                  href={`/team/${team_id}/polls/create`}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Create Poll
                </Link>
              )}
            </div>

            {isLoadingPolls || isLoadingTopics ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">Loading polls...</p>
              </div>
            ) : polls.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 mb-4">No polls yet for this team</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  {canCreatePoll
                    ? 'Create a poll to get team input on decisions'
                    : 'Team admins can create polls for members to vote on'}
                </p>
              </div>
            ) : (
              <TeamPollsList polls={polls} teamId={team_id} />
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
