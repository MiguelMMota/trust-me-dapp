import { ConnectButton } from '@/components/ConnectButton';
import { WalletInfo } from '@/components/WalletInfo';
import { ContractInteraction } from '@/components/ContractInteraction';

export default function Home() {
  return (
    <div className="min-h-screen bg-blue-300">
      <nav className="border-b border-gray-700 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-white">TrustMe dApp</h1>
            <ConnectButton />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold text-white">
              Welcome to TrustMe dApp
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              A modern Web3 application built with Next.js, TypeScript, wagmi, and RainbowKit.
              Connect your wallet to get started.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <WalletInfo />

            <div className="p-6 bg-gray-800/50 rounded-lg border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-4">Features</h2>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  Multi-chain support (Ethereum, Polygon, Optimism, Arbitrum, Base)
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  Wallet connection via RainbowKit
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  Real-time balance display
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  TypeScript for type safety
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  Modern UI with Tailwind CSS
                </li>
              </ul>
            </div>
          </div>

          <ContractInteraction />

          <div className="p-6 bg-blue-900/20 rounded-lg border border-blue-700">
            <h2 className="text-xl font-semibold text-white mb-2">Getting Started</h2>
            <p className="text-gray-300">
              Connect your Web3 wallet using the button in the top right corner.
              Supported wallets include MetaMask, WalletConnect, Coinbase Wallet, and more.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
