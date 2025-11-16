'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { NetworkSwitcher } from '@/components/NetworkSwitcher';
import { Footer } from '@/components/Footer';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { TeamTabs } from '@/components/TeamTabs';
import { Topic } from '@/lib/types';

interface CreatePollPageProps {
  params: {
    team_id: string;
  };
}

// Mock topics (global + team)
const mockTopics: Topic[] = [
  { id: 1, name: 'Technology', parentId: 0, isActive: true, createdAt: BigInt(0) },
  { id: 2, name: 'Web Development', parentId: 1, isActive: true, createdAt: BigInt(0) },
  { id: 3, name: 'Blockchain', parentId: 1, isActive: true, createdAt: BigInt(0) },
  { id: 100, name: 'Smart Contract Security', parentId: 3, isActive: true, createdAt: BigInt(0), teamId: BigInt(1) },
];

// Mock members
const mockMembers = [
  {
    address: '0x1234567890123456789012345678901234567890' as `0x${string}`,
    role: 'owner' as const,
    joinedAt: Date.now(),
  },
];

export default function CreatePollPage({ params }: CreatePollPageProps) {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [question, setQuestion] = useState('');
  const [topicId, setTopicId] = useState<number>(0);
  const [options, setOptions] = useState<string[]>(['', '']);
  const [durationDays, setDurationDays] = useState<number>(7);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const currentUserMember = mockMembers.find(m => m.address.toLowerCase() === address?.toLowerCase());
  const isMember = currentUserMember !== undefined;

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const validate = (): boolean => {
    if (!question.trim()) {
      setError('Question is required');
      return false;
    }
    if (question.length < 10) {
      setError('Question must be at least 10 characters');
      return false;
    }
    if (topicId === 0) {
      setError('Please select a topic');
      return false;
    }
    const filledOptions = options.filter(o => o.trim());
    if (filledOptions.length < 2) {
      setError('At least 2 options are required');
      return false;
    }
    if (durationDays < 1 || durationDays > 90) {
      setError('Duration must be between 1 and 90 days');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    // TODO: Call smart contract to create poll
    await new Promise(resolve => setTimeout(resolve, 1500));

    router.push(`/team/${params.team_id}/polls`);
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Create Poll</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Connect your wallet to create a poll
            </p>
            <ConnectButton />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isMember) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col">
      <NetworkSwitcher />
      <Navigation address={address} />

      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-4xl font-bold mb-2">Create Poll</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Create a new poll for your team members to vote on
            </p>
          </div>

          <TeamTabs teamId={params.team_id} />

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <form onSubmit={handleSubmit}>
              {/* Question */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Poll Question
                </label>
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="What should we decide on?"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSubmitting}
                />
              </div>

              {/* Topic */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Topic
                </label>
                <select
                  value={topicId}
                  onChange={(e) => setTopicId(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSubmitting}
                >
                  <option value={0}>Select a topic...</option>
                  {mockTopics.map(topic => (
                    <option key={topic.id} value={topic.id}>
                      {topic.name} {topic.teamId ? '(Team)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Options */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Options (2-10)
                  </label>
                  <button
                    type="button"
                    onClick={addOption}
                    disabled={options.length >= 10 || isSubmitting}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
                  >
                    + Add Option
                  </button>
                </div>
                <div className="space-y-2">
                  {options.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isSubmitting}
                      />
                      {options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOption(index)}
                          disabled={isSubmitting}
                          className="px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Duration (days)
                </label>
                <input
                  type="number"
                  value={durationDays}
                  onChange={(e) => setDurationDays(parseInt(e.target.value))}
                  min={1}
                  max={90}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSubmitting}
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Poll will end {durationDays} day{durationDays !== 1 ? 's' : ''} after creation
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                  className="px-6 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Creating Poll...' : 'Create Poll'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
