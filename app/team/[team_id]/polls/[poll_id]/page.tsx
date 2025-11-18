'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { NetworkSwitcher } from '@/components/NetworkSwitcher';
import { Footer } from '@/components/Footer';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { TeamTabs } from '@/components/TeamTabs';
import { PollVoteCard } from '@/components/PollVoteCard';
import { PollResults } from '@/components/PollResults';
import { Poll, PollStatus } from '@/lib/types';
import {
  useTeamMember,
  useUserExpertise,
  useChainId,
} from '@/hooks/useContracts';
import { createPublicClient, http } from 'viem';
import { sepolia, hardhat } from 'viem/chains';
import { getContract } from '@/lib/contracts';

interface PollDetailPageProps {
  params: {
    team_id: string;
    poll_id: string;
  };
}

export default function PollDetailPage({ params }: PollDetailPageProps) {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const chainId = useChainId();
  const [pollData, setPollData] = useState<Poll | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  // Get team member data
  const { member: currentUserMemberData } = useTeamMember(params.team_id, address);
  const isMember = currentUserMemberData?.isActive && currentUserMemberData.role > 0;

  // Fetch poll data
  useEffect(() => {
    const fetchPollData = async () => {
      try {
        setIsLoading(true);

        const publicClient = createPublicClient({
          chain: chainId === 11155111 ? sepolia : hardhat,
          transport: http(),
        });

        const pollContract = getContract(chainId, 'Poll');
        const topicContract = getContract(chainId, 'TopicRegistry');
        const pollIdBigInt = BigInt(params.poll_id);

        // Fetch poll, options, and results
        const [poll, options, results] = await Promise.all([
          publicClient.readContract({
            address: pollContract.address,
            abi: pollContract.abi,
            functionName: 'getPoll',
            args: [pollIdBigInt],
          }),
          publicClient.readContract({
            address: pollContract.address,
            abi: pollContract.abi,
            functionName: 'getPollOptions',
            args: [pollIdBigInt],
          }),
          publicClient.readContract({
            address: pollContract.address,
            abi: pollContract.abi,
            functionName: 'getPollResults',
            args: [pollIdBigInt],
          }),
        ]);

        const pollInfo: any = poll;
        const pollOptions: any[] = options as any[];

        // Fetch topic name
        let topicName = 'Unknown Topic';
        try {
          // First try to get it as a team topic
          const teamTopic = await publicClient.readContract({
            address: topicContract.address,
            abi: topicContract.abi,
            functionName: 'getTeamTopic',
            args: [BigInt(params.team_id), pollInfo.topicId],
          }) as any;
          topicName = teamTopic.name;
        } catch {
          // Fall back to global topic
          try {
            const globalTopic = await publicClient.readContract({
              address: topicContract.address,
              abi: topicContract.abi,
              functionName: 'getTopic',
              args: [pollInfo.topicId],
            }) as any;
            topicName = globalTopic.name;
          } catch (err) {
            console.error('Error fetching topic:', err);
          }
        }

        // Fetch user's vote if connected
        let userVote;
        if (address) {
          try {
            const vote = await publicClient.readContract({
              address: pollContract.address,
              abi: pollContract.abi,
              functionName: 'getUserVote',
              args: [pollIdBigInt, address],
            }) as any;

            if (vote && vote.voter !== '0x0000000000000000000000000000000000000000') {
              userVote = {
                option: vote.selectedOption,
                weight: Number(vote.weight),
              };
            }
          } catch (err) {
            // User hasn't voted
          }
        }

        // Calculate percentages
        const totalVotes = pollOptions.reduce((sum, opt) => sum + Number(opt.voteCount), 0);
        const totalWeight = pollOptions.reduce((sum, opt) => sum + Number(opt.totalWeight), 0);

        const transformedPoll: Poll = {
          id: pollIdBigInt,
          question: pollInfo.question,
          topicId: pollInfo.topicId,
          topicName,
          creator: pollInfo.creator,
          createdAt: new Date(Number(pollInfo.createdAt) * 1000),
          endTime: new Date(Number(pollInfo.endTime) * 1000),
          status: pollInfo.status,
          options: pollOptions.map((opt) => ({
            id: opt.optionId,
            text: opt.optionText,
            votes: opt.voteCount,
            weight: Number(opt.totalWeight),
            percentage: totalVotes > 0 ? (opt.voteCount / totalVotes) * 100 : 0,
            weightedPercentage: totalWeight > 0 ? (Number(opt.totalWeight) / totalWeight) * 100 : 0,
          })),
          totalVoters: pollInfo.totalVoters,
          userVote,
          isActive: pollInfo.status === 0, // PollStatus.Active = 0
          teamId: BigInt(params.team_id),
        };

        setPollData(transformedPoll);
      } catch (error) {
        console.error('Error fetching poll:', error);
        setPollData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPollData();
  }, [params.poll_id, params.team_id, chainId, address, refetchTrigger]);

  // Fetch user's voting weight (expertise)
  const { expertise } = useUserExpertise(address, pollData?.topicId);
  const userWeight = expertise ? Number(expertise.score) : 0;

  const handleVote = () => {
    // Trigger a refetch of poll data
    setRefetchTrigger(prev => prev + 1);
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Poll Details</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Connect your wallet to view and vote on this poll
            </p>
            <ConnectButton />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <NetworkSwitcher />
        <Navigation address={address} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">Loading poll...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!pollData || !isMember) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col">
      <NetworkSwitcher />
      <Navigation address={address} />

      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Link
              href={`/team/${params.team_id}/polls`}
              className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
            >
              ← Back to Polls
            </Link>
          </div>

          <TeamTabs teamId={params.team_id} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Vote Card */}
            <div>
              <PollVoteCard poll={pollData} userWeight={userWeight} onVote={handleVote} />
            </div>

            {/* Results */}
            <div>
              <PollResults poll={pollData} />
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
