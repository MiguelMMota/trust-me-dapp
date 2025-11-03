import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <nav className="border-b border-gray-200 dark:border-gray-700 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold">TrustMe</Link>
            <ConnectButton />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              TrustMe
            </h1>
            <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-200">
              Expertise-Weighted Voting
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              A decentralized platform where your vote weight is proportional to your proven expertise.
              Build credibility through validation challenges and participate in meaningful collective decision-making.
            </p>
          </div>

          <div className="flex gap-4 justify-center">
            <Link
              href="/dashboard"
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-lg transition-colors"
            >
              Launch App
            </Link>
            <Link
              href="#how-it-works"
              className="px-8 py-4 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-800 rounded-lg font-medium text-lg transition-colors"
            >
              Learn More
            </Link>
          </div>

          <div id="how-it-works" className="grid gap-8 md:grid-cols-3 mt-20 text-left">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold mb-2">Build Expertise</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Take objective challenges in topics like mathematics, history, languages, and software engineering.
                Your accuracy determines your expertise score (0-1000).
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
              <div className="text-4xl mb-4">⚖️</div>
              <h3 className="text-xl font-bold mb-2">Weighted Voting</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Your vote on a topic carries weight proportional to your expertise score.
                Experts have more influence in their domains, ensuring quality decisions.
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold mb-2">Track Progress</h3>
              <p className="text-gray-600 dark:text-gray-400">
                View your baseball card profile with expertise breakdown, accuracy stats,
                and recent activity. Earn ranks from Novice to Master.
              </p>
            </div>
          </div>

          <div className="mt-20 p-8 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <h3 className="text-2xl font-bold mb-4">Why TrustMe?</h3>
            <div className="grid md:grid-cols-2 gap-4 text-left">
              <div className="flex items-start gap-3">
                <span className="text-blue-600 text-2xl">✓</span>
                <div>
                  <strong>Fair & Objective:</strong> Everyone starts with equal baseline.
                  Prove yourself through performance.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-600 text-2xl">✓</span>
                <div>
                  <strong>Decentralized:</strong> No central authority.
                  Community-driven validation and voting.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-600 text-2xl">✓</span>
                <div>
                  <strong>Meritocratic:</strong> Your influence scales with demonstrated knowledge,
                  not social status or wealth.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-600 text-2xl">✓</span>
                <div>
                  <strong>Transparent:</strong> All scores, votes, and results are on-chain
                  and publicly verifiable.
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-200 dark:border-gray-700 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-end items-center gap-3">
            <span className="text-sm text-gray-600 dark:text-gray-400">v0.1.0</span>
            <a
              href="https://github.com/MiguelMMota/trust-me-dapp"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              aria-label="View source on GitHub"
            >
              <svg
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
