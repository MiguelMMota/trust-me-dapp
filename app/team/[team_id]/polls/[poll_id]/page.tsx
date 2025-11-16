'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { NetworkSwitcher } from '@/components/NetworkSwitcher';
import { Footer } from '@/components/Footer';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { TeamTabs } from '@/components/TeamTabs';
import { PollVoteCard } from '@/components/PollVoteCard';
import { PollResults } from '@/components/PollResults';
import { Poll, PollStatus } from '@/lib/types';

interface PollDetailPageProps {
  params: {
    team_id: string;
    poll_id: string;
  };
}

// Mock members
const mockMembers = [
  {
    address: '0x1234567890123456789012345678901234567890' as `0x${string}`,
    role: 'owner' as const,
    joinedAt: Date.now(),
  },
];

export default function PollDetailPage({ params }: PollDetailPageProps) {
  const { address, isConnected } = useAccount();

  // Mock poll data
  const [poll, setPoll] = useState<Poll>({
    id: BigInt(params.poll_id),
    question: 'Should we implement a new authentication system?',
    topicId: 2,
    topicName: 'Web Development',
    creator: '0x1234567890123456789012345678901234567890',
    createdAt: new Date(Date.now() - 86400000 * 5),
    endTime: new Date(Date.now() + 86400000 * 2),
    status: PollStatus.Active,
    options: [
      {
        id: 0,
        text: 'Yes, implement OAuth 2.0',
        votes: 12,
        weight: 1200,
        percentage: 40,
        weightedPercentage: 45,
      },
      {
        id: 1,
        text: 'Yes, implement JWT',
        votes: 10,
        weight: 1100,
        percentage: 33.3,
        weightedPercentage: 41,
      },
      {
        id: 2,
        text: 'No, keep current system',
        votes: 8,
        weight: 380,
        percentage: 26.7,
        weightedPercentage: 14,
      },
    ],
    totalVoters: 30,
    isActive: true,
    teamId: BigInt(params.team_id),
    // userVote: { option: 0, weight: 850 }, // Uncomment to test "already voted" state
  });

  const currentUserMember = mockMembers.find(m => m.address.toLowerCase() === address?.toLowerCase());
  const isMember = currentUserMember !== undefined;

  // Mock user weight (from reputation in topic)
  const userWeight = 850;

  const handleVote = (optionId: number) => {
    // TODO: Call smart contract to vote
    // Update poll state optimistically
    setPoll({
      ...poll,
      userVote: { option: optionId, weight: userWeight },
      totalVoters: poll.totalVoters + 1,
      options: poll.options.map((opt, idx) => {
        if (idx === optionId) {
          return {
            ...opt,
            votes: opt.votes + 1,
            weight: opt.weight + userWeight,
          };
        }
        return opt;
      }),
    });
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

  if (!isMember) {
    return (
      <div className="min-h-screen flex flex-col">
        <NetworkSwitcher />
        <Navigation address={address} />
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-md text-center">
            <h1 className="text-4xl font-bold mb-4">Access Denied</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              You are not a member of this team.
            </p>
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
              <PollVoteCard poll={poll} userWeight={userWeight} onVote={handleVote} />
            </div>

            {/* Results */}
            <div>
              <PollResults poll={poll} />
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
