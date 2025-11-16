'use client';

import { use, useState } from 'react';
import { useAccount } from 'wagmi';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { NetworkSwitcher } from '@/components/NetworkSwitcher';
import { Footer } from '@/components/Footer';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { TeamTabs } from '@/components/TeamTabs';
import { TeamPollsList } from '@/components/TeamPollsList';
import { Poll, PollStatus } from '@/lib/types';

interface TeamPollsPageProps {
  params: {
    team_id: string;
  };
}

// Mock team members (for access control)
const mockMembers = [
  {
    address: '0x1234567890123456789012345678901234567890' as `0x${string}`,
    role: 'owner' as const,
    joinedAt: Date.now() - 86400000 * 30,
  },
];

// Mock polls data
const mockPolls: Poll[] = [
  {
    id: BigInt(1),
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
    teamId: BigInt(1),
  },
  {
    id: BigInt(2),
    question: 'Which smart contract framework should we use for the next project?',
    topicId: 3,
    topicName: 'Blockchain',
    creator: '0x1234567890123456789012345678901234567890',
    createdAt: new Date(Date.now() - 86400000 * 10),
    endTime: new Date(Date.now() + 86400000 * 5),
    status: PollStatus.Active,
    options: [
      {
        id: 0,
        text: 'Hardhat',
        votes: 15,
        weight: 1650,
        percentage: 50,
        weightedPercentage: 55,
      },
      {
        id: 1,
        text: 'Foundry',
        votes: 12,
        weight: 1200,
        percentage: 40,
        weightedPercentage: 40,
      },
      {
        id: 2,
        text: 'Truffle',
        votes: 3,
        weight: 150,
        percentage: 10,
        weightedPercentage: 5,
      },
    ],
    totalVoters: 30,
    isActive: true,
    teamId: BigInt(1),
  },
  {
    id: BigInt(3),
    question: 'What should be our deployment strategy for the frontend?',
    topicId: 2,
    topicName: 'Web Development',
    creator: '0x1234567890123456789012345678901234567890',
    createdAt: new Date(Date.now() - 86400000 * 15),
    endTime: new Date(Date.now() - 86400000 * 1),
    status: PollStatus.Closed,
    options: [
      {
        id: 0,
        text: 'Vercel',
        votes: 18,
        weight: 1980,
        percentage: 60,
        weightedPercentage: 66,
      },
      {
        id: 1,
        text: 'Netlify',
        votes: 8,
        weight: 800,
        percentage: 26.7,
        weightedPercentage: 26.7,
      },
      {
        id: 2,
        text: 'Self-hosted',
        votes: 4,
        weight: 220,
        percentage: 13.3,
        weightedPercentage: 7.3,
      },
    ],
    totalVoters: 30,
    isActive: false,
    teamId: BigInt(1),
  },
];

export default function TeamPollsPage({ params }: TeamPollsPageProps) {
  const { team_id } = use(params);
  const { address, isConnected } = useAccount();
  const [polls] = useState<Poll[]>(mockPolls);

  const currentUserMember = mockMembers.find(m => m.address.toLowerCase() === address?.toLowerCase());
  const isMember = currentUserMember !== undefined;

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

            <TeamPollsList polls={polls} teamId={team_id} />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
