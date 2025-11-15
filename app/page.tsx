'use client';

import Link from 'next/link';
import { useAccount } from 'wagmi';
import { Footer } from '@/components/Footer';
import { Navigation } from '@/components/Navigation';

export default function Home() {
  const { address } = useAccount();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
      <Navigation address={address} />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-mono font-bold text-gray-900 dark:text-gray-100 mb-4">
              TrustMe
            </h1>
            <p className="text-lg text-gray-700 dark:text-gray-300">
              Believability-weighted collective decision making.
            </p>
          </div>

          <div className="space-y-4">
            <Link
              href="/dashboard"
              className="inline-block px-6 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded font-medium hover:bg-gray-700 dark:hover:bg-gray-300 transition-colors"
            >
              Open Dashboard
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
