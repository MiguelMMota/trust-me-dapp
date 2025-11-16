/**
 * Custom hooks for TrustMe contract interactions
 */

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { getContract } from '@/lib/contracts';
import type { Address } from '@/lib/types';
import { useState, useEffect } from 'react';
import { createPublicClient, http } from 'viem';
import { sepolia, hardhat } from 'viem/chains';

// Hook to get current chain ID
export function useChainId() {
  const { chain } = useAccount();
  return chain?.id || 31337; // Default to local
}

// ========== TopicRegistry Hooks ==========

export function useTopics() {
  const chainId = useChainId();
  const contract = getContract(chainId, 'TopicRegistry');

  // Get root topics
  const { data: rootTopicIds } = useReadContract({
    ...contract,
    functionName: 'getRootTopics',
  });

  // Get topic count
  const { data: topicCount } = useReadContract({
    ...contract,
    functionName: 'topicCount',
  });

  return {
    rootTopicIds: rootTopicIds as number[] | undefined,
    topicCount: topicCount as number | undefined,
  };
}

export function useTopic(topicId: number) {
  const chainId = useChainId();
  const contract = getContract(chainId, 'TopicRegistry');

  const { data: topic } = useReadContract({
    ...contract,
    functionName: 'getTopic',
    args: [topicId],
  });

  const { data: childTopicIds } = useReadContract({
    ...contract,
    functionName: 'getChildTopics',
    args: [topicId],
  });

  return {
    topic: topic as any,
    childTopicIds: childTopicIds as number[] | undefined,
  };
}

// Hook to fetch all global topics recursively
export function useAllTopics() {
  const chainId = useChainId();
  const contract = getContract(chainId, 'TopicRegistry');
  const [allTopics, setAllTopics] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { data: rootTopicIds } = useReadContract({
    ...contract,
    functionName: 'getRootTopics',
  });

  useEffect(() => {
    if (!rootTopicIds || (rootTopicIds as number[]).length === 0) {
      setIsLoading(false);
      setAllTopics([]);
      return;
    }

    const fetchAllTopics = async () => {
      try {
        setIsLoading(true);

        // Create a public client for reading contract
        const publicClient = createPublicClient({
          chain: chainId === 11155111 ? sepolia : hardhat,
          transport: http(),
        });

        const topics: any[] = [];
        const topicsToFetch: number[] = [...(rootTopicIds as number[])];
        const fetchedIds = new Set<number>();

        // Fetch topics breadth-first
        while (topicsToFetch.length > 0) {
          const topicId = topicsToFetch.shift()!;

          // Skip if already fetched
          if (fetchedIds.has(topicId)) continue;
          fetchedIds.add(topicId);

          try {
            // Fetch topic data
            const topicData = await publicClient.readContract({
              address: contract.address,
              abi: contract.abi,
              functionName: 'getTopic',
              args: [topicId],
            });

            // Fetch child topics
            const childIds = await publicClient.readContract({
              address: contract.address,
              abi: contract.abi,
              functionName: 'getChildTopics',
              args: [topicId],
            }) as number[];

            // Add topic to list
            topics.push({
              id: topicId,
              ...(topicData as any),
            });

            // Add children to fetch queue
            if (childIds && childIds.length > 0) {
              topicsToFetch.push(...childIds.filter(id => !fetchedIds.has(id)));
            }
          } catch (error) {
            console.error(`Error fetching topic ${topicId}:`, error);
          }
        }

        setAllTopics(topics);
      } catch (error) {
        console.error('Error fetching all topics:', error);
        setAllTopics([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllTopics();
  }, [rootTopicIds, chainId, contract.address, contract.abi]);

  return {
    topics: allTopics,
    isLoading,
  };
}

export function useCreateTopic() {
  const chainId = useChainId();
  const contract = getContract(chainId, 'TopicRegistry');
  const {
    writeContract,
    data: hash,
    isPending,
    isSuccess: _,
    error: writeError,
    ...rest
  } = useWriteContract();

  const createTopic = (name: string, parentId: number) => {
    writeContract({
      ...contract,
      functionName: 'createTopic',
      args: [name, parentId],
    });
  };

  const {
    isLoading: isConfirming,
    isSuccess,
    error: receiptError
  } = useWaitForTransactionReceipt({ hash });

  return {
    createTopic,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error: writeError || receiptError,
    ...rest,
  };
}

// ========== User Hooks ==========

export function useUserProfile(address?: Address) {
  const { address: connectedAddress } = useAccount();
  const userAddress = address || connectedAddress;
  const chainId = useChainId();
  const contract = getContract(chainId, 'User');

  const { data: isRegistered } = useReadContract({
    ...contract,
    functionName: 'isRegistered',
    args: [userAddress!],
    query: { enabled: !!userAddress },
  });

  const { data: profile } = useReadContract({
    ...contract,
    functionName: 'getUserProfile',
    args: [userAddress!],
    query: { enabled: !!userAddress && !!isRegistered },
  });

  const { data: userTopicIds } = useReadContract({
    ...contract,
    functionName: 'getUserTopics',
    args: [userAddress!],
    query: { enabled: !!userAddress && !!isRegistered },
  });

  return {
    isRegistered: isRegistered as boolean | undefined,
    profile: profile as any,
    userTopicIds: userTopicIds as number[] | undefined,
  };
}

export function useUserExpertise(address?: Address, topicId?: number) {
  const { address: connectedAddress } = useAccount();
  const userAddress = address || connectedAddress;
  const chainId = useChainId();
  const contract = getContract(chainId, 'User');

  const { data: expertise } = useReadContract({
    ...contract,
    functionName: 'getUserExpertise',
    args: [userAddress!, topicId!],
    query: { enabled: !!userAddress && topicId !== undefined },
  });

  const { data: score } = useReadContract({
    ...contract,
    functionName: 'getUserScore',
    args: [userAddress!, topicId!],
    query: { enabled: !!userAddress && topicId !== undefined },
  });

  const { data: accuracy } = useReadContract({
    ...contract,
    functionName: 'getAccuracy',
    args: [userAddress!, topicId!],
    query: { enabled: !!userAddress && topicId !== undefined },
  });

  return {
    expertise: expertise as any,
    score: score as number | undefined,
    accuracy: accuracy as number | undefined, // basis points (10000 = 100%)
  };
}

export function useRegisterUser() {
  const chainId = useChainId();
  const contract = getContract(chainId, 'User');
  const {
    writeContract,
    data: hash,
    isPending,
    isSuccess: _,
    error: writeError,
    ...rest
  } = useWriteContract();

  const registerUser = () => {
    writeContract({
      ...contract,
      functionName: 'registerUser',
    });
  };

  const {
    isLoading: isConfirming,
    isSuccess,
    error: receiptError
  } = useWaitForTransactionReceipt({ hash });

  return {
    registerUser,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error: writeError || receiptError,
    ...rest,
  };
}

// ========== Challenge Hooks ==========

export function useChallenge(challengeId: bigint) {
  const chainId = useChainId();
  const contract = getContract(chainId, 'Challenge');

  const { data: challenge } = useReadContract({
    ...contract,
    functionName: 'getChallenge',
    args: [challengeId],
    query: { enabled: challengeId > BigInt(0) },
  });

  return {
    challenge: challenge as any,
  };
}

export function useChallengeAttempt(challengeId: bigint, address?: Address) {
  const { address: connectedAddress } = useAccount();
  const userAddress = address || connectedAddress;
  const chainId = useChainId();
  const contract = getContract(chainId, 'Challenge');

  const { data: attempt } = useReadContract({
    ...contract,
    functionName: 'getUserAttempt',
    args: [challengeId, userAddress!],
    query: { enabled: challengeId > BigInt(0) && !!userAddress },
  });

  return {
    attempt: attempt as any,
  };
}

export function useTopicChallenges(topicId: number) {
  const chainId = useChainId();
  const contract = getContract(chainId, 'Challenge');

  const { data: challengeIds } = useReadContract({
    ...contract,
    functionName: 'getTopicChallenges',
    args: [topicId],
    query: { enabled: topicId > 0 },
  });

  return {
    challengeIds: challengeIds as bigint[] | undefined,
  };
}

export function useUserChallengeHistory(address?: Address) {
  const { address: connectedAddress } = useAccount();
  const userAddress = address || connectedAddress;
  const chainId = useChainId();
  const contract = getContract(chainId, 'Challenge');

  const { data: challengeIds } = useReadContract({
    ...contract,
    functionName: 'getUserChallengeHistory',
    args: [userAddress!],
    query: { enabled: !!userAddress },
  });

  return {
    challengeIds: challengeIds as bigint[] | undefined,
  };
}

export function useCreateChallenge() {
  const chainId = useChainId();
  const contract = getContract(chainId, 'Challenge');
  const {
    writeContract,
    data: hash,
    isPending,
    isSuccess: _,
    error: writeError,
    ...rest
  } = useWriteContract();

  const createChallenge = (
    topicId: number,
    difficulty: number,
    questionHash: `0x${string}`,
    answerHash: `0x${string}`
  ) => {
    writeContract({
      ...contract,
      functionName: 'createChallenge',
      args: [topicId, difficulty, questionHash, answerHash],
    });
  };

  const {
    isLoading: isConfirming,
    isSuccess,
    error: receiptError
  } = useWaitForTransactionReceipt({ hash });

  return {
    createChallenge,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error: writeError || receiptError,
    ...rest,
  };
}

export function useAttemptChallenge() {
  const chainId = useChainId();
  const challengeContract = getContract(chainId, 'Challenge');
  const {
    writeContract,
    data: hash,
    isPending,
    isSuccess: _,
    error: writeError,
    ...rest
  } = useWriteContract();

  const attemptChallenge = (challengeId: bigint, answerHash: `0x${string}`) => {
    writeContract({
      ...challengeContract,
      functionName: 'attemptChallenge',
      args: [challengeId, answerHash],
    });
  };

  const {
    isLoading: isConfirming,
    isSuccess,
    error: receiptError
  } = useWaitForTransactionReceipt({ hash });

  return {
    attemptChallenge,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error: writeError || receiptError,
    ...rest,
  };
}

// ========== Poll Hooks ==========

export function usePoll(pollId: bigint) {
  const chainId = useChainId();
  const contract = getContract(chainId, 'Poll');

  const { data: poll } = useReadContract({
    ...contract,
    functionName: 'getPoll',
    args: [pollId],
    query: { enabled: pollId > BigInt(0) },
  });

  const { data: options } = useReadContract({
    ...contract,
    functionName: 'getPollOptions',
    args: [pollId],
    query: { enabled: pollId > BigInt(0) },
  });

  const { data: results } = useReadContract({
    ...contract,
    functionName: 'getPollResults',
    args: [pollId],
    query: { enabled: pollId > BigInt(0) },
  });

  return {
    poll: poll as any,
    options: options as any[],
    results: results as any,
  };
}

export function useTopicPolls(topicId: number) {
  const chainId = useChainId();
  const contract = getContract(chainId, 'Poll');

  const { data: pollIds } = useReadContract({
    ...contract,
    functionName: 'getTopicPolls',
    args: [topicId],
    query: { enabled: topicId > 0 },
  });

  return {
    pollIds: pollIds as bigint[] | undefined,
  };
}

export function useUserVote(pollId: bigint, address?: Address) {
  const { address: connectedAddress } = useAccount();
  const userAddress = address || connectedAddress;
  const chainId = useChainId();
  const contract = getContract(chainId, 'Poll');

  const { data: vote } = useReadContract({
    ...contract,
    functionName: 'getUserVote',
    args: [pollId, userAddress!],
    query: { enabled: pollId > BigInt(0) && !!userAddress },
  });

  return {
    vote: vote as any,
  };
}

export function useCreatePoll() {
  const chainId = useChainId();
  const contract = getContract(chainId, 'Poll');
  const {
    writeContract,
    data: hash,
    isPending,
    isSuccess: _,
    error: writeError,
    ...rest
  } = useWriteContract();

  const createPoll = (
    topicId: number,
    question: string,
    options: string[],
    durationInDays: number
  ) => {
    writeContract({
      ...contract,
      functionName: 'createPoll',
      args: [topicId, question, options, durationInDays],
    });
  };

  const {
    isLoading: isConfirming,
    isSuccess,
    error: receiptError
  } = useWaitForTransactionReceipt({ hash });

  return {
    createPoll,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error: writeError || receiptError,
    ...rest,
  };
}

export function useVotePoll() {
  const chainId = useChainId();
  const contract = getContract(chainId, 'Poll');
  const {
    writeContract,
    data: hash,
    isPending,
    isSuccess: _,
    error: writeError,
    ...rest
  } = useWriteContract();

  const vote = (pollId: bigint, optionId: number) => {
    writeContract({
      ...contract,
      functionName: 'vote',
      args: [pollId, optionId],
    });
  };

  const {
    isLoading: isConfirming,
    isSuccess,
    error: receiptError
  } = useWaitForTransactionReceipt({ hash });

  return {
    vote,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error: writeError || receiptError,
    ...rest,
  };
}

// ========== PeerRating Hooks ==========

export interface PeerRating {
  rater: Address;
  ratee: Address;
  topicId: number;
  score: number;
  timestamp: bigint;
  exists: boolean;
}

export function useUserGivenRatings(address?: Address) {
  const { address: connectedAddress } = useAccount();
  const userAddress = address || connectedAddress;
  const chainId = useChainId();
  const contract = getContract(chainId, 'PeerRating');
  const [ratings, setRatings] = useState<PeerRating[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userAddress) {
      setIsLoading(false);
      return;
    }

    const fetchRatings = async () => {
      try {
        setIsLoading(true);

        // Create a public client for reading contract events
        const publicClient = createPublicClient({
          chain: chainId === 11155111 ? sepolia : hardhat,
          transport: http(),
        });

        // Query RatingSubmitted events where the user is the rater
        const logs = await publicClient.getContractEvents({
          address: contract.address,
          abi: contract.abi,
          eventName: 'RatingSubmitted',
          fromBlock: 'earliest',
          toBlock: 'latest',
          args: {
            rater: userAddress,
          },
        });

        // Query RatingUpdated events where the user is the rater
        const updateLogs = await publicClient.getContractEvents({
          address: contract.address,
          abi: contract.abi,
          eventName: 'RatingUpdated',
          fromBlock: 'earliest',
          toBlock: 'latest',
          args: {
            rater: userAddress,
          },
        });

        // Process logs and get the most recent rating for each (ratee, topicId) pair
        const ratingsMap = new Map<string, PeerRating>();

        // Process RatingSubmitted events
        logs.forEach((log: any) => {
          const { rater, ratee, topicId, score, timestamp } = log.args;
          const key = `${ratee}-${topicId}`;
          const existing = ratingsMap.get(key);

          if (!existing || timestamp > existing.timestamp) {
            ratingsMap.set(key, {
              rater,
              ratee,
              topicId: Number(topicId),
              score: Number(score),
              timestamp,
              exists: true,
            });
          }
        });

        // Process RatingUpdated events (these should override previous ratings)
        updateLogs.forEach((log: any) => {
          const { rater, ratee, topicId, newScore, timestamp } = log.args;
          const key = `${ratee}-${topicId}`;
          const existing = ratingsMap.get(key);

          if (!existing || timestamp > existing.timestamp) {
            ratingsMap.set(key, {
              rater,
              ratee,
              topicId: Number(topicId),
              score: Number(newScore),
              timestamp,
              exists: true,
            });
          }
        });

        // Convert map to array and sort by timestamp (newest first)
        const ratingsArray = Array.from(ratingsMap.values()).sort(
          (a, b) => Number(b.timestamp) - Number(a.timestamp)
        );

        setRatings(ratingsArray);
      } catch (error) {
        console.error('Error fetching peer ratings:', error);
        setRatings([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRatings();
  }, [userAddress, chainId, contract.address, contract.abi]);

  return {
    ratings,
    isLoading,
  };
}

export function useUserReceivedRatings(address?: Address) {
  const { address: connectedAddress } = useAccount();
  const userAddress = address || connectedAddress;
  const chainId = useChainId();
  const contract = getContract(chainId, 'PeerRating');
  const [ratings, setRatings] = useState<PeerRating[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userAddress) {
      setIsLoading(false);
      return;
    }

    const fetchRatings = async () => {
      try {
        setIsLoading(true);

        // Create a public client for reading contract events
        const publicClient = createPublicClient({
          chain: chainId === 11155111 ? sepolia : hardhat,
          transport: http(),
        });

        // Query RatingSubmitted events where the user is the ratee
        const logs = await publicClient.getContractEvents({
          address: contract.address,
          abi: contract.abi,
          eventName: 'RatingSubmitted',
          fromBlock: 'earliest',
          toBlock: 'latest',
          args: {
            ratee: userAddress,
          },
        });

        // Query RatingUpdated events where the user is the ratee
        const updateLogs = await publicClient.getContractEvents({
          address: contract.address,
          abi: contract.abi,
          eventName: 'RatingUpdated',
          fromBlock: 'earliest',
          toBlock: 'latest',
          args: {
            ratee: userAddress,
          },
        });

        // Process logs and get the most recent rating for each (rater, topicId) pair
        const ratingsMap = new Map<string, PeerRating>();

        // Process RatingSubmitted events
        logs.forEach((log: any) => {
          const { rater, ratee, topicId, score, timestamp } = log.args;
          const key = `${rater}-${topicId}`;
          const existing = ratingsMap.get(key);

          if (!existing || timestamp > existing.timestamp) {
            ratingsMap.set(key, {
              rater,
              ratee,
              topicId: Number(topicId),
              score: Number(score),
              timestamp,
              exists: true,
            });
          }
        });

        // Process RatingUpdated events (these should override previous ratings)
        updateLogs.forEach((log: any) => {
          const { rater, ratee, topicId, newScore, timestamp } = log.args;
          const key = `${rater}-${topicId}`;
          const existing = ratingsMap.get(key);

          if (!existing || timestamp > existing.timestamp) {
            ratingsMap.set(key, {
              rater,
              ratee,
              topicId: Number(topicId),
              score: Number(newScore),
              timestamp,
              exists: true,
            });
          }
        });

        // Convert map to array and sort by timestamp (newest first)
        const ratingsArray = Array.from(ratingsMap.values()).sort(
          (a, b) => Number(b.timestamp) - Number(a.timestamp)
        );

        setRatings(ratingsArray);
      } catch (error) {
        console.error('Error fetching received peer ratings:', error);
        setRatings([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRatings();
  }, [userAddress, chainId, contract.address, contract.abi]);

  return {
    ratings,
    isLoading,
  };
}

export function useRateUser() {
  const chainId = useChainId();
  const contract = getContract(chainId, 'PeerRating');
  const {
    writeContract,
    data: hash,
    isPending,
    isSuccess: _,
    error: writeError,
    ...rest
  } = useWriteContract();

  const rateUser = (ratee: Address, topicId: number, score: number) => {
    writeContract({
      ...contract,
      functionName: 'rateUser',
      args: [ratee, topicId, score],
    });
  };

  const {
    isLoading: isConfirming,
    isSuccess,
    error: receiptError
  } = useWaitForTransactionReceipt({ hash });

  return {
    rateUser,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error: writeError || receiptError,
    ...rest,
  };
}

// ========== TeamRegistry Hooks ==========

export interface Team {
  teamId: bigint;
  name: string;
  owner: Address;
  createdAt: bigint;
  isActive: boolean;
}

export interface TeamMember {
  role: number; // 0 = none, 1 = MEMBER, 2 = ADMIN, 3 = OWNER
  joinedAt: bigint;
  isActive: boolean;
}

export function useTeam(teamId?: bigint | string) {
  const chainId = useChainId();
  const contract = getContract(chainId, 'TeamRegistry');

  const { data: team, ...rest } = useReadContract({
    ...contract,
    functionName: 'getTeam',
    args: teamId !== undefined ? [BigInt(teamId)] : undefined,
    query: {
      enabled: teamId !== undefined,
    }
  });

  return {
    team: team as Team | undefined,
    ...rest,
  };
}

export function useTeamMembers(teamId?: bigint | string) {
  const chainId = useChainId();
  const contract = getContract(chainId, 'TeamRegistry');

  const { data: members, ...rest } = useReadContract({
    ...contract,
    functionName: 'getTeamMembers',
    args: teamId !== undefined ? [BigInt(teamId)] : undefined,
    query: {
      enabled: teamId !== undefined,
    }
  });

  return {
    members: members as Address[] | undefined,
    ...rest,
  };
}

export function useTeamMember(teamId?: bigint | string, memberAddress?: Address) {
  const chainId = useChainId();
  const contract = getContract(chainId, 'TeamRegistry');

  const { data: member, ...rest } = useReadContract({
    ...contract,
    functionName: 'getTeamMember',
    args: teamId !== undefined && memberAddress ? [BigInt(teamId), memberAddress] : undefined,
    query: {
      enabled: teamId !== undefined && memberAddress !== undefined,
    }
  });

  return {
    member: member as TeamMember | undefined,
    ...rest,
  };
}

export function useUserTeams(userAddress?: Address) {
  const chainId = useChainId();
  const contract = getContract(chainId, 'TeamRegistry');

  const { data: teamIds, ...rest } = useReadContract({
    ...contract,
    functionName: 'getUserTeams',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: userAddress !== undefined,
    }
  });

  return {
    teamIds: teamIds as bigint[] | undefined,
    ...rest,
  };
}

export function useIsTeamMember(teamId?: bigint | string, userAddress?: Address) {
  const chainId = useChainId();
  const contract = getContract(chainId, 'TeamRegistry');

  const { data: isMember, ...rest } = useReadContract({
    ...contract,
    functionName: 'isTeamMember',
    args: teamId !== undefined && userAddress ? [BigInt(teamId), userAddress] : undefined,
    query: {
      enabled: teamId !== undefined && userAddress !== undefined,
    }
  });

  return {
    isMember: isMember as boolean | undefined,
    ...rest,
  };
}

export function useCreateTeam() {
  const chainId = useChainId();
  const contract = getContract(chainId, 'TeamRegistry');
  const {
    writeContract,
    data: hash,
    isPending,
    error: writeError,
    ...rest
  } = useWriteContract();

  const createTeam = (name: string) => {
    writeContract({
      ...contract,
      functionName: 'createTeam',
      args: [name],
    });
  };

  const {
    isLoading: isConfirming,
    isSuccess,
    error: receiptError
  } = useWaitForTransactionReceipt({ hash });

  return {
    createTeam,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error: writeError || receiptError,
    ...rest,
  };
}

export function useAddMember() {
  const chainId = useChainId();
  const contract = getContract(chainId, 'TeamRegistry');
  const {
    writeContract,
    data: hash,
    isPending,
    error: writeError,
    ...rest
  } = useWriteContract();

  const addMember = (teamId: bigint | string, member: Address, role: number) => {
    writeContract({
      ...contract,
      functionName: 'addMember',
      args: [BigInt(teamId), member, role],
    });
  };

  const {
    isLoading: isConfirming,
    isSuccess,
    error: receiptError
  } = useWaitForTransactionReceipt({ hash });

  return {
    addMember,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error: writeError || receiptError,
    ...rest,
  };
}

export function useRemoveMember() {
  const chainId = useChainId();
  const contract = getContract(chainId, 'TeamRegistry');
  const {
    writeContract,
    data: hash,
    isPending,
    error: writeError,
    ...rest
  } = useWriteContract();

  const removeMember = (teamId: bigint | string, member: Address) => {
    writeContract({
      ...contract,
      functionName: 'removeMember',
      args: [BigInt(teamId), member],
    });
  };

  const {
    isLoading: isConfirming,
    isSuccess,
    error: receiptError
  } = useWaitForTransactionReceipt({ hash });

  return {
    removeMember,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error: writeError || receiptError,
    ...rest,
  };
}

export function useChangeMemberRole() {
  const chainId = useChainId();
  const contract = getContract(chainId, 'TeamRegistry');
  const {
    writeContract,
    data: hash,
    isPending,
    error: writeError,
    ...rest
  } = useWriteContract();

  const changeMemberRole = (teamId: bigint | string, member: Address, newRole: number) => {
    writeContract({
      ...contract,
      functionName: 'changeMemberRole',
      args: [BigInt(teamId), member, newRole],
    });
  };

  const {
    isLoading: isConfirming,
    isSuccess,
    error: receiptError
  } = useWaitForTransactionReceipt({ hash });

  return {
    changeMemberRole,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error: writeError || receiptError,
    ...rest,
  };
}
