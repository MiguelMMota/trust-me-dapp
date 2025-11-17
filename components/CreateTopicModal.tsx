'use client';

import { useState } from 'react';
import { Topic } from '@/lib/types';

interface CreateTopicModalProps {
  teamId: string;
  availableTopics: Topic[]; // Global + team topics to select as parent
  onClose: () => void;
  onCreate: (name: string, parentId: number) => void;
}

export function CreateTopicModal({ teamId, availableTopics, onClose, onCreate }: CreateTopicModalProps) {
  const [topicName, setTopicName] = useState('');
  const [parentId, setParentId] = useState<number>(0); // 0 = root topic
  const [error, setError] = useState('');

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateTopicName(topicName)) {
      return;
    }

    // Call the onCreate handler which will trigger the smart contract transaction
    // The parent component handles transaction states and will close the modal on success
    onCreate(topicName.trim(), parentId);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Group topics by level for better display
  const rootTopics = availableTopics.filter(t => t.parentId === 0);
  const childTopics = availableTopics.filter(t => t.parentId !== 0);

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Create Team Topic</h2>

        <form onSubmit={handleSubmit}>
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
              placeholder="e.g., Advanced Cryptography"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              autoFocus
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
            >
              <option value={0}>None (Root Topic)</option>
              <optgroup label="Root Topics">
                {rootTopics.map(topic => (
                  <option key={topic.id} value={topic.id}>
                    {topic.name}
                  </option>
                ))}
              </optgroup>
              {childTopics.length > 0 && (
                <optgroup label="Subtopics">
                  {childTopics.map(topic => (
                    <option key={topic.id} value={topic.id}>
                      {topic.name}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Select a parent topic to create a subtopic, or leave as root
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!topicName}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Create Topic
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
