'use client';

import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { sepolia } from 'wagmi/chains';

export function NetworkSwitcher() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const supportedChainIds = [31337, 11155111]; // Anvil and Sepolia
  const isSupported = supportedChainIds.includes(chainId);

  if (!isConnected || isSupported) {
    return null;
  }

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4">
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-400 dark:border-yellow-600 rounded-lg p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="text-2xl">⚠️</div>
          <div className="flex-1">
            <h3 className="font-bold text-yellow-900 dark:text-yellow-200 mb-1">
              Unsupported Network
            </h3>
            <p className="text-sm text-yellow-800 dark:text-yellow-300 mb-3">
              TrustMe is currently deployed on Sepolia testnet. Please switch your network to continue.
            </p>
            <button
              onClick={() => switchChain({ chainId: sepolia.id })}
              className="w-full px-6 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded font-medium hover:bg-gray-700 dark:hover:bg-gray-300 transition-colors"
            >
              Switch to Sepolia
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
