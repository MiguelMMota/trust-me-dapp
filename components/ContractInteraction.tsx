'use client';

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { useState } from 'react';

// Example: Simple storage contract ABI (you can replace with your own)
const STORAGE_ABI = [
  {
    inputs: [],
    name: 'retrieve',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'num', type: 'uint256' }],
    name: 'store',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export function ContractInteraction() {
  const { isConnected } = useAccount();
  const [valueToStore, setValueToStore] = useState('');

  // Example contract address (you'll need to deploy your own or use a real one)
  const contractAddress = '0x0000000000000000000000000000000000000000';

  // Read from contract
  const { data: storedValue, refetch } = useReadContract({
    address: contractAddress,
    abi: STORAGE_ABI,
    functionName: 'retrieve',
  });

  // Write to contract
  const { writeContract, data: hash, isPending } = useWriteContract();

  // Wait for transaction
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handleStore = async () => {
    try {
      writeContract({
        address: contractAddress,
        abi: STORAGE_ABI,
        functionName: 'store',
        args: [BigInt(valueToStore)],
      });
    } catch (error) {
      console.error('Error storing value:', error);
    }
  };

  if (!isConnected) {
    return (
      <div className="p-6 bg-gray-800/50 rounded-lg border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">Smart Contract Interaction</h2>
        <p className="text-gray-400">Connect your wallet to interact with smart contracts</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-800/50 rounded-lg border border-gray-700 space-y-6">
      <h2 className="text-xl font-semibold text-white">Smart Contract Interaction</h2>

      <div className="space-y-4">
        <div className="p-4 bg-gray-900/50 rounded-lg">
          <h3 className="text-lg font-medium text-white mb-2">Read from Contract</h3>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Stored Value:</span>
            <span className="text-white font-mono">
              {storedValue !== undefined ? storedValue.toString() : 'N/A'}
            </span>
          </div>
          <button
            onClick={() => refetch()}
            className="mt-3 w-full px-6 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded font-medium hover:bg-gray-700 dark:hover:bg-gray-300 transition-colors"
          >
            Refresh Value
          </button>
        </div>

        <div className="p-4 bg-gray-900/50 rounded-lg">
          <h3 className="text-lg font-medium text-white mb-2">Write to Contract</h3>
          <div className="space-y-3">
            <input
              type="number"
              value={valueToStore}
              onChange={(e) => setValueToStore(e.target.value)}
              placeholder="Enter value to store"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleStore}
              disabled={!valueToStore || isPending || isConfirming}
              className="w-full px-6 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded font-medium hover:bg-gray-700 dark:hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isPending ? 'Confirming...' : isConfirming ? 'Processing...' : 'Store Value'}
            </button>
            {isSuccess && (
              <p className="text-green-400 text-sm">
                Transaction successful! Hash: {hash?.slice(0, 10)}...
              </p>
            )}
          </div>
        </div>

        <div className="p-4 bg-yellow-900/20 rounded-lg border border-yellow-700">
          <p className="text-yellow-200 text-sm">
            <strong>Note:</strong> This is a demo component. Replace the contract address
            and ABI with your actual smart contract to enable real interactions.
          </p>
        </div>
      </div>
    </div>
  );
}
