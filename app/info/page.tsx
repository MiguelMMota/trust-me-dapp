'use client';

import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { Footer } from '@/components/Footer';

export default function Info() {
  const { address } = useAccount();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
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
                <Link
                  href={`/user/${address}`}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                >
                  My Profile
                </Link>
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

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="space-y-12">
          <div>
            <h1 className="text-4xl font-mono font-bold text-gray-900 dark:text-gray-100 mb-4">
              TrustMe
            </h1>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">
              Believability-weighted collective decision making.
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              A decentralized platform where your vote weight is proportional to your proven expertise.
              Build credibility through validation challenges and participate in meaningful collective decision-making.
            </p>
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">How it works</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold mb-2">Build Expertise</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Take objective challenges in topics like mathematics, history, languages, and software engineering.
                    Your accuracy determines your expertise score (0-1000).
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-bold mb-2">Weighted Voting</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Your vote on a topic carries weight proportional to your expertise score.
                    Experts have more influence in their domains, ensuring quality decisions.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-bold mb-2">Track Progress</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    View your baseball card profile with expertise breakdown, accuracy stats,
                    and recent activity. Earn ranks from Novice to Master.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Key Features</h2>
              <div className="space-y-3">
                <div>
                  <strong>Fair & Objective:</strong> Everyone starts with equal baseline. Prove yourself through performance.
                </div>
                <div>
                  <strong>Decentralized:</strong> No central authority. Community-driven validation and voting.
                </div>
                <div>
                  <strong>Meritocratic:</strong> Your influence scales with demonstrated knowledge, not social status or wealth.
                </div>
                <div>
                  <strong>Transparent:</strong> All scores, votes, and results are on-chain and publicly verifiable.
                </div>
              </div>
            </div>

            <div>
              <Link
                href="/dashboard"
                className="inline-block px-6 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded font-medium hover:bg-gray-700 dark:hover:bg-gray-300 transition-colors"
              >
                Open Dashboard
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
