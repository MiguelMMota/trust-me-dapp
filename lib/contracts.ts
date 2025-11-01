/**
 * TrustMe Smart Contract Configuration
 *
 * This file contains contract addresses and ABIs for all deployed contracts.
 * Update the addresses after deployment to Sepolia or other networks.
 */

import TopicRegistryABI from '@/abis/contracts/TopicRegistry.sol/TopicRegistry.json';
import UserABI from '@/abis/contracts/User.sol/User.json';
import ChallengeABI from '@/abis/contracts/Challenge.sol/Challenge.json';
import ReputationEngineABI from '@/abis/contracts/ReputationEngine.sol/ReputationEngine.json';
import PollABI from '@/abis/contracts/Poll.sol/Poll.json';

// Contract addresses - UPDATE THESE AFTER DEPLOYMENT
export const CONTRACTS = {
  // Local development (Anvil)
  31337: {
    TopicRegistry: '0x0000000000000000000000000000000000000000',
    User: '0x0000000000000000000000000000000000000000',
    Challenge: '0x0000000000000000000000000000000000000000',
    ReputationEngine: '0x0000000000000000000000000000000000000000',
    Poll: '0x0000000000000000000000000000000000000000',
  },
  // Sepolia testnet
  11155111: {
    TopicRegistry: '0x0000000000000000000000000000000000000000',
    User: '0x0000000000000000000000000000000000000000',
    Challenge: '0x0000000000000000000000000000000000000000',
    ReputationEngine: '0x0000000000000000000000000000000000000000',
    Poll: '0x0000000000000000000000000000000000000000',
  },
} as const;

// ABIs
export const ABIS = {
  TopicRegistry: TopicRegistryABI.abi,
  User: UserABI.abi,
  Challenge: ChallengeABI.abi,
  ReputationEngine: ReputationEngineABI.abi,
  Poll: PollABI.abi,
} as const;

// Get contract address for current network
export function getContractAddress(
  chainId: number,
  contractName: keyof typeof CONTRACTS[31337]
): `0x${string}` {
  const addresses = CONTRACTS[chainId as keyof typeof CONTRACTS];
  if (!addresses) {
    throw new Error(`No contract addresses found for chain ID ${chainId}`);
  }
  return addresses[contractName] as `0x${string}`;
}

// Get contract config for wagmi
export function getContract(chainId: number, contractName: keyof typeof CONTRACTS[31337]) {
  return {
    address: getContractAddress(chainId, contractName),
    abi: ABIS[contractName],
  };
}

// Type exports for TypeScript
export type ContractName = keyof typeof CONTRACTS[31337];
export type ChainId = keyof typeof CONTRACTS;
