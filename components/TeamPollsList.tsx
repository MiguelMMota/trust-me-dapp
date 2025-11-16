'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Poll, PollStatus, getPollStatusColor, getPollStatusLabel } from '@/lib/types';

interface TeamPollsListProps {
  polls: Poll[];
  teamId: string;
}

type SortField = 'createdAt' | 'endTime' | 'totalVoters' | 'topicName';
type SortDirection = 'asc' | 'desc';

export function TeamPollsList({ polls, teamId }: TeamPollsListProps) {
  const [statusFilter, setStatusFilter] = useState<PollStatus | 'all'>('all');
  const [topicFilter, setTopicFilter] = useState('');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Get unique topics from polls
  const uniqueTopics = Array.from(new Set(polls.map(p => p.topicName))).sort();

  // Filter polls
  const filteredPolls = polls.filter(poll => {
    if (statusFilter !== 'all' && poll.status !== statusFilter) return false;
    if (topicFilter && poll.topicName !== topicFilter) return false;
    return true;
  });

  // Sort polls
  const sortedPolls = [...filteredPolls].sort((a, b) => {
    let aVal, bVal;

    switch (sortField) {
      case 'createdAt':
        aVal = a.createdAt.getTime();
        bVal = b.createdAt.getTime();
        break;
      case 'endTime':
        aVal = a.endTime.getTime();
        bVal = b.endTime.getTime();
        break;
      case 'totalVoters':
        aVal = a.totalVoters;
        bVal = b.totalVoters;
        break;
      case 'topicName':
        aVal = a.topicName;
        bVal = b.topicName;
        break;
    }

    if (sortDirection === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return '↕';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const getTimeRemaining = (endTime: Date): string => {
    const now = new Date();
    const diff = endTime.getTime() - now.getTime();

    if (diff < 0) return 'Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h left`;
    return 'Less than 1h left';
  };

  if (polls.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400 mb-4">No polls yet</p>
        <Link
          href={`/team/${teamId}/polls/create`}
          className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          Create First Poll
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex gap-4 mb-4 flex-wrap">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-sm"
          >
            <option value="all">All</option>
            <option value={PollStatus.Active}>Active</option>
            <option value={PollStatus.Closed}>Closed</option>
            <option value={PollStatus.Finalized}>Finalized</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Topic
          </label>
          <select
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-sm"
          >
            <option value="">All Topics</option>
            {uniqueTopics.map(topic => (
              <option key={topic} value={topic}>{topic}</option>
            ))}
          </select>
        </div>

        <div className="ml-auto flex items-end">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Showing {sortedPolls.length} of {polls.length} polls
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300">
                Question
              </th>
              <th
                className="text-left py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900"
                onClick={() => handleSort('topicName')}
              >
                Topic {getSortIcon('topicName')}
              </th>
              <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300">
                Status
              </th>
              <th
                className="text-left py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900"
                onClick={() => handleSort('totalVoters')}
              >
                Voters {getSortIcon('totalVoters')}
              </th>
              <th
                className="text-left py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900"
                onClick={() => handleSort('endTime')}
              >
                Time {getSortIcon('endTime')}
              </th>
              <th
                className="text-left py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900"
                onClick={() => handleSort('createdAt')}
              >
                Created {getSortIcon('createdAt')}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedPolls.map((poll) => (
              <tr
                key={poll.id.toString()}
                className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
              >
                <td className="py-3 px-4">
                  <Link
                    href={`/team/${teamId}/polls/${poll.id.toString()}`}
                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    {poll.question}
                  </Link>
                </td>
                <td className="py-3 px-4 text-sm">{poll.topicName}</td>
                <td className="py-3 px-4">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium uppercase ${getPollStatusColor(poll.status)}`}>
                    {getPollStatusLabel(poll.status)}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm">{poll.totalVoters}</td>
                <td className="py-3 px-4 text-sm">
                  {poll.status === PollStatus.Active ? getTimeRemaining(poll.endTime) : '-'}
                </td>
                <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                  {poll.createdAt.toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sortedPolls.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">No polls match your filters</p>
        </div>
      )}
    </div>
  );
}
