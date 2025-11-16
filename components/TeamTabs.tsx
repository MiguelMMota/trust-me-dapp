'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface TeamTabsProps {
  teamId: string;
}

export function TeamTabs({ teamId }: TeamTabsProps) {
  const pathname = usePathname();

  const tabs = [
    {
      name: 'Overview',
      href: `/team/${teamId}`,
      isActive: pathname === `/team/${teamId}`,
    },
    {
      name: 'Topics',
      href: `/team/${teamId}/topics`,
      isActive: pathname.startsWith(`/team/${teamId}/topics`),
    },
    {
      name: 'Polls',
      href: `/team/${teamId}/polls`,
      isActive: pathname.startsWith(`/team/${teamId}/polls`),
    },
    {
      name: 'Challenges',
      href: `/team/${teamId}/challenges`,
      isActive: pathname.startsWith(`/team/${teamId}/challenges`),
    },
  ];

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
      <nav className="flex -mb-px space-x-8">
        {tabs.map((tab) => (
          <Link
            key={tab.name}
            href={tab.href}
            className={`
              py-4 px-1 border-b-2 font-medium text-sm transition-colors
              ${
                tab.isActive
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }
            `}
          >
            {tab.name}
          </Link>
        ))}
      </nav>
    </div>
  );
}
