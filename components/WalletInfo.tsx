'use client';

import { useAccount, useBalance, useChainId } from 'wagmi';
import { formatEther } from 'viem';

export function WalletInfo() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: balance } = useBalance({
    address: address,
  });

  if (!isConnected) {
    return (
      <div className="p-6 bg-gray-800/50 rounded-lg border border-gray-700">
        <p className="text-gray-400">Connect your wallet to see account information</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-800/50 rounded-lg border border-gray-700 space-y-4">
      <h2 className="text-xl font-semibold text-white">Wallet Information</h2>

      <div className="space-y-2">
        <div>
          <span className="text-gray-400">Address:</span>
          <p className="text-white font-mono text-sm break-all">{address}</p>
        </div>

        <div>
          <span className="text-gray-400">Chain ID:</span>
          <p className="text-white">{chainId}</p>
        </div>

        {balance && (
          <div>
            <span className="text-gray-400">Balance:</span>
            <p className="text-white">
              {parseFloat(formatEther(balance.value)).toFixed(4)} {balance.symbol}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
