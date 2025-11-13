'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import TopicBrowser from '@/components/TopicBrowser';
import { useUserProfile, useRegisterUser } from '@/hooks/useContracts';
import Link from 'next/link';
import { NetworkSwitcher } from '@/components/NetworkSwitcher';
import { ContractErrorBoundary } from '@/components/ContractErrorBoundary';
import { Footer } from '@/components/Footer';

export default function Dashboard() {
  const { address, isConnected } = useAccount();
  const { registerUser, isConfirming } = useRegisterUser();
  const [selectedTopicId, setSelectedTopicId] = useState<number | undefined>();

  if (!isConnected) {
    return (
      <div className="min-h-screen flex flex-col">
        <nav className="border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="text-xl font-mono font-bold">TrustMe</Link>
              <div className="flex items-center gap-4">
                <Link
                  href="/info"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                >
                  Info
                </Link>
                <Link
                  href="/leaderboard"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                >
                  Leaderboard
                </Link>
                <ConnectButton />
              </div>
            </div>
          </div>
        </nav>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">TrustMe Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Connect your wallet to access the dashboard
            </p>
            <ConnectButton />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <ContractErrorBoundary>
      <NetworkSwitcher />
      <DashboardContent
        address={address}
        selectedTopicId={selectedTopicId}
        setSelectedTopicId={setSelectedTopicId}
        registerUser={registerUser}
        isConfirming={isConfirming}
      />
    </ContractErrorBoundary>
  );
}

function DashboardContent({
  address,
  selectedTopicId,
  setSelectedTopicId,
  registerUser,
  isConfirming
}: {
  address: `0x${string}` | undefined;
  selectedTopicId: number | undefined;
  setSelectedTopicId: (id: number | undefined) => void;
  registerUser: () => void;
  isConfirming: boolean;
}) {
  const { isRegistered, profile } = useUserProfile(address);

  if (isRegistered === false) {
    return (
      <div className="min-h-screen flex flex-col">
        <nav className="border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="text-xl font-mono font-bold">TrustMe</Link>
              <div className="flex items-center gap-4">
                <Link
                  href="/info"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                >
                  Info
                </Link>
                {address && (
                  <Link
                    href={`/user/${address}`}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                  >
                    My Profile
                  </Link>
                )}
                <Link
                  href="/leaderboard"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                >
                  Leaderboard
                </Link>
                <ConnectButton />
              </div>
            </div>
          </div>
        </nav>
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-md text-center">
            <h1 className="text-4xl font-bold mb-4">Welcome to TrustMe</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Register to start building your expertise and participating in weighted voting.
            </p>
            <button
              onClick={() => registerUser()}
              disabled={isConfirming}
              className="inline-block px-6 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded font-medium hover:bg-gray-700 dark:hover:bg-gray-300 disabled:opacity-50 transition-colors"
            >
              {isConfirming ? 'Registering...' : 'Register Now'}
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-xl font-mono font-bold">TrustMe</Link>
            <div className="flex items-center gap-4">
              <Link
                href="/info"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              >
                Info
              </Link>
              {address && (
                <Link
                  href={`/user/${address}`}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                >
                  My Profile
                </Link>
              )}
              <Link
                href="/leaderboard"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              >
                Leaderboard
              </Link>
              <ConnectButton />
            </div>
          </div>
        </div>
      </nav>
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold">Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Welcome back! Build your expertise and vote on important topics.
              </p>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Topics Engaged
              </h3>
              <p className="text-3xl font-bold mt-2">
                {profile?.totalTopicsEngaged || 0}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Member Since
              </h3>
              <p className="text-3xl font-bold mt-2">
                {profile?.registrationTime
                  ? new Date(Number(profile.registrationTime) * 1000).toLocaleDateString()
                  : 'N/A'}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Challenges
              </h3>
              <p className="text-3xl font-bold mt-2">-</p>
              <p className="text-xs text-gray-500 mt-1">Coming soon</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Polls Voted
              </h3>
              <p className="text-3xl font-bold mt-2">-</p>
              <p className="text-xs text-gray-500 mt-1">Coming soon</p>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Navigation */}
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
                <div className="space-y-2">
                  <Link
                    href="/challenges"
                    className="block w-full text-left px-4 py-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                  >
                    <div className="font-medium">Take Challenges</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Build expertise by answering questions
                    </div>
                  </Link>

                  <Link
                    href="/polls"
                    className="block w-full text-left px-4 py-3 rounded-lg bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                  >
                    <div className="font-medium">Vote on Polls</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Your vote weight matters!
                    </div>
                  </Link>

                  <Link
                    href={`/user/${address}`}
                    className="block w-full text-left px-4 py-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                  >
                    <div className="font-medium">View Profile</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      See your baseball card & activity
                    </div>
                  </Link>

                  <Link
                    href="/challenges/create"
                    className="block w-full text-left px-4 py-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
                  >
                    <div className="font-medium">Create Challenge</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Test others' knowledge
                    </div>
                  </Link>

                  <Link
                    href="/polls/create"
                    className="block w-full text-left px-4 py-3 rounded-lg bg-pink-50 dark:bg-pink-900/20 hover:bg-pink-100 dark:hover:bg-pink-900/30 transition-colors"
                  >
                    <div className="font-medium">Create Poll</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Start a weighted vote
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            {/* Middle & Right Columns - Topic Browser and Details */}
            <div className="lg:col-span-2 space-y-4">
              <TopicBrowser
                selectedTopicId={selectedTopicId}
                onSelectTopic={(topicId, topic) => {
                  setSelectedTopicId(topicId);
                }}
              />

              {selectedTopicId && (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h2 className="text-xl font-bold mb-4">Topic Details</h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Topic ID: {selectedTopicId}
                  </p>
                  <div className="mt-4 flex gap-2">
                    <Link
                      href={`/challenges?topic=${selectedTopicId}`}
                      className="inline-block px-6 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded font-medium hover:bg-gray-700 dark:hover:bg-gray-300 transition-colors"
                    >
                      View Challenges
                    </Link>
                    <Link
                      href={`/polls?topic=${selectedTopicId}`}
                      className="inline-block px-6 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded font-medium hover:bg-gray-700 dark:hover:bg-gray-300 transition-colors"
                    >
                      View Polls
                    </Link>
                  </div>
                </div>
              )}

              {/* Recent Activity Placeholder */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Your recent challenges and votes will appear here.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
