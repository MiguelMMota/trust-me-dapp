'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { NetworkSwitcher } from '@/components/NetworkSwitcher';
import { Footer } from '@/components/Footer';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { TeamTabs } from '@/components/TeamTabs';
import { Challenge, DifficultyLevel, ChallengeStatus, getDifficultyLabel, getDifficultyColor } from '@/lib/types';

interface TeamChallengesPageProps {
  params: {
    team_id: string;
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

// Mock challenges
const mockChallenges: Challenge[] = [
  {
    id: BigInt(1),
    question: 'What is the gas limit for a single Ethereum transaction?',
    options: ['21000', '100000', '8000000', 'Unlimited'],
    correctAnswer: '21000',
    topicId: 3,
    topicName: 'Blockchain',
    difficulty: DifficultyLevel.Medium,
    status: ChallengeStatus.Active,
    creator: '0x1234567890123456789012345678901234567890',
    createdAt: new Date(Date.now() - 86400000 * 5),
    totalAttempts: 25,
    correctAttempts: 18,
    successRate: 72,
    teamId: BigInt(1),
  },
  {
    id: BigInt(2),
    question: 'Which pattern prevents reentrancy attacks in Solidity?',
    options: ['Checks-Effects-Interactions', 'Factory Pattern', 'Singleton Pattern', 'Observer Pattern'],
    correctAnswer: 'Checks-Effects-Interactions',
    topicId: 100,
    topicName: 'Smart Contract Security',
    difficulty: DifficultyLevel.Hard,
    status: ChallengeStatus.Active,
    creator: '0x1234567890123456789012345678901234567890',
    createdAt: new Date(Date.now() - 86400000 * 3),
    totalAttempts: 15,
    correctAttempts: 9,
    successRate: 60,
    teamId: BigInt(1),
  },
];

export default function TeamChallengesPage({ params }: TeamChallengesPageProps) {
  const { address, isConnected } = useAccount();
  const [challenges] = useState<Challenge[]>(mockChallenges);
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyLevel | 'all'>('all');

  const currentUserMember = mockMembers.find(m => m.address.toLowerCase() === address?.toLowerCase());
  const isMember = currentUserMember !== undefined;

  const filteredChallenges = challenges.filter(c => {
    if (difficultyFilter !== 'all' && c.difficulty !== difficultyFilter) return false;
    return true;
  });

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

  if (!isMember) {
    return (
      <div className="min-h-screen flex flex-col">
        <NetworkSwitcher />
        <Navigation address={address} />
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-md text-center">
            <h1 className="text-4xl font-bold mb-4">Access Denied</h1>
            <p className="text-gray-600 dark:text-gray-400">
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
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-4xl font-bold mb-2">Team Challenges</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Test your knowledge and build expertise
            </p>
          </div>

          <TeamTabs teamId={params.team_id} />

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Challenges</h2>
              <Link
                href={`/team/${params.team_id}/challenges/create`}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Create Challenge
              </Link>
            </div>

            {/* Filter */}
            <div className="mb-4">
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-sm"
              >
                <option value="all">All Difficulties</option>
                <option value={DifficultyLevel.Easy}>Easy</option>
                <option value={DifficultyLevel.Medium}>Medium</option>
                <option value={DifficultyLevel.Hard}>Hard</option>
                <option value={DifficultyLevel.Expert}>Expert</option>
              </select>
            </div>

            {/* Challenges Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredChallenges.map((challenge) => (
                <Link
                  key={challenge.id.toString()}
                  href={`/team/${params.team_id}/challenges/${challenge.id.toString()}`}
                  className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                      {getDifficultyLabel(challenge.difficulty)}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {challenge.totalAttempts} attempts
                    </span>
                  </div>
                  <h3 className="font-medium mb-2 line-clamp-2">{challenge.question}</h3>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p className="mb-1">Topic: {challenge.topicName}</p>
                    <p>Success Rate: {challenge.successRate}%</p>
                  </div>
                </Link>
              ))}
            </div>

            {filteredChallenges.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No challenges found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
