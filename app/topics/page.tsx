'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Navigation } from '@/components/Navigation';
import { NetworkSwitcher } from '@/components/NetworkSwitcher';
import { Footer } from '@/components/Footer';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Topic } from '@/lib/types';
import {
  useAllTopics,
  useCreateTopic,
} from '@/hooks/useContracts';
import { formatContractError } from '@/lib/errors';

export default function TopicsPage() {
  const { address, isConnected } = useAccount();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [topicName, setTopicName] = useState('');
  const [parentId, setParentId] = useState<number>(0);
  const [error, setError] = useState('');
  const [expandedTopics, setExpandedTopics] = useState<Set<number>>(new Set());

  // Fetch all global topics
  const { topics: globalTopics, isLoading: isLoadingTopics } = useAllTopics();

  // Create topic hook
  const {
    createTopic,
    isPending: isCreating,
    isConfirming: isConfirmingCreate,
    isSuccess: isCreateSuccess,
    error: createError,
  } = useCreateTopic();

  // Reset create modal on success
  useEffect(() => {
    if (isCreateSuccess) {
      setShowCreateModal(false);
      setTopicName('');
      setParentId(0);
      setError('');
    }
  }, [isCreateSuccess]);

  const validateTopicName = (name: string): boolean => {
    if (!name.trim()) {
      setError('Topic name is required');
      return false;
    }
    if (name.length < 2) {
      setError('Topic name must be at least 2 characters');
      return false;
    }
    if (name.length > 50) {
      setError('Topic name must be less than 50 characters');
      return false;
    }
    setError('');
    return true;
  };

  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateTopicName(topicName)) {
      return;
    }

    createTopic(topicName.trim(), parentId);
  };

  const toggleExpand = (topicId: number) => {
    const newExpanded = new Set(expandedTopics);
    if (newExpanded.has(topicId)) {
      newExpanded.delete(topicId);
    } else {
      newExpanded.add(topicId);
    }
    setExpandedTopics(newExpanded);
  };

  const getChildTopics = (parentId: number, topics: Topic[]) => {
    return topics.filter(t => t.parentId === parentId);
  };

  const renderTopic = (topic: Topic, level: number = 0) => {
    const childTopics = getChildTopics(topic.id, globalTopics);
    const hasChildren = childTopics.length > 0;
    const isExpanded = expandedTopics.has(topic.id);

    return (
      <div key={topic.id} className={`${level > 0 ? 'ml-6 border-l-2 border-gray-200 dark:border-gray-700 pl-4' : ''}`}>
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2 flex-1">
            {hasChildren && (
              <button
                onClick={() => toggleExpand(topic.id)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <svg
                  className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
            {!hasChildren && <div className="w-4" />}

            <span className="font-medium">{topic.name}</span>

            <span className="text-xs text-gray-500 dark:text-gray-400">
              ID: {topic.id}
            </span>

            {!topic.isActive && (
              <span className="px-2 py-0.5 text-xs rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                Inactive
              </span>
            )}
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="mt-1">
            {childTopics.map(child => renderTopic(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const rootTopics = globalTopics.filter(t => t.parentId === 0);

  if (!isConnected) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Global Topics</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Connect your wallet to manage global topics
            </p>
            <ConnectButton />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <NetworkSwitcher />
      <Navigation address={address} />

      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-4xl font-bold mb-2">Global Topics</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage global topics used across all teams for polls and challenges
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Topics</h2>
              <button
                onClick={() => setShowCreateModal(true)}
                disabled={isCreating || isConfirmingCreate}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating || isConfirmingCreate ? 'Creating...' : 'Create Topic'}
              </button>
            </div>

            {/* Transaction status messages */}
            {createError && (
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-800 dark:text-red-200 text-sm">
                  Error creating topic: {formatContractError(createError)}
                </p>
              </div>
            )}
            {isConfirmingCreate && (
              <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-blue-800 dark:text-blue-200 text-sm">
                  Confirming transaction...
                </p>
              </div>
            )}
            {isCreateSuccess && (
              <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-green-800 dark:text-green-200 text-sm">
                  Topic created successfully!
                </p>
              </div>
            )}

            {isLoadingTopics ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">Loading topics...</p>
              </div>
            ) : globalTopics.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 mb-4">No global topics yet</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Create a topic to get started
                </p>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                {rootTopics.map(topic => renderTopic(topic))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Topic Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCreateModal(false);
              setError('');
            }
          }}
        >
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Create Global Topic</h2>

            <form onSubmit={handleCreateTopic}>
              <div className="mb-4">
                <label
                  htmlFor="topicName"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Topic Name
                </label>
                <input
                  type="text"
                  id="topicName"
                  value={topicName}
                  onChange={(e) => {
                    setTopicName(e.target.value);
                    setError('');
                  }}
                  placeholder="e.g., Blockchain Technology"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  autoFocus
                  disabled={isCreating || isConfirmingCreate}
                />
                {error && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
                )}
              </div>

              <div className="mb-6">
                <label
                  htmlFor="parentId"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Parent Topic (Optional)
                </label>
                <select
                  id="parentId"
                  value={parentId}
                  onChange={(e) => setParentId(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  disabled={isCreating || isConfirmingCreate}
                >
                  <option value={0}>None (Root Topic)</option>
                  {globalTopics.map(topic => (
                    <option key={topic.id} value={topic.id}>
                      {topic.name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Select a parent topic to create a subtopic, or leave as root
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setError('');
                  }}
                  disabled={isCreating || isConfirmingCreate}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!topicName || isCreating || isConfirmingCreate}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isCreating && 'Confirm in wallet...'}
                  {isConfirmingCreate && 'Creating...'}
                  {!isCreating && !isConfirmingCreate && 'Create Topic'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
