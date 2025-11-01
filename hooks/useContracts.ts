/**
 * Custom hooks for TrustMe contract interactions
 */

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { getContract } from '@/lib/contracts';
import type { Address } from '@/lib/types';

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

export function useCreateTopic() {
  const chainId = useChainId();
  const contract = getContract(chainId, 'TopicRegistry');
  const { writeContract, data: hash, ...rest } = useWriteContract();

  const createTopic = (name: string, parentId: number) => {
    writeContract({
      ...contract,
      functionName: 'createTopic',
      args: [name, parentId],
    });
  };

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  return {
    createTopic,
    hash,
    isConfirming,
    isSuccess,
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
  const { writeContract, data: hash, ...rest } = useWriteContract();

  const registerUser = () => {
    writeContract({
      ...contract,
      functionName: 'registerUser',
    });
  };

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  return {
    registerUser,
    hash,
    isConfirming,
    isSuccess,
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
    query: { enabled: challengeId > 0n },
  });

  return {
    challenge: challenge as any,
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
  const { writeContract, data: hash, ...rest } = useWriteContract();

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

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  return {
    createChallenge,
    hash,
    isConfirming,
    isSuccess,
    ...rest,
  };
}

export function useAttemptChallenge() {
  const chainId = useChainId();
  const challengeContract = getContract(chainId, 'Challenge');
  const reputationContract = getContract(chainId, 'ReputationEngine');
  const { writeContract, data: hash, ...rest } = useWriteContract();

  const attemptChallenge = async (challengeId: bigint, answerHash: `0x${string}`) => {
    // First attempt the challenge
    await writeContract({
      ...challengeContract,
      functionName: 'attemptChallenge',
      args: [challengeId, answerHash],
    });
  };

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  return {
    attemptChallenge,
    hash,
    isConfirming,
    isSuccess,
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
    query: { enabled: pollId > 0n },
  });

  const { data: options } = useReadContract({
    ...contract,
    functionName: 'getPollOptions',
    args: [pollId],
    query: { enabled: pollId > 0n },
  });

  const { data: results } = useReadContract({
    ...contract,
    functionName: 'getPollResults',
    args: [pollId],
    query: { enabled: pollId > 0n },
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
    query: { enabled: pollId > 0n && !!userAddress },
  });

  return {
    vote: vote as any,
  };
}

export function useCreatePoll() {
  const chainId = useChainId();
  const contract = getContract(chainId, 'Poll');
  const { writeContract, data: hash, ...rest } = useWriteContract();

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

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  return {
    createPoll,
    hash,
    isConfirming,
    isSuccess,
    ...rest,
  };
}

export function useVotePoll() {
  const chainId = useChainId();
  const contract = getContract(chainId, 'Poll');
  const { writeContract, data: hash, ...rest } = useWriteContract();

  const vote = (pollId: bigint, optionId: number) => {
    writeContract({
      ...contract,
      functionName: 'vote',
      args: [pollId, optionId],
    });
  };

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  return {
    vote,
    hash,
    isConfirming,
    isSuccess,
    ...rest,
  };
}
