'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import { Footer } from '@/components/Footer';
import { Navigation } from '@/components/Navigation';
import { useTopics, useChainId } from '@/hooks/useContracts';
import { getContract } from '@/lib/contracts';
import { createPublicClient, http } from 'viem';
import { sepolia, hardhat } from 'viem/chains';

interface LeaderboardEntry {
  address: `0x${string}`;
  name: string;
  registrationTime: bigint;
  challengeScore: number;
  peerRatingScore: number;
  overallScore: number;
}

type SortField = 'name' | 'registrationTime' | 'challengeScore' | 'peerRatingScore' | 'overallScore';
type SortDirection = 'asc' | 'desc';

export default function LeaderboardPage() {
  const { address: connectedAddress, isConnected } = useAccount();
  const [selectedTopicId, setSelectedTopicId] = useState<number>(1);
  const [itemsToShow, setItemsToShow] = useState<number>(10);
  const [sortField, setSortField] = useState<SortField>('overallScore');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { topicCount } = useTopics();
  const [allTopics, setAllTopics] = useState<Array<{ id: number; name: string; depth: number }>>([]);
  const chainId = useChainId();

  // Fetch all topics for the dropdown
  useEffect(() => {
    if (!topicCount || topicCount === 0) {
      setAllTopics([]);
      return;
    }

    const fetchTopics = async () => {
      try {
        const topicContract = getContract(chainId, 'TopicRegistry');
        const publicClient = createPublicClient({
          chain: chainId === 11155111 ? sepolia : hardhat,
          transport: http(),
        });

        const allTopicIds = Array.from({ length: topicCount }, (_, i) => i + 1);
        const topicsData = await Promise.all(
          allTopicIds.map(async (id) => {
            try {
              const topic = await publicClient.readContract({
                address: topicContract.address,
                abi: topicContract.abi,
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
  }, [topicCount, chainId]);

  // Fetch leaderboard data
  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        setIsLoading(true);
        const userContract = getContract(chainId, 'User');
        const peerRatingContract = getContract(chainId, 'PeerRating');
        const publicClient = createPublicClient({
          chain: chainId === 11155111 ? sepolia : hardhat,
          transport: http(),
        });

        // Get all UserRegistered events
        const userRegisteredLogs = await publicClient.getContractEvents({
          address: userContract.address,
          abi: userContract.abi,
          eventName: 'UserRegistered',
          fromBlock: 'earliest',
          toBlock: 'latest',
        });

        // Extract unique user addresses
        const userAddresses = [...new Set(userRegisteredLogs.map((log: any) => log.args.user))];

        // Fetch data for each user
        const leaderboardEntries = await Promise.all(
          userAddresses.map(async (address) => {
            try {
              // Fetch user profile
              const profile = await publicClient.readContract({
                address: userContract.address,
                abi: userContract.abi,
                functionName: 'getUserProfile',
                args: [address],
              }) as any;

              // Fetch user expertise for the selected topic
              const expertise = await publicClient.readContract({
                address: userContract.address,
                abi: userContract.abi,
                functionName: 'getUserExpertise',
                args: [address, selectedTopicId],
              }) as any;

              // Fetch user score for the selected topic (challenge score)
              const score = await publicClient.readContract({
                address: userContract.address,
                abi: userContract.abi,
                functionName: 'getUserScore',
                args: [address, selectedTopicId],
              }) as bigint;

              // Fetch peer rating scores for this user and topic
              const ratingLogs = await publicClient.getContractEvents({
                address: peerRatingContract.address,
                abi: peerRatingContract.abi,
                eventName: 'RatingSubmitted',
                fromBlock: 'earliest',
                toBlock: 'latest',
                args: {
                  ratee: address,
                },
              });

              // Calculate average peer rating for this topic
              const topicRatings = ratingLogs
                .map((log: any) => log.args)
                .filter((args: any) => Number(args.topicId) === selectedTopicId)
                .map((args: any) => Number(args.score));

              const avgPeerRating = topicRatings.length > 0
                ? topicRatings.reduce((sum, rating) => sum + rating, 0) / topicRatings.length
                : 0;

              // Challenge score is normalized to 0-100
              const challengeScore = Number(score) / 10;

              // Peer rating score is already 0-1000, normalize to 0-100
              const peerRatingScore = avgPeerRating / 10;

              // Overall score is the average of challenge score and peer rating score
              const overallScore = (challengeScore + peerRatingScore) / 2;

              return {
                address: address as `0x${string}`,
                name: profile?.name || 'Anonymous',
                registrationTime: profile?.registrationTime || BigInt(0),
                challengeScore,
                peerRatingScore,
                overallScore,
              };
            } catch (error) {
              console.error(`Error fetching data for user ${address}:`, error);
              return null;
            }
          })
        );

        // Filter out null entries and sort
        const validEntries = leaderboardEntries.filter((entry): entry is LeaderboardEntry => entry !== null);
        setLeaderboardData(validEntries);
      } catch (error) {
        console.error('Error fetching leaderboard data:', error);
        setLeaderboardData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboardData();
  }, [selectedTopicId, chainId]);

  // Sort and slice data for display
  const sortedData = [...leaderboardData].sort((a, b) => {
    let comparison = 0;

    switch (sortField) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'registrationTime':
        comparison = Number(a.registrationTime) - Number(b.registrationTime);
        break;
      case 'challengeScore':
        comparison = a.challengeScore - b.challengeScore;
        break;
      case 'peerRatingScore':
        comparison = a.peerRatingScore - b.peerRatingScore;
        break;
      case 'overallScore':
        comparison = a.overallScore - b.overallScore;
        break;
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const displayedData = sortedData.slice(0, itemsToShow);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Leaderboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Connect your wallet to view the leaderboard
            </p>
            <ConnectButton />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Navigation address={connectedAddress} />

      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Leaderboard</h1>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Topic</label>
                <select
                  value={selectedTopicId}
                  onChange={(e) => setSelectedTopicId(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                >
                  {allTopics.map(({ id, name, depth }) => (
                    <option key={id} value={id}>
                      {'\u00A0'.repeat(depth * 4)}{name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Items to Show</label>
                <select
                  value={itemsToShow}
                  onChange={(e) => setItemsToShow(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                >
                  <option value={3}>3</option>
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>
          </div>

          {/* Leaderboard Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {isLoading ? (
              <div className="p-12 text-center">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mx-auto mb-4"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
                </div>
              </div>
            ) : displayedData.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  No users found for this topic.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                      <th className="text-left py-4 px-6 font-semibold text-sm text-gray-700 dark:text-gray-300">
                        Rank
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-sm text-gray-700 dark:text-gray-300">
                        User
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-sm text-gray-700 dark:text-gray-300">
                        <button
                          onClick={() => handleSort('name')}
                          className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          Name
                          {sortField === 'name' && (
                            <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </button>
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-sm text-gray-700 dark:text-gray-300">
                        <button
                          onClick={() => handleSort('registrationTime')}
                          className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          Date Joined
                          {sortField === 'registrationTime' && (
                            <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </button>
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-sm text-gray-700 dark:text-gray-300">
                        <button
                          onClick={() => handleSort('challengeScore')}
                          className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          Challenge Score
                          {sortField === 'challengeScore' && (
                            <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </button>
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-sm text-gray-700 dark:text-gray-300">
                        <button
                          onClick={() => handleSort('peerRatingScore')}
                          className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          Peer Rating
                          {sortField === 'peerRatingScore' && (
                            <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </button>
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-sm text-gray-700 dark:text-gray-300">
                        <button
                          onClick={() => handleSort('overallScore')}
                          className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          Overall Score
                          {sortField === 'overallScore' && (
                            <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedData.map((entry, index) => (
                      <tr
                        key={entry.address}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                      >
                        <td className="py-4 px-6 text-gray-900 dark:text-gray-100">
                          <span className="font-bold text-lg">
                            #{index + 1}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <Link
                            href={`/user/${entry.address}`}
                            className="font-mono text-sm text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {entry.address.slice(0, 8)}...{entry.address.slice(-6)}
                          </Link>
                        </td>
                        <td className="py-4 px-6 text-gray-900 dark:text-gray-100">
                          {entry.name}
                        </td>
                        <td className="py-4 px-6 text-gray-700 dark:text-gray-300">
                          {new Date(Number(entry.registrationTime) * 1000).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                            {entry.challengeScore.toFixed(1)}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                            {entry.peerRatingScore.toFixed(1)}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                            {entry.overallScore.toFixed(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Stats */}
          {!isLoading && displayedData.length > 0 && (
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
              Showing {displayedData.length} of {leaderboardData.length} users
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
