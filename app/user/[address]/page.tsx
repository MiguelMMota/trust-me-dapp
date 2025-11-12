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
  useUserReceivedRatings,
  useChainId,
  useRateUser,
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

const MAX_TOPICS_SELECTED = 10;

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

          {/* Give Feedback Section - Only show if wallet is connected and not viewing own profile */}
          {isConnected && connectedAddress && connectedAddress.toLowerCase() !== address.toLowerCase() && (
            <GiveFeedbackSection userAddress={address as `0x${string}`} />
          )}

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
  const [hasInitialized, setHasInitialized] = useState(false);

  // Update selected topics when root topics load (only once on initial load)
  useEffect(() => {
    if (rootTopicIds && rootTopicIds.length > 0 && !hasInitialized) {
      setSelectedTopicIds(rootTopicIds);
      setHasInitialized(true);
    }
  }, [rootTopicIds, hasInitialized]);

  // TODO: remove this log
  console.log(`Username: ${profile?.name}`);

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

          {profile?.name && (
            <div>
              <div className="text-sm opacity-75 mb-1">Name</div>
              <div className="text-xl font-bold">
                {profile.name}
              </div>
            </div>
          )}

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
        selectedTopicIds.length <= MAX_TOPICS_SELECTED ? (
          // For reasonable number of topics, render individual data fetchers
          <TopicScoreRadarChartWithData
            address={address}
            selectedTopicIds={selectedTopicIds}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm opacity-75">Too many topics selected for radar view. Select at most {MAX_TOPICS_SELECTED} topics</p>
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
                  functionName: 'getUserScore',
                  args: [address, topicId],
                }),
              ]);

              const topic = topicResult as any;
              const score = scoreResult as bigint;

              return {
                topicId,
                topic: topic?.name || `Topic ${topicId}`,
                score: Number(score || BigInt(0)) / 10, // Normalize from 0-1000 to 0-100
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

// Helper function to get color based on score with gradient
function getScoreColor(score: number): string {
  if (score <= 30) {
    // Red gradient: bright red at 0, dull/dark red at 30
    const ratio = score / 30; // 0 at score=0, 1 at score=30
    const r = Math.round(255 - (255 - 139) * ratio); // 255 -> 139
    const g = Math.round(0 + (0) * ratio); // 0 -> 0
    const b = Math.round(0 + (0) * ratio); // 0 -> 0
    return `rgb(${r}, ${g}, ${b})`;
  } else if (score >= 70) {
    // Green gradient: dull/dark green at 70, bright green at 100
    const ratio = (score - 70) / 30; // 0 at score=70, 1 at score=100
    const r = Math.round(0 + (0) * ratio); // 0 -> 0
    const g = Math.round(100 + (255 - 100) * ratio); // 100 -> 255
    const b = Math.round(0 + (0) * ratio); // 0 -> 0
    return `rgb(${r}, ${g}, ${b})`;
  }
  // Default color (inherit from parent) for scores between 31-69
  return 'inherit';
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
  const scoreColor = getScoreColor(normalizedScore);

  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="opacity-90 min-w-[140px] text-right">{topicName}</span>
      <span className="font-bold min-w-[40px]" style={{ color: scoreColor }}>
        {normalizedScore.toFixed(0)}
      </span>
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
  const [feedbackTab, setFeedbackTab] = useState<'given' | 'received'>('given');

  return (
    <div>
      {/* Sub-tabs for Feedback Given and Feedback Received */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        <button
          onClick={() => setFeedbackTab('given')}
          className={`px-4 py-2 font-medium transition-colors ${
            feedbackTab === 'given'
              ? 'border-b-2 border-green-600 text-green-600'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          Feedback Given
        </button>
        <button
          onClick={() => setFeedbackTab('received')}
          className={`px-4 py-2 font-medium transition-colors ${
            feedbackTab === 'received'
              ? 'border-b-2 border-green-600 text-green-600'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          Feedback Received
        </button>
      </div>

      {/* Sub-tab Content */}
      {feedbackTab === 'given' && (
        <FeedbackGivenContent userAddress={userAddress} />
      )}
      {feedbackTab === 'received' && (
        <FeedbackReceivedContent userAddress={userAddress} />
      )}
    </div>
  );
}

function FeedbackGivenContent({ userAddress }: { userAddress: `0x${string}` }) {
  const { ratings, isLoading } = useUserGivenRatings(userAddress);
  const [sortColumn, setSortColumn] = useState<'recipient' | 'topic' | 'score' | 'time'>('time');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filters, setFilters] = useState({
    recipient: '',
    topicId: 0, // 0 means all topics
    scoreOperator: 'all' as 'all' | '>=' | '<=' | '=' | 'between',
    scoreValue1: '',
    scoreValue2: '',
    timeMode: 'all' as 'all' | 'before' | 'after' | 'between',
    timeValue1: '',
    timeValue2: ''
  });
  const [topicMap, setTopicMap] = useState<Record<number, string>>({});
  const [profileMap, setProfileMap] = useState<Record<string, string>>({});
  const chainId = useChainId();
  const topicContract = getContract(chainId, 'TopicRegistry');
  const userContract = getContract(chainId, 'User');

  // Fetch all topics and profiles for filtering/sorting
  useEffect(() => {
    if (!ratings || ratings.length === 0) return;

    const fetchData = async () => {
      try {
        const publicClient = createPublicClient({
          chain: chainId === 11155111 ? sepolia : hardhat,
          transport: http(),
        });

        const uniqueTopicIds = [...new Set(ratings.map(r => r.topicId))];
        const uniqueAddresses = [...new Set(ratings.map(r => r.ratee))];

        const topics = await Promise.all(
          uniqueTopicIds.map(async (topicId) => {
            try {
              const topic = await publicClient.readContract({
                address: topicContract.address,
                abi: topicContract.abi,
                functionName: 'getTopic',
                args: [topicId],
              });
              return { topicId, name: (topic as any)?.name || `Topic #${topicId}` };
            } catch {
              return { topicId, name: `Topic #${topicId}` };
            }
          })
        );

        const profiles = await Promise.all(
          uniqueAddresses.map(async (address) => {
            try {
              const profile = await publicClient.readContract({
                address: userContract.address,
                abi: userContract.abi,
                functionName: 'getUserProfile',
                args: [address],
              });
              return { address, name: (profile as any)?.name || 'Anonymous' };
            } catch {
              return { address, name: 'Anonymous' };
            }
          })
        );

        setTopicMap(Object.fromEntries(topics.map(t => [t.topicId, t.name])));
        setProfileMap(Object.fromEntries(profiles.map(p => [p.address, p.name])));
      } catch (error) {
        console.error('Error fetching data for filtering:', error);
      }
    };

    fetchData();
  }, [ratings, chainId, topicContract.address, topicContract.abi, userContract.address, userContract.abi]);

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

  const handleSort = (column: 'recipient' | 'topic' | 'score' | 'time') => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Filter and sort ratings
  const processedRatings = ratings
    .filter(rating => {
      // Recipient filter
      const recipientName = profileMap[rating.ratee] || '';
      const recipientMatch = !filters.recipient ||
        rating.ratee.toLowerCase().includes(filters.recipient.toLowerCase()) ||
        recipientName.toLowerCase().includes(filters.recipient.toLowerCase());

      // Topic filter (dropdown)
      const topicMatch = filters.topicId === 0 || rating.topicId === filters.topicId;

      // Score filter (numerical operators)
      let scoreMatch = true;
      if (filters.scoreOperator !== 'all' && filters.scoreValue1) {
        const scorePercentage = rating.score / 10;
        const value1 = parseFloat(filters.scoreValue1);

        switch (filters.scoreOperator) {
          case '>=':
            scoreMatch = scorePercentage >= value1;
            break;
          case '<=':
            scoreMatch = scorePercentage <= value1;
            break;
          case '=':
            scoreMatch = Math.abs(scorePercentage - value1) < 0.1;
            break;
          case 'between':
            if (filters.scoreValue2) {
              const value2 = parseFloat(filters.scoreValue2);
              scoreMatch = scorePercentage >= value1 && scorePercentage <= value2;
            }
            break;
        }
      }

      // Time filter (date range)
      let timeMatch = true;
      if (filters.timeMode !== 'all') {
        const ratingDate = new Date(Number(rating.timestamp) * 1000);

        if (filters.timeValue1) {
          const date1 = new Date(filters.timeValue1);

          switch (filters.timeMode) {
            case 'before':
              timeMatch = ratingDate <= date1;
              break;
            case 'after':
              timeMatch = ratingDate >= date1;
              break;
            case 'between':
              if (filters.timeValue2) {
                const date2 = new Date(filters.timeValue2);
                timeMatch = ratingDate >= date1 && ratingDate <= date2;
              }
              break;
          }
        }
      }

      return recipientMatch && topicMatch && scoreMatch && timeMatch;
    })
    .sort((a, b) => {
      let comparison = 0;

      switch (sortColumn) {
        case 'recipient':
          comparison = a.ratee.localeCompare(b.ratee);
          break;
        case 'topic':
          const topicA = topicMap[a.topicId] || '';
          const topicB = topicMap[b.topicId] || '';
          comparison = topicA.localeCompare(topicB);
          break;
        case 'score':
          comparison = a.score - b.score;
          break;
        case 'time':
          comparison = Number(a.timestamp) - Number(b.timestamp);
          break;
        default:
          comparison = 0;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300">
              <button
                onClick={() => handleSort('recipient')}
                className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Recipient
                {sortColumn === 'recipient' && (
                  <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </button>
            </th>
            <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300">
              <button
                onClick={() => handleSort('topic')}
                className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Topic
                {sortColumn === 'topic' && (
                  <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </button>
            </th>
            <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300">
              <button
                onClick={() => handleSort('score')}
                className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Score
                {sortColumn === 'score' && (
                  <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </button>
            </th>
            <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300">
              <button
                onClick={() => handleSort('time')}
                className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Time
                {sortColumn === 'time' && (
                  <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </button>
            </th>
          </tr>
          <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <th className="py-2 px-4">
              <input
                type="text"
                placeholder="Filter by address..."
                value={filters.recipient}
                onChange={(e) => setFilters({ ...filters, recipient: e.target.value })}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </th>
            <th className="py-2 px-4">
              <select
                value={filters.topicId}
                onChange={(e) => setFilters({ ...filters, topicId: parseInt(e.target.value) })}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value={0}>All Topics</option>
                {Object.entries(topicMap).map(([id, name]) => (
                  <option key={id} value={id}>{name}</option>
                ))}
              </select>
            </th>
            <th className="py-2 px-4">
              <div className="flex gap-1">
                <select
                  value={filters.scoreOperator}
                  onChange={(e) => setFilters({ ...filters, scoreOperator: e.target.value as any })}
                  className="w-16 px-1 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="all">All</option>
                  <option value=">=">&gt;=</option>
                  <option value="<=">&lt;=</option>
                  <option value="=">=</option>
                  <option value="between">Between</option>
                </select>
                {filters.scoreOperator !== 'all' && (
                  <>
                    <input
                      type="number"
                      placeholder="0-100"
                      min="0"
                      max="100"
                      step="0.1"
                      value={filters.scoreValue1}
                      onChange={(e) => setFilters({ ...filters, scoreValue1: e.target.value })}
                      className="flex-1 px-1 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    />
                    {filters.scoreOperator === 'between' && (
                      <input
                        type="number"
                        placeholder="0-100"
                        min="0"
                        max="100"
                        step="0.1"
                        value={filters.scoreValue2}
                        onChange={(e) => setFilters({ ...filters, scoreValue2: e.target.value })}
                        className="flex-1 px-1 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      />
                    )}
                  </>
                )}
              </div>
            </th>
            <th className="py-2 px-4">
              <div className="flex flex-col gap-1">
                <select
                  value={filters.timeMode}
                  onChange={(e) => setFilters({ ...filters, timeMode: e.target.value as any })}
                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="all">All Time</option>
                  <option value="before">Before</option>
                  <option value="after">After</option>
                  <option value="between">Between</option>
                </select>
                {filters.timeMode !== 'all' && (
                  <>
                    <input
                      type="datetime-local"
                      value={filters.timeValue1}
                      onChange={(e) => setFilters({ ...filters, timeValue1: e.target.value })}
                      className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    />
                    {filters.timeMode === 'between' && (
                      <input
                        type="datetime-local"
                        value={filters.timeValue2}
                        onChange={(e) => setFilters({ ...filters, timeValue2: e.target.value })}
                        className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      />
                    )}
                  </>
                )}
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {processedRatings.map((rating, index) => (
            <FeedbackGivenRow key={`${rating.ratee}-${rating.topicId}-${index}`} rating={rating} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FeedbackReceivedContent({ userAddress }: { userAddress: `0x${string}` }) {
  const { ratings, isLoading } = useUserReceivedRatings(userAddress);
  const [sortColumn, setSortColumn] = useState<'from' | 'topic' | 'score' | 'time'>('time');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filters, setFilters] = useState({
    from: '',
    topicId: 0, // 0 means all topics
    scoreOperator: 'all' as 'all' | '>=' | '<=' | '=' | 'between',
    scoreValue1: '',
    scoreValue2: '',
    timeMode: 'all' as 'all' | 'before' | 'after' | 'between',
    timeValue1: '',
    timeValue2: ''
  });
  const [topicMap, setTopicMap] = useState<Record<number, string>>({});
  const [profileMap, setProfileMap] = useState<Record<string, string>>({});
  const chainId = useChainId();
  const topicContract = getContract(chainId, 'TopicRegistry');
  const userContract = getContract(chainId, 'User');

  // Fetch all topics and profiles for filtering/sorting
  useEffect(() => {
    if (!ratings || ratings.length === 0) return;

    const fetchData = async () => {
      try {
        const publicClient = createPublicClient({
          chain: chainId === 11155111 ? sepolia : hardhat,
          transport: http(),
        });

        const uniqueTopicIds = [...new Set(ratings.map(r => r.topicId))];
        const uniqueAddresses = [...new Set(ratings.map(r => r.rater))];

        const topics = await Promise.all(
          uniqueTopicIds.map(async (topicId) => {
            try {
              const topic = await publicClient.readContract({
                address: topicContract.address,
                abi: topicContract.abi,
                functionName: 'getTopic',
                args: [topicId],
              });
              return { topicId, name: (topic as any)?.name || `Topic #${topicId}` };
            } catch {
              return { topicId, name: `Topic #${topicId}` };
            }
          })
        );

        const profiles = await Promise.all(
          uniqueAddresses.map(async (address) => {
            try {
              const profile = await publicClient.readContract({
                address: userContract.address,
                abi: userContract.abi,
                functionName: 'getUserProfile',
                args: [address],
              });
              return { address, name: (profile as any)?.name || 'Anonymous' };
            } catch {
              return { address, name: 'Anonymous' };
            }
          })
        );

        setTopicMap(Object.fromEntries(topics.map(t => [t.topicId, t.name])));
        setProfileMap(Object.fromEntries(profiles.map(p => [p.address, p.name])));
      } catch (error) {
        console.error('Error fetching data for filtering:', error);
      }
    };

    fetchData();
  }, [ratings, chainId, topicContract.address, topicContract.abi, userContract.address, userContract.abi]);

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
          No feedback received yet.
        </p>
      </div>
    );
  }

  const handleSort = (column: 'from' | 'topic' | 'score' | 'time') => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Filter and sort ratings
  const processedRatings = ratings
    .filter(rating => {
      // From filter
      const raterName = profileMap[rating.rater] || '';
      const fromMatch = !filters.from ||
        rating.rater.toLowerCase().includes(filters.from.toLowerCase()) ||
        raterName.toLowerCase().includes(filters.from.toLowerCase());

      // Topic filter (dropdown)
      const topicMatch = filters.topicId === 0 || rating.topicId === filters.topicId;

      // Score filter (numerical operators)
      let scoreMatch = true;
      if (filters.scoreOperator !== 'all' && filters.scoreValue1) {
        const scorePercentage = rating.score / 10;
        const value1 = parseFloat(filters.scoreValue1);

        switch (filters.scoreOperator) {
          case '>=':
            scoreMatch = scorePercentage >= value1;
            break;
          case '<=':
            scoreMatch = scorePercentage <= value1;
            break;
          case '=':
            scoreMatch = Math.abs(scorePercentage - value1) < 0.1;
            break;
          case 'between':
            if (filters.scoreValue2) {
              const value2 = parseFloat(filters.scoreValue2);
              scoreMatch = scorePercentage >= value1 && scorePercentage <= value2;
            }
            break;
        }
      }

      // Time filter (date range)
      let timeMatch = true;
      if (filters.timeMode !== 'all') {
        const ratingDate = new Date(Number(rating.timestamp) * 1000);

        if (filters.timeValue1) {
          const date1 = new Date(filters.timeValue1);

          switch (filters.timeMode) {
            case 'before':
              timeMatch = ratingDate <= date1;
              break;
            case 'after':
              timeMatch = ratingDate >= date1;
              break;
            case 'between':
              if (filters.timeValue2) {
                const date2 = new Date(filters.timeValue2);
                timeMatch = ratingDate >= date1 && ratingDate <= date2;
              }
              break;
          }
        }
      }

      return fromMatch && topicMatch && scoreMatch && timeMatch;
    })
    .sort((a, b) => {
      let comparison = 0;

      switch (sortColumn) {
        case 'from':
          comparison = a.rater.localeCompare(b.rater);
          break;
        case 'topic':
          const topicA = topicMap[a.topicId] || '';
          const topicB = topicMap[b.topicId] || '';
          comparison = topicA.localeCompare(topicB);
          break;
        case 'score':
          comparison = a.score - b.score;
          break;
        case 'time':
          comparison = Number(a.timestamp) - Number(b.timestamp);
          break;
        default:
          comparison = 0;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300">
              <button
                onClick={() => handleSort('from')}
                className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                From
                {sortColumn === 'from' && (
                  <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </button>
            </th>
            <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300">
              <button
                onClick={() => handleSort('topic')}
                className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Topic
                {sortColumn === 'topic' && (
                  <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </button>
            </th>
            <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300">
              <button
                onClick={() => handleSort('score')}
                className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Score
                {sortColumn === 'score' && (
                  <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </button>
            </th>
            <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300">
              <button
                onClick={() => handleSort('time')}
                className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Time
                {sortColumn === 'time' && (
                  <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </button>
            </th>
          </tr>
          <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <th className="py-2 px-4">
              <input
                type="text"
                placeholder="Filter by address..."
                value={filters.from}
                onChange={(e) => setFilters({ ...filters, from: e.target.value })}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </th>
            <th className="py-2 px-4">
              <select
                value={filters.topicId}
                onChange={(e) => setFilters({ ...filters, topicId: parseInt(e.target.value) })}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value={0}>All Topics</option>
                {Object.entries(topicMap).map(([id, name]) => (
                  <option key={id} value={id}>{name}</option>
                ))}
              </select>
            </th>
            <th className="py-2 px-4">
              <div className="flex gap-1">
                <select
                  value={filters.scoreOperator}
                  onChange={(e) => setFilters({ ...filters, scoreOperator: e.target.value as any })}
                  className="w-16 px-1 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="all">All</option>
                  <option value=">=">&gt;=</option>
                  <option value="<=">&lt;=</option>
                  <option value="=">=</option>
                  <option value="between">Between</option>
                </select>
                {filters.scoreOperator !== 'all' && (
                  <>
                    <input
                      type="number"
                      placeholder="0-100"
                      min="0"
                      max="100"
                      step="0.1"
                      value={filters.scoreValue1}
                      onChange={(e) => setFilters({ ...filters, scoreValue1: e.target.value })}
                      className="flex-1 px-1 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    />
                    {filters.scoreOperator === 'between' && (
                      <input
                        type="number"
                        placeholder="0-100"
                        min="0"
                        max="100"
                        step="0.1"
                        value={filters.scoreValue2}
                        onChange={(e) => setFilters({ ...filters, scoreValue2: e.target.value })}
                        className="flex-1 px-1 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      />
                    )}
                  </>
                )}
              </div>
            </th>
            <th className="py-2 px-4">
              <div className="flex flex-col gap-1">
                <select
                  value={filters.timeMode}
                  onChange={(e) => setFilters({ ...filters, timeMode: e.target.value as any })}
                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="all">All Time</option>
                  <option value="before">Before</option>
                  <option value="after">After</option>
                  <option value="between">Between</option>
                </select>
                {filters.timeMode !== 'all' && (
                  <>
                    <input
                      type="datetime-local"
                      value={filters.timeValue1}
                      onChange={(e) => setFilters({ ...filters, timeValue1: e.target.value })}
                      className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    />
                    {filters.timeMode === 'between' && (
                      <input
                        type="datetime-local"
                        value={filters.timeValue2}
                        onChange={(e) => setFilters({ ...filters, timeValue2: e.target.value })}
                        className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      />
                    )}
                  </>
                )}
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {processedRatings.map((rating, index) => (
            <FeedbackReceivedRow key={`${rating.rater}-${rating.topicId}-${index}`} rating={rating} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FeedbackGivenRow({ rating }: { rating: any }) {
  const { topic } = useTopic(rating.topicId);
  const { profile } = useUserProfile(rating.ratee as `0x${string}`);
  const ratingDate = new Date(Number(rating.timestamp) * 1000);

  return (
    <tr className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
      <td className="py-3 px-4">
        <Link
          href={`/user/${rating.ratee}`}
          className="text-sm hover:underline"
        >
          <div className="font-medium text-gray-900 dark:text-gray-100">
            {profile?.name || 'Anonymous'}
          </div>
          <div className="font-mono text-xs text-blue-600 dark:text-blue-400">
            {rating.ratee.slice(0, 8)}...{rating.ratee.slice(-6)}
          </div>
        </Link>
      </td>
      <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
        {topic?.name || `Topic #${rating.topicId}`}
      </td>
      <td className="py-3 px-4">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
          {(rating.score / 10).toFixed(1)}%
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

function FeedbackReceivedRow({ rating }: { rating: any }) {
  const { topic } = useTopic(rating.topicId);
  const { profile } = useUserProfile(rating.rater as `0x${string}`);
  const ratingDate = new Date(Number(rating.timestamp) * 1000);

  return (
    <tr className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
      <td className="py-3 px-4">
        <Link
          href={`/user/${rating.rater}`}
          className="text-sm hover:underline"
        >
          <div className="font-medium text-gray-900 dark:text-gray-100">
            {profile?.name || 'Anonymous'}
          </div>
          <div className="font-mono text-xs text-blue-600 dark:text-blue-400">
            {rating.rater.slice(0, 8)}...{rating.rater.slice(-6)}
          </div>
        </Link>
      </td>
      <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
        {topic?.name || `Topic #${rating.topicId}`}
      </td>
      <td className="py-3 px-4">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
          {(rating.score / 10).toFixed(1)}%
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

function GiveFeedbackSection({ userAddress }: { userAddress: `0x${string}` }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTopicId, setSelectedTopicId] = useState<number>(0);
  const [rating, setRating] = useState<string>('');
  const { topicCount } = useTopics();
  const [allTopics, setAllTopics] = useState<Array<{ id: number; name: string; depth: number }>>([]);
  const chainId = useChainId();
  const contract = getContract(chainId, 'TopicRegistry');
  const { rateUser, isConfirming, isSuccess, isPending } = useRateUser();

  // Fetch all topics for the dropdown
  useEffect(() => {
    if (!topicCount || topicCount === 0) {
      setAllTopics([]);
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
              const topic = await publicClient.readContract({
                address: contract.address,
                abi: contract.abi,
                functionName: 'getTopic',
                args: [id],
              });

              return { id, topic };
            } catch (error) {
              console.error(`Error fetching topic ${id}:`, error);
              return { id, topic: null };
            }
          })
        );

        // Build hierarchical structure
        const buildHierarchy = (parentId: number, depth: number = 0): Array<{ id: number; name: string; depth: number }> => {
          const children = topicsData
            .filter(t => t.topic && (t.topic as any).parentId === parentId)
            .sort((a, b) => a.id - b.id);

          const result: Array<{ id: number; name: string; depth: number }> = [];
          for (const child of children) {
            const topic = child.topic as any;
            result.push({
              id: child.id,
              name: topic.name || `Topic ${child.id}`,
              depth,
            });
            result.push(...buildHierarchy(child.id, depth + 1));
          }
          return result;
        };

        const hierarchical = buildHierarchy(0);
        setAllTopics(hierarchical);
      } catch (error) {
        console.error('Error fetching topics:', error);
        setAllTopics([]);
      }
    };

    fetchTopics();
  }, [topicCount, chainId, contract.address, contract.abi]);

  // Reset form when modal is opened
  useEffect(() => {
    if (isModalOpen) {
      setSelectedTopicId(0);
      setRating('');
    }
  }, [isModalOpen]);

  // Close modal on success
  useEffect(() => {
    if (isSuccess) {
      setIsModalOpen(false);
      setSelectedTopicId(0);
      setRating('');
    }
  }, [isSuccess]);

  const handleSubmit = () => {
    if (selectedTopicId === 0) {
      alert('Please select a topic');
      return;
    }

    const ratingValue = parseFloat(rating);
    if (isNaN(ratingValue) || ratingValue < 0 || ratingValue > 100) {
      alert('Please enter a valid rating between 0 and 100');
      return;
    }

    // Convert percentage to score (multiply by 10 and round)
    const score = Math.round(ratingValue * 10);

    rateUser(userAddress, selectedTopicId, score);
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold mb-2">Give Feedback</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Rate this user's expertise in a specific topic
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded font-medium hover:bg-gray-700 dark:hover:bg-gray-300 transition-colors"
          >
            Give Feedback
          </button>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => !isConfirming && !isPending && setIsModalOpen(false)}
          />

          {/* Modal Content */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 w-full max-w-md p-6">
              <h3 className="text-xl font-bold mb-4">Give Feedback</h3>

              {/* Topic Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Topic
                </label>
                <select
                  value={selectedTopicId}
                  onChange={(e) => setSelectedTopicId(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  disabled={isConfirming || isPending}
                >
                  <option value={0}>Select a topic...</option>
                  {allTopics.map(({ id, name, depth }) => (
                    <option key={id} value={id}>
                      {'\u00A0'.repeat(depth * 4)}{name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rating Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Rating (0-100%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  placeholder="Enter rating (e.g., 75.5)"
                  disabled={isConfirming || isPending}
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  disabled={isConfirming || isPending}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded font-medium hover:bg-gray-700 dark:hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isConfirming || isPending}
                >
                  {isConfirming || isPending ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
