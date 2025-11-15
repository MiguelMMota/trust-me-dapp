'use client';

import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { TeamsDropdown } from './TeamsDropdown';

interface NavigationProps {
  address?: `0x${string}`;
}

export function Navigation({ address }: NavigationProps) {
  return (
    <nav className="border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-mono font-bold">TrustMe</Link>
          <div className="flex items-center gap-4">
            <Link
              href="/info"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              Info
            </Link>
            {address && (
              <>
                <Link
                  href={`/user/${address}`}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                >
                  My Profile
                </Link>
                <TeamsDropdown address={address} />
              </>
            )}
            <Link
              href="/leaderboard"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              Leaderboard
            </Link>
            <ConnectButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
