'use client';

import { useState, useEffect } from 'react';
import { Poll, PollStatus } from '@/lib/types';
import { useVotePoll } from '@/hooks/useContracts';
import { formatContractError } from '@/lib/errors';

interface PollVoteCardProps {
  poll: Poll;
  userWeight: number; // User's voting weight from reputation
  onVote: (optionId: number) => void;
}

export function PollVoteCard({ poll, userWeight, onVote }: PollVoteCardProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    vote,
    isPending,
    isConfirming,
    isSuccess,
    error,
  } = useVotePoll();

  const hasVoted = poll.userVote !== undefined;
  const canVote = poll.status === PollStatus.Active && !hasVoted;
  const isSubmitting = isPending || isConfirming;

  // Handle successful vote
  useEffect(() => {
    if (isSuccess && selectedOption !== null) {
      onVote(selectedOption);
      setErrorMessage(null);
    }
  }, [isSuccess, selectedOption, onVote]);

  // Handle errors
  useEffect(() => {
    if (error) {
      setErrorMessage(formatContractError(error));
    }
  }, [error]);

  const handleVote = async () => {
    if (selectedOption === null) return;

    setErrorMessage(null);

    try {
      vote(poll.id, selectedOption);
    } catch (err) {
      console.error('Error voting:', err);
      setErrorMessage('Failed to submit vote. Please try again.');
    }
  };

  const getTimeRemaining = (): string => {
    const now = new Date();
    const diff = poll.endTime.getTime() - now.getTime();

    if (diff < 0) return 'Poll has ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ${hours} hour${hours > 1 ? 's' : ''} remaining`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minute${minutes > 1 ? 's' : ''} remaining`;
    return `${minutes} minute${minutes > 1 ? 's' : ''} remaining`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      {/* Poll Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">{poll.question}</h2>
        <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
          <span>Topic: <strong>{poll.topicName}</strong></span>
          <span>•</span>
          <span>{poll.totalVoters} voter{poll.totalVoters !== 1 ? 's' : ''}</span>
          <span>•</span>
          <span>{getTimeRemaining()}</span>
        </div>
      </div>

      {/* Voting Weight Info */}
      {canVote && (
        <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Your voting weight: <strong>{userWeight}</strong>
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Based on your expertise in {poll.topicName}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Already Voted Info */}
      {hasVoted && (
        <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <p className="text-sm font-medium text-green-900 dark:text-green-100">
                You voted for: <strong>{poll.options[poll.userVote.option].text}</strong>
              </p>
              <p className="text-xs text-green-700 dark:text-green-300">
                Your vote weight: {poll.userVote.weight}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Options */}
      <div className="space-y-3 mb-6">
        {poll.options.map((option) => (
          <label
            key={option.id}
            className={`
              flex items-start p-4 border rounded-lg transition-all cursor-pointer
              ${!canVote ? 'cursor-default' : 'hover:bg-gray-50 dark:hover:bg-gray-900/50'}
              ${selectedOption === option.id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700'
              }
              ${hasVoted && poll.userVote.option === option.id
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                : ''
              }
            `}
          >
            <input
              type="radio"
              name="poll-option"
              value={option.id}
              checked={selectedOption === option.id}
              onChange={() => setSelectedOption(option.id)}
              disabled={!canVote || isSubmitting}
              className="mt-1 mr-3"
            />
            <div className="flex-1">
              <div className="font-medium">{option.text}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {option.votes} vote{option.votes !== 1 ? 's' : ''} ({option.percentage.toFixed(1)}%)
                {poll.status !== PollStatus.Active && (
                  <span className="ml-2">
                    • Weighted: {option.weightedPercentage.toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
          </label>
        ))}
      </div>

      {/* Vote Button */}
      {canVote && (
        <>
          <button
            onClick={handleVote}
            disabled={selectedOption === null || isSubmitting}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isPending && 'Confirm in wallet...'}
            {isConfirming && 'Submitting vote...'}
            {!isPending && !isConfirming && 'Cast Your Vote'}
          </button>

          {/* Error Message */}
          {errorMessage && (
            <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-red-900 dark:text-red-100">
                    Failed to submit vote
                  </p>
                  <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                    {errorMessage}
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Poll Closed Message */}
      {poll.status !== PollStatus.Active && !hasVoted && (
        <div className="bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            This poll is {poll.status === PollStatus.Closed ? 'closed' : 'finalized'} and no longer accepting votes
          </p>
        </div>
      )}
    </div>
  );
}
