'use client';

import { use } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useUserProfile, useUserExpertise } from '@/hooks/useContracts';
import { getExpertiseRank, getRankColor } from '@/lib/types';
import Link from 'next/link';
import { Footer } from '@/components/Footer';

interface PageProps {
  params: Promise<{ address: string }>;
}

export default function ProfilePage({ params }: PageProps) {
  const { address } = use(params);
  const { isConnected } = useAccount();
  const { isRegistered, profile, userTopicIds } = useUserProfile(address as `0x${string}`);

  if (!isConnected) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Profile Not Available</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Connect your wallet to view profiles
            </p>
            <ConnectButton />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (isRegistered === false) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">User Not Registered</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              This address has not registered on TrustMe yet.
            </p>
            <Link
              href="/dashboard"
              className="inline-block px-6 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded font-medium hover:bg-gray-700 dark:hover:bg-gray-300 transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 p-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold">Baseball Card</h1>
            <Link
              href="/dashboard"
              className="inline-block px-6 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded font-medium hover:bg-gray-700 dark:hover:bg-gray-300 transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>

          {/* Baseball Card */}
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-8 rounded-2xl shadow-2xl text-white mb-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left Side - User Info */}
              <div className="space-y-6">
                <div>
                  <div className="text-sm opacity-75 mb-1">Address</div>
                  <div className="font-mono text-lg">
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </div>
                </div>

                <div>
                  <div className="text-sm opacity-75 mb-1">Member Since</div>
                  <div className="text-2xl font-bold">
                    {profile?.registrationTime
                      ? new Date(Number(profile.registrationTime) * 1000).toLocaleDateString(
                          'en-US',
                          { month: 'short', year: 'numeric' }
                        )
                      : 'N/A'}
                  </div>
                </div>

                <div>
                  <div className="text-sm opacity-75 mb-1">Topics Engaged</div>
                  <div className="text-4xl font-bold">{profile?.totalTopicsEngaged || 0}</div>
                </div>
              </div>

              {/* Right Side - Stats */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4">Overall Stats</h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm opacity-75">Total Challenges</div>
                    <div className="text-2xl font-bold">-</div>
                    <div className="text-xs opacity-75">Coming soon</div>
                  </div>
                  <div>
                    <div className="text-sm opacity-75">Average Accuracy</div>
                    <div className="text-2xl font-bold">-</div>
                    <div className="text-xs opacity-75">Coming soon</div>
                  </div>
                  <div>
                    <div className="text-sm opacity-75">Polls Voted</div>
                    <div className="text-2xl font-bold">-</div>
                    <div className="text-xs opacity-75">Coming soon</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Expertise Breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6">Expertise Breakdown</h2>
            {!userTopicIds || userTopicIds.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400">
                No expertise data yet. Start by taking challenges!
              </p>
            ) : (
              <div className="space-y-4">
                {userTopicIds.map((topicId) => (
                  <TopicExpertise key={topicId} topicId={topicId} address={address as `0x${string}`} />
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Recent challenges and votes will appear here.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function TopicExpertise({ topicId, address }: { topicId: number; address: `0x${string}` }) {
  const { expertise, score, accuracy } = useUserExpertise(address, topicId);

  if (!expertise) return null;

  const accuracyPercentage = accuracy ? (accuracy / 100).toFixed(1) : '0.0';
  const rank = getExpertiseRank(score || 0);
  const rankColor = getRankColor(score || 0);

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
      <div className="flex-1">
        <div className="font-medium">Topic #{topicId}</div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {expertise.totalChallenges} challenges • {accuracyPercentage}% accuracy
        </div>
      </div>
      <div className="text-right">
        <div className="text-2xl font-bold">{score}</div>
        <div className={`text-sm font-medium ${rankColor}`}>{rank}</div>
      </div>
    </div>
  );
}
