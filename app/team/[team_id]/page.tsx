'use client';

import { useAccount } from 'wagmi';
import { Navigation } from '@/components/Navigation';
import { NetworkSwitcher } from '@/components/NetworkSwitcher';
import { Footer } from '@/components/Footer';
import { ConnectButton } from '@rainbow-me/rainbowkit';

interface TeamPageProps {
  params: {
    team_id: string;
  };
}

export default function TeamPage({ params }: TeamPageProps) {
  const { address, isConnected } = useAccount();

  if (!isConnected) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Team Page</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Connect your wallet to view team details
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
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
            <h1 className="text-4xl font-bold mb-4">Team Page</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Team ID: <code className="bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded">{params.team_id}</code>
            </p>
            <p className="text-gray-500 dark:text-gray-500 text-sm">
              Team management features coming soon...
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
