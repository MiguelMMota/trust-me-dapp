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

interface ChallengeDetailPageProps {
  params: {
    team_id: string;
    challenge_id: string;
  };
}

const mockMembers = [
  { address: '0x1234567890123456789012345678901234567890' as `0x${string}`, role: 'owner' as const, joinedAt: Date.now() },
];

export default function ChallengeDetailPage({ params }: ChallengeDetailPageProps) {
  const { address, isConnected } = useAccount();
  const [challenge] = useState<Challenge>({
    id: BigInt(params.challenge_id),
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
    teamId: BigInt(params.team_id),
  });

  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [hasAttempted, setHasAttempted] = useState(false);
  const [wasCorrect, setWasCorrect] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentUserMember = mockMembers.find(m => m.address.toLowerCase() === address?.toLowerCase());
  const isMember = currentUserMember !== undefined;

  const handleAttempt = async () => {
    if (selectedAnswer === null) return;

    setIsSubmitting(true);
    // TODO: Call smart contract
    await new Promise(resolve => setTimeout(resolve, 1000));

    const correct = challenge.options[selectedAnswer] === challenge.correctAnswer;
    setWasCorrect(correct);
    setHasAttempted(true);
    setIsSubmitting(false);
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Challenge</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">Connect your wallet</p>
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
            <p className="text-gray-600 dark:text-gray-400">Not a team member</p>
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
          <div className="mb-6">
            <Link href={`/team/${params.team_id}/challenges`} className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
              ← Back to Challenges
            </Link>
          </div>

          <TeamTabs teamId={params.team_id} />

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <span className={`inline-block px-2 py-1 rounded text-xs font-medium mb-2 ${getDifficultyColor(challenge.difficulty)}`}>
                  {getDifficultyLabel(challenge.difficulty)}
                </span>
                <h2 className="text-2xl font-bold mb-2">{challenge.question}</h2>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p>Topic: {challenge.topicName}</p>
                  <p>Success Rate: {challenge.successRate}% ({challenge.correctAttempts}/{challenge.totalAttempts} attempts)</p>
                </div>
              </div>
            </div>

            {hasAttempted ? (
              <div className={`mb-6 p-4 rounded-lg border ${wasCorrect ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'}`}>
                <p className={`font-medium ${wasCorrect ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'}`}>
                  {wasCorrect ? '✓ Correct!' : '✗ Incorrect'}
                </p>
                {!wasCorrect && (
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    The correct answer was: {challenge.correctAnswer}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-3 mb-6">
                {challenge.options.map((option, idx) => (
                  <label
                    key={idx}
                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedAnswer === idx
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="answer"
                      checked={selectedAnswer === idx}
                      onChange={() => setSelectedAnswer(idx)}
                      disabled={isSubmitting}
                      className="mr-3"
                    />
                    <span className="font-medium">{option}</span>
                  </label>
                ))}
              </div>
            )}

            {!hasAttempted && (
              <button
                onClick={handleAttempt}
                disabled={selectedAnswer === null || isSubmitting}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Answer'}
              </button>
            )}

            {hasAttempted && (
              <Link
                href={`/team/${params.team_id}/challenges`}
                className="block w-full px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium text-center transition-colors"
              >
                Back to Challenges
              </Link>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
