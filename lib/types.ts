/**
 * TypeScript types for TrustMe smart contract data structures
 */

// Topic types
export interface Topic {
  id: number;
  name: string;
  parentId: number;
  isActive: boolean;
  createdAt: bigint;
}

// User types
export interface UserProfile {
  userAddress: `0x${string}`;
  isRegistered: boolean;
  registrationTime: bigint;
  totalTopicsEngaged: number;
}

export interface UserTopicExpertise {
  score: number; // 0-1000
  totalChallenges: number;
  correctChallenges: number;
  lastActivityTime: bigint;
}

export interface ExpertiseStats {
  topicId: number;
  topicName: string;
  score: number;
  accuracy: number; // percentage
  totalChallenges: number;
  correctChallenges: number;
  lastActive: Date;
}

// Challenge types
export enum DifficultyLevel {
  Easy = 0,
  Medium = 1,
  Hard = 2,
  Expert = 3,
}

export enum ChallengeStatus {
  Active = 0,
  Inactive = 1,
  Disputed = 2,
}

export interface ChallengeData {
  id: bigint;
  creator: `0x${string}`;
  topicId: number;
  difficulty: DifficultyLevel;
  status: ChallengeStatus;
  questionHash: `0x${string}`;
  correctAnswerHash: `0x${string}`;
  createdAt: bigint;
  totalAttempts: number;
  correctAttempts: number;
}

export interface ChallengeAttempt {
  user: `0x${string}`;
  challengeId: bigint;
  answerHash: `0x${string}`;
  isCorrect: boolean;
  attemptedAt: bigint;
}

// Challenge with metadata (for UI)
export interface Challenge {
  id: bigint;
  question: string;
  options: string[];
  correctAnswer?: string; // Only known to creator
  topicId: number;
  topicName: string;
  difficulty: DifficultyLevel;
  status: ChallengeStatus;
  creator: `0x${string}`;
  createdAt: Date;
  totalAttempts: number;
  correctAttempts: number;
  successRate: number; // percentage
}

// Poll types
export enum PollStatus {
  Active = 0,
  Closed = 1,
  Finalized = 2,
}

export interface PollData {
  id: bigint;
  creator: `0x${string}`;
  topicId: number;
  question: string;
  questionHash: `0x${string}`;
  createdAt: bigint;
  endTime: bigint;
  status: PollStatus;
  optionCount: number;
  totalVoters: number;
}

export interface PollOption {
  optionId: number;
  optionText: string;
  totalWeight: bigint;
  voteCount: number;
}

export interface Vote {
  voter: `0x${string}`;
  pollId: bigint;
  selectedOption: number;
  weight: bigint;
  votedAt: bigint;
}

export interface PollResults {
  pollId: bigint;
  winningOption: number;
  totalWeight: bigint;
  optionWeights: bigint[];
  optionVoteCounts: number[];
}

// UI-specific types
export interface Poll {
  id: bigint;
  question: string;
  topicId: number;
  topicName: string;
  creator: `0x${string}`;
  createdAt: Date;
  endTime: Date;
  status: PollStatus;
  options: Array<{
    id: number;
    text: string;
    votes: number;
    weight: number;
    percentage: number;
    weightedPercentage: number;
  }>;
  totalVoters: number;
  userVote?: {
    option: number;
    weight: number;
  };
  isActive: boolean;
  timeRemaining?: string;
}

// Baseball Card types
export interface BaseballCard {
  address: `0x${string}`;
  registeredSince: Date;
  totalTopics: number;
  totalChallenges: number;
  overallAccuracy: number;
  topExpertise: Array<{
    topic: string;
    score: number;
    rank: string; // "Novice", "Intermediate", "Advanced", "Expert", "Master"
  }>;
  recentActivity: Array<{
    type: 'challenge' | 'poll' | 'vote';
    topic: string;
    timestamp: Date;
    result?: 'correct' | 'incorrect';
  }>;
  achievements: Array<{
    title: string;
    description: string;
    icon: string;
    unlockedAt: Date;
  }>;
}

// Utility types
export type Address = `0x${string}`;
export type Hash = `0x${string}`;

// Form types
export interface CreateChallengeForm {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  topicId: number;
  difficulty: DifficultyLevel;
}

export interface CreatePollForm {
  question: string;
  options: string[];
  topicId: number;
  durationInDays: number;
}

// Helper function to get difficulty label
export function getDifficultyLabel(difficulty: DifficultyLevel): string {
  switch (difficulty) {
    case DifficultyLevel.Easy:
      return 'Easy';
    case DifficultyLevel.Medium:
      return 'Medium';
    case DifficultyLevel.Hard:
      return 'Hard';
    case DifficultyLevel.Expert:
      return 'Expert';
    default:
      return 'Unknown';
  }
}

// Helper function to get expertise rank
export function getExpertiseRank(score: number): string {
  if (score < 200) return 'Novice';
  if (score < 400) return 'Beginner';
  if (score < 600) return 'Intermediate';
  if (score < 750) return 'Advanced';
  if (score < 900) return 'Expert';
  return 'Master';
}

// Helper function to get rank color
export function getRankColor(score: number): string {
  if (score < 200) return 'text-gray-500';
  if (score < 400) return 'text-green-500';
  if (score < 600) return 'text-blue-500';
  if (score < 750) return 'text-purple-500';
  if (score < 900) return 'text-orange-500';
  return 'text-red-500';
}
