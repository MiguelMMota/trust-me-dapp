'use client';

import { useState } from 'react';
import { Topic } from '@/lib/types';

interface TeamTopicManagerProps {
  teamId: string;
  globalTopics: Topic[]; // All global topics
  teamTopics: Topic[]; // Team-specific topics
  onToggleActive: (topicId: number, isActive: boolean) => void;
  isToggling?: boolean; // Whether a toggle transaction is in progress
}

export function TeamTopicManager({ teamId, globalTopics, teamTopics, onToggleActive, isToggling = false }: TeamTopicManagerProps) {
  const [expandedTopics, setExpandedTopics] = useState<Set<number>>(new Set());

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

  const renderTopic = (topic: Topic, isTeamTopic: boolean, level: number = 0) => {
    const childTopics = getChildTopics(topic.id, isTeamTopic ? teamTopics : globalTopics);
    const hasChildren = childTopics.length > 0;
    const isExpanded = expandedTopics.has(topic.id);

    return (
      <div key={topic.id} className={`${level > 0 ? 'ml-6 border-l-2 border-gray-200 dark:border-gray-700 pl-4' : ''}`}>
        <div className="flex items-center justify-between py-2 group">
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

            <span className={`font-medium ${!topic.isActive ? 'text-gray-400 dark:text-gray-500 line-through' : ''}`}>
              {topic.name}
            </span>

            {isTeamTopic && (
              <span className="px-2 py-0.5 text-xs rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                Team
              </span>
            )}

            {!topic.isActive && (
              <span className="px-2 py-0.5 text-xs rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                Inactive
              </span>
            )}
          </div>

          {isTeamTopic && (
            <button
              onClick={() => onToggleActive(topic.id, !topic.isActive)}
              disabled={isToggling}
              className={`opacity-0 group-hover:opacity-100 px-3 py-1 text-sm rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                topic.isActive
                  ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                  : 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
              }`}
            >
              {isToggling ? 'Processing...' : topic.isActive ? 'Deactivate' : 'Activate'}
            </button>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="mt-1">
            {childTopics.map(child => renderTopic(child, isTeamTopic, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const rootGlobalTopics = globalTopics.filter(t => t.parentId === 0);
  const rootTeamTopics = teamTopics.filter(t => t.parentId === 0);

  return (
    <div className="space-y-6">
      {/* Team Topics Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Team Topics</h3>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {teamTopics.length} topic{teamTopics.length !== 1 ? 's' : ''}
          </span>
        </div>

        {teamTopics.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 italic py-4">
            No team topics yet. Create one to get started!
          </p>
        ) : (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            {rootTeamTopics.map(topic => renderTopic(topic, true))}
          </div>
        )}
      </div>

      {/* Global Topics Reference */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Global Topics</h3>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Reference (read-only)
          </span>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          {rootGlobalTopics.map(topic => renderTopic(topic, false))}
        </div>

        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Global topics can be used as parent topics when creating team-specific topics
        </p>
      </div>
    </div>
  );
}
