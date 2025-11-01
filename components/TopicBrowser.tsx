'use client';

import { useState } from 'react';
import { useTopics, useTopic } from '@/hooks/useContracts';
import type { Topic } from '@/lib/types';

interface TopicNodeProps {
  topicId: number;
  level: number;
  onSelectTopic: (topicId: number, topic: any) => void;
  selectedTopicId?: number;
}

function TopicNode({ topicId, level, onSelectTopic, selectedTopicId }: TopicNodeProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { topic, childTopicIds } = useTopic(topicId);

  if (!topic) return null;

  const hasChildren = childTopicIds && childTopicIds.length > 0;
  const isSelected = selectedTopicId === topicId;

  return (
    <div className="ml-4">
      <div
        className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
          isSelected
            ? 'bg-blue-100 dark:bg-blue-900'
            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
        onClick={() => onSelectTopic(topicId, topic)}
      >
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            {isExpanded ? '▼' : '▶'}
          </button>
        )}
        {!hasChildren && <span className="w-4" />}
        <span className="font-medium">{topic.name}</span>
        <span className="text-xs text-gray-500">#{topicId}</span>
      </div>

      {isExpanded && hasChildren && (
        <div className="ml-4 mt-1">
          {childTopicIds.map((childId) => (
            <TopicNode
              key={childId}
              topicId={childId}
              level={level + 1}
              onSelectTopic={onSelectTopic}
              selectedTopicId={selectedTopicId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface TopicBrowserProps {
  onSelectTopic?: (topicId: number, topic: any) => void;
  selectedTopicId?: number;
}

export default function TopicBrowser({ onSelectTopic, selectedTopicId }: TopicBrowserProps) {
  const { rootTopicIds, topicCount } = useTopics();

  const handleSelectTopic = (topicId: number, topic: any) => {
    onSelectTopic?.(topicId, topic);
  };

  if (!rootTopicIds || rootTopicIds.length === 0) {
    return (
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
        <p className="text-yellow-800 dark:text-yellow-200">
          No topics found. Deploy contracts and create initial topics.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div className="mb-4">
        <h2 className="text-xl font-bold">Topic Taxonomy</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {topicCount} total topics
        </p>
      </div>

      <div className="space-y-1">
        {rootTopicIds.map((topicId) => (
          <TopicNode
            key={topicId}
            topicId={topicId}
            level={0}
            onSelectTopic={handleSelectTopic}
            selectedTopicId={selectedTopicId}
          />
        ))}
      </div>
    </div>
  );
}
