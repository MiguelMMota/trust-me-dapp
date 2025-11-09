'use client';

import { use, useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import {
  useUserProfile,
  useUserExpertise,
  useUserChallengeHistory,
  useTopic,
  useChallenge,
  useChallengeAttempt,
  useTopics,
  useUserGivenRatings,
  useChainId
} from '@/hooks/useContracts';
import { getContract } from '@/lib/contracts';
import { getExpertiseRank, getRankColor, getDifficultyLabel, type DifficultyLevel } from '@/lib/types';
import Link from 'next/link';
import { Footer } from '@/components/Footer';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { createPublicClient, http } from 'viem';
import { sepolia, hardhat } from 'viem/chains';

interface PageProps {
  params: Promise<{ address: string }>;
}

export default function UserProfilePage({ params }: PageProps) {
  const { address } = use(params);
  const { address: connectedAddress, isConnected } = useAccount();
  const { isRegistered, profile, userTopicIds } = useUserProfile(address as `0x${string}`);
  const { challengeIds } = useUserChallengeHistory(address as `0x${string}`);
  const [activeTab, setActiveTab] = useState<'challenges' | 'polls' | 'feedback'>('challenges');

  if (!isConnected) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <nav className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
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
                {connectedAddress && (
                  <Link
                    href={`/user/${connectedAddress}`}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                  >
                    My Profile
                  </Link>
                )}
                <ConnectButton />
              </div>
            </div>
          </div>
        </nav>
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
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <nav className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
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
                {connectedAddress && (
                  <Link
                    href={`/user/${connectedAddress}`}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                  >
                    My Profile
                  </Link>
                )}
                <ConnectButton />
              </div>
            </div>
          </div>
        </nav>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">User Not Registered</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              This address has not registered on TrustMe yet.
            </p>
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Calculate total stats
  const totalChallenges = challengeIds?.length || 0;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <nav className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
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
              {connectedAddress && (
                <Link
                  href={`/user/${connectedAddress}`}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                >
                  My Profile
                </Link>
              )}
              <ConnectButton />
            </div>
          </div>
        </div>
      </nav>

      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Baseball Card */}
          <BaseballCard
            address={address as `0x${string}`}
            profile={profile}
            userTopicIds={userTopicIds || []}
          />

          {/* Basic Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6">User Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <StatCard
                label="Date Joined"
                value={profile?.registrationTime
                  ? new Date(Number(profile.registrationTime) * 1000).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })
                  : 'N/A'
                }
              />
              <StatCard
                label="Total Challenges Taken"
                value={totalChallenges.toString()}
              />
              <StatCard
                label="Topics Engaged"
                value={profile?.totalTopicsEngaged?.toString() || '0'}
              />
              <StatCard
                label="Questions Answered"
                value={totalChallenges.toString()}
                description="Total challenges completed"
              />
            </div>
          </div>

          {/* Activity Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
              <button
                onClick={() => setActiveTab('challenges')}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === 'challenges'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Challenges Taken
              </button>
              <button
                onClick={() => setActiveTab('polls')}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === 'polls'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Polls Voted
              </button>
              <button
                onClick={() => setActiveTab('feedback')}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === 'feedback'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Feedback
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'challenges' && (
              <ChallengesTab
                challengeIds={challengeIds || []}
                userAddress={address as `0x${string}`}
              />
            )}
            {activeTab === 'polls' && (
              <PollsTab userAddress={address as `0x${string}`} />
            )}
            {activeTab === 'feedback' && (
              <FeedbackTab userAddress={address as `0x${string}`} />
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function BaseballCard({
  address,
  profile,
  userTopicIds
}: {
  address: `0x${string}`;
  profile: any;
  userTopicIds: number[];
}) {
  const { rootTopicIds, topicCount } = useTopics();
  const [selectedTopicIds, setSelectedTopicIds] = useState<number[]>([]);

  // Update selected topics when root topics load
  useEffect(() => {
    if (rootTopicIds && rootTopicIds.length > 0 && selectedTopicIds.length === 0) {
      setSelectedTopicIds(rootTopicIds);
    }
  }, [rootTopicIds, selectedTopicIds.length]);

  return (
    <div className="bg-gradient-to-br from-slate-700 via-slate-600 to-slate-500 p-6 md:p-8 rounded-2xl shadow-2xl text-white mb-8">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Left Side - User Info */}
        <div className="space-y-6">
          <div>
            <div className="text-sm opacity-75 mb-1">Address</div>
            <div className="font-mono text-lg break-all">
              {address.slice(0, 10)}...{address.slice(-8)}
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

        {/* Right Side - Score Radar Chart */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Score Card</h3>
            <TopicSelector
              topicCount={topicCount || 0}
              rootTopicIds={rootTopicIds || []}
              selectedTopicIds={selectedTopicIds}
              onSelectionChange={setSelectedTopicIds}
            />
          </div>
          <TopicScoreRadar
            address={address}
            selectedTopicIds={selectedTopicIds}
          />
        </div>
      </div>
    </div>
  );
}

function TopicSelector({
  topicCount,
  rootTopicIds,
  selectedTopicIds,
  onSelectionChange
}: {
  topicCount: number;
  rootTopicIds: number[];
  selectedTopicIds: number[];
  onSelectionChange: (ids: number[]) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [topics, setTopics] = useState<Array<{ id: number; topic: any; childTopicIds: number[] }>>([]);
  const chainId = useChainId();
  const contract = getContract(chainId, 'TopicRegistry');

  // Fetch all topics when topicCount changes
  useEffect(() => {
    if (!topicCount || topicCount === 0) {
      setTopics([]);
      return;
    }

    const fetchTopics = async () => {
      try {
        const publicClient = createPublicClient({
          chain: chainId === 11155111 ? sepolia : hardhat,
          transport: http(),
        });

        const allTopicIds = Array.from({ length: topicCount }, (_, i) => i + 1);
        const topicsData = await Promise.all(
          allTopicIds.map(async (id) => {
            try {
              const [topic, childTopicIds] = await Promise.all([
                publicClient.readContract({
                  address: contract.address,
                  abi: contract.abi,
                  functionName: 'getTopic',
                  args: [id],
                }),
                publicClient.readContract({
                  address: contract.address,
                  abi: contract.abi,
                  functionName: 'getChildTopics',
                  args: [id],
                }),
              ]);

              return { id, topic, childTopicIds: childTopicIds as number[] };
            } catch (error) {
              console.error(`Error fetching topic ${id}:`, error);
              return { id, topic: null, childTopicIds: [] };
            }
          })
        );

        setTopics(topicsData);
      } catch (error) {
        console.error('Error fetching topics:', error);
        setTopics([]);
      }
    };

    fetchTopics();
  }, [topicCount, chainId, contract.address, contract.abi]);

  // Build hierarchical structure sorted by topic ID
  const buildHierarchy = (parentId: number, depth: number = 0): { id: number; name: string; depth: number; parentId: number }[] => {
    const children = topics
      .filter(t => t.topic?.parentId === parentId)
      .sort((a, b) => a.id - b.id);

    const result: { id: number; name: string; depth: number; parentId: number }[] = [];
    for (const child of children) {
      result.push({
        id: child.id,
        name: child.topic?.name || `Topic ${child.id}`,
        depth,
        parentId: child.topic?.parentId || 0
      });
      result.push(...buildHierarchy(child.id, depth + 1));
    }
    return result;
  };

  const hierarchicalTopics = buildHierarchy(0);

  // Debug: log what we have
  useEffect(() => {
    console.log('TopicSelector Debug:');
    console.log('- topicCount:', topicCount);
    console.log('- rootTopicIds:', rootTopicIds);
    console.log('- selectedTopicIds:', selectedTopicIds);
    console.log('- fetched topics:', topics);
    console.log('- hierarchicalTopics:', hierarchicalTopics);
  }, [topicCount, rootTopicIds, selectedTopicIds, topics, hierarchicalTopics]);

  const toggleTopic = (topicId: number) => {
    if (selectedTopicIds.includes(topicId)) {
      onSelectionChange(selectedTopicIds.filter(id => id !== topicId));
    } else {
      // Insert in hierarchical order
      const newSelected = [...selectedTopicIds, topicId];
      const ordered = hierarchicalTopics
        .filter(t => newSelected.includes(t.id))
        .map(t => t.id);
      onSelectionChange(ordered);
    }
  };

  const handleAll = () => {
    onSelectionChange(hierarchicalTopics.map(t => t.id));
  };

  const handleClear = () => {
    onSelectionChange([]);
  };

  const handleReset = () => {
    onSelectionChange(rootTopicIds);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
      >
        Topics ({selectedTopicIds.length}/{hierarchicalTopics.length})
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-20 flex flex-col">
            {/* Control Buttons */}
            <div className="flex gap-1 p-2 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <button
                onClick={handleAll}
                className="px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              >
                All
              </button>
              <button
                onClick={handleClear}
                className="px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              >
                Clear
              </button>
              <button
                onClick={handleReset}
                className="px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              >
                Reset
              </button>
            </div>

            {/* Topic List */}
            <div className="overflow-y-auto p-2 max-h-80">
              {hierarchicalTopics.length > 0 ? (
                hierarchicalTopics.map(({ id, name, depth }) => (
                  <label
                    key={id}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer"
                    style={{ paddingLeft: `${12 + depth * 20}px` }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedTopicIds.includes(id)}
                      onChange={() => toggleTopic(id)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-900 dark:text-gray-100">
                      {name}
                    </span>
                  </label>
                ))
              ) : (
                <div className="px-3 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                  {topicCount === 0 ? 'No topics available' : 'Loading topics...'}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function TopicScoreRadar({
  address,
  selectedTopicIds
}: {
  address: `0x${string}`;
  selectedTopicIds: number[];
}) {
  if (selectedTopicIds.length === 0) {
    return (
      <p className="text-sm opacity-75">
        No topics selected.
      </p>
    );
  }

  return (
    <div className="flex gap-6 items-center">
      {/* Radar Chart */}
      <TopicScoreRadarChart address={address} selectedTopicIds={selectedTopicIds} />

      {/* Topic Scores List */}
      <div className="flex-shrink-0 space-y-2">
        {selectedTopicIds.map((topicId) => (
          <TopicScoreItem key={topicId} topicId={topicId} address={address} />
        ))}
      </div>
    </div>
  );
}

function TopicScoreRadarChart({
  address,
  selectedTopicIds
}: {
  address: `0x${string}`;
  selectedTopicIds: number[];
}) {
  return (
    <div className="h-64 flex-1 min-w-0">
      {selectedTopicIds.length > 0 ? (
        selectedTopicIds.length <= 10 ? (
          // For reasonable number of topics, render individual data fetchers
          <TopicScoreRadarChartWithData
            address={address}
            selectedTopicIds={selectedTopicIds}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm opacity-75">Too many topics selected for radar view</p>
          </div>
        )
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-sm opacity-75">No topics selected</p>
        </div>
      )}
    </div>
  );
}

// Helper component to render radar chart - fetches data using direct contract calls
function TopicScoreRadarChartWithData({
  address,
  selectedTopicIds
}: {
  address: `0x${string}`;
  selectedTopicIds: number[];
}) {
  const [topicData, setTopicData] = useState<Array<{ topicId: number; topic: string; score: number }>>([]);
  const chainId = useChainId();
  const topicContract = getContract(chainId, 'TopicRegistry');
  const userContract = getContract(chainId, 'User');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const publicClient = createPublicClient({
          chain: chainId === 11155111 ? sepolia : hardhat,
          transport: http(),
        });

        const data = await Promise.all(
          selectedTopicIds.slice(0, 10).map(async (topicId) => {
            try {
              const [topicResult, scoreResult] = await Promise.all([
                publicClient.readContract({
                  address: topicContract.address,
                  abi: topicContract.abi,
                  functionName: 'getTopic',
                  args: [topicId],
                }),
                publicClient.readContract({
                  address: userContract.address,
                  abi: userContract.abi,
                  functionName: 'getUserTopicScore',
                  args: [address, topicId],
                }),
              ]);

              const topic = topicResult as any;
              const score = scoreResult as bigint;

              return {
                topicId,
                topic: topic?.name || `Topic ${topicId}`,
                score: Number(score || 0n) / 10, // Normalize from 0-1000 to 0-100
              };
            } catch (error) {
              console.error(`Error fetching data for topic ${topicId}:`, error);
              return {
                topicId,
                topic: `Topic ${topicId}`,
                score: 0,
              };
            }
          })
        );

        setTopicData(data);
      } catch (error) {
        console.error('Error fetching radar chart data:', error);
      }
    };

    fetchData();
  }, [selectedTopicIds, address, chainId, topicContract.address, topicContract.abi, userContract.address, userContract.abi]);

  const maxScore = topicData.length > 0 ? Math.max(...topicData.map(t => t.score), 100) : 100;

  if (topicData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm opacity-75">Loading...</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart data={topicData}>
        <PolarGrid stroke="#ffffff40" />
        <PolarAngleAxis
          dataKey="topic"
          tick={{ fill: '#ffffff', fontSize: 12 }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, maxScore]}
          tick={{ fill: '#ffffff80', fontSize: 10 }}
        />
        <Radar
          name="Score"
          dataKey="score"
          stroke="#60a5fa"
          fill="#60a5fa"
          fillOpacity={0.6}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}

function TopicScoreItem({
  topicId,
  address
}: {
  topicId: number;
  address: `0x${string}`;
}) {
  const { topic } = useTopic(topicId);
  const { score } = useUserExpertise(address, topicId);

  // Normalize score from 0-1000 to 0-100
  const normalizedScore = (score || 0) / 10;
  const topicName = topic?.name || `Topic ${topicId}`;

  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="opacity-90 min-w-[140px] text-right">{topicName}</span>
      <span className="font-bold min-w-[40px]">{normalizedScore.toFixed(0)}</span>
    </div>
  );
}

function TopicExpertiseBadge({
  topicId,
  score,
  address
}: {
  topicId: number;
  score: number;
  address: `0x${string}`;
}) {
  const { topic } = useTopic(topicId);
  const { expertise, accuracy } = useUserExpertise(address, topicId);
  const rank = getExpertiseRank(score);
  const rankColor = getRankColor(score);
  const accuracyPercentage = accuracy ? (accuracy / 100).toFixed(1) : '0.0';

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
      <div className="flex justify-between items-start mb-2">
        <div className="font-medium">{topic?.name || `Topic #${topicId}`}</div>
        <div className={`text-sm font-medium ${rankColor}`}>{rank}</div>
      </div>
      <div className="flex justify-between items-center text-sm opacity-90">
        <div>Score: {score}</div>
        <div>{accuracyPercentage}% accuracy</div>
      </div>
      <div className="text-xs opacity-75 mt-1">
        {expertise?.totalChallenges || 0} challenges completed
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  description
}: {
  label: string;
  value: string;
  description?: string;
}) {
  return (
    <div>
      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{label}</div>
      <div className="text-2xl font-bold mb-1">{value}</div>
      {description && (
        <div className="text-xs text-gray-500 dark:text-gray-500">{description}</div>
      )}
    </div>
  );
}

function ChallengesTab({
  challengeIds,
  userAddress
}: {
  challengeIds: bigint[];
  userAddress: `0x${string}`;
}) {
  if (!challengeIds || challengeIds.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">
          No challenges taken yet.
        </p>
      </div>
    );
  }

  // Show most recent challenges (last 10)
  const recentChallenges = challengeIds.slice(-10).reverse();

  return (
    <div className="space-y-4">
      {recentChallenges.map((challengeId) => (
        <ChallengeActivityItem
          key={challengeId.toString()}
          challengeId={challengeId}
          userAddress={userAddress}
        />
      ))}
    </div>
  );
}

function ChallengeActivityItem({
  challengeId,
  userAddress
}: {
  challengeId: bigint;
  userAddress: `0x${string}`;
}) {
  const { challenge } = useChallenge(challengeId);
  const { attempt } = useChallengeAttempt(challengeId, userAddress);
  const { topic } = useTopic(challenge?.topicId || 0);

  if (!challenge || !attempt) {
    return (
      <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 animate-pulse">
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
    );
  }

  const isCorrect = attempt.isCorrect;
  const attemptDate = new Date(Number(attempt.attemptedAt) * 1000);
  const difficultyLabel = getDifficultyLabel(challenge.difficulty as DifficultyLevel);

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="font-medium">
              Challenge #{challengeId.toString()}
            </div>
            <span className={`inline-block px-2 py-0.5 text-xs rounded ${
              isCorrect
                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
            }`}>
              {isCorrect ? '✓ Correct' : '✗ Incorrect'}
            </span>
            <span className="inline-block px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded">
              {difficultyLabel}
            </span>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Topic: {topic?.name || `#${challenge.topicId}`}
          </div>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-500">
          {attemptDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })}
          <br />
          {attemptDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>
      <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
        <div>
          Success Rate: {challenge.totalAttempts > 0
            ? Math.round((challenge.correctAttempts / challenge.totalAttempts) * 100)
            : 0}%
        </div>
        <div>
          Total Attempts: {challenge.totalAttempts}
        </div>
      </div>
    </div>
  );
}

function PollsTab({ userAddress: _userAddress }: { userAddress: `0x${string}` }) {
  return (
    <div className="text-center py-12">
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Poll voting history coming soon.
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-500">
        This will show all polls you've participated in with your votes and the final results.
      </p>
    </div>
  );
}

function FeedbackTab({ userAddress }: { userAddress: `0x${string}` }) {
  const { ratings, isLoading } = useUserGivenRatings(userAddress);

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!ratings || ratings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">
          No feedback given yet.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-bold mb-4">Feedback Given</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300">
                Recipient
              </th>
              <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300">
                Topic
              </th>
              <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300">
                Score
              </th>
              <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300">
                Time
              </th>
            </tr>
          </thead>
          <tbody>
            {ratings.map((rating, index) => (
              <FeedbackRow key={`${rating.ratee}-${rating.topicId}-${index}`} rating={rating} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FeedbackRow({ rating }: { rating: any }) {
  const { topic } = useTopic(rating.topicId);
  const ratingDate = new Date(Number(rating.timestamp) * 1000);

  return (
    <tr className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
      <td className="py-3 px-4">
        <Link
          href={`/user/${rating.ratee}`}
          className="font-mono text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          {rating.ratee.slice(0, 8)}...{rating.ratee.slice(-6)}
        </Link>
      </td>
      <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
        {topic?.name || `Topic #${rating.topicId}`}
      </td>
      <td className="py-3 px-4">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
          {rating.score} / 1000
        </span>
      </td>
      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
        {ratingDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })}
        <br />
        <span className="text-xs">
          {ratingDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
      </td>
    </tr>
  );
}
