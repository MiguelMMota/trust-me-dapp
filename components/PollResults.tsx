'use client';

import { Poll } from '@/lib/types';

interface PollResultsProps {
  poll: Poll;
}

export function PollResults({ poll }: PollResultsProps) {
  // Find winning option (highest weighted percentage)
  const winningOption = poll.options.reduce((prev, current) =>
    current.weightedPercentage > prev.weightedPercentage ? current : prev
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-xl font-bold mb-6">Poll Results</h3>

      {/* Results Bars */}
      <div className="space-y-4 mb-6">
        {poll.options.map((option) => (
          <div key={option.id}>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">{option.text}</span>
                {option.id === winningOption.id && (
                  <span className="px-2 py-0.5 text-xs rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                    Winner
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {option.votes} vote{option.votes !== 1 ? 's' : ''}
              </div>
            </div>

            {/* Regular Vote Percentage Bar */}
            <div className="mb-1">
              <div className="flex justify-between items-center mb-1 text-xs text-gray-600 dark:text-gray-400">
                <span>Vote Count</span>
                <span>{option.percentage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 dark:bg-blue-400 h-2 rounded-full transition-all"
                  style={{ width: `${option.percentage}%` }}
                />
              </div>
            </div>

            {/* Weighted Vote Percentage Bar */}
            <div>
              <div className="flex justify-between items-center mb-1 text-xs text-gray-600 dark:text-gray-400">
                <span>Weighted (by expertise)</span>
                <span>{option.weightedPercentage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    option.id === winningOption.id
                      ? 'bg-green-500 dark:bg-green-400'
                      : 'bg-purple-500 dark:bg-purple-400'
                  }`}
                  style={{ width: `${option.weightedPercentage}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Results Summary */}
      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600 dark:text-gray-400 mb-1">Total Voters</p>
            <p className="text-2xl font-bold">{poll.totalVoters}</p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400 mb-1">Winning Option</p>
            <p className="text-lg font-bold">{winningOption.text}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {winningOption.weightedPercentage.toFixed(1)}% weighted votes
            </p>
          </div>
        </div>
      </div>

      {/* Explanation */}
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-4">
        <p className="mb-1">
          <strong>Vote Count:</strong> Each voter counts equally (1 person = 1 vote)
        </p>
        <p>
          <strong>Weighted:</strong> Votes are weighted by voter expertise in {poll.topicName}
        </p>
      </div>
    </div>
  );
}
