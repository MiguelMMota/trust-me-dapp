/**
 * TrustMe Smart Contract Configuration
 *
 * This file contains contract addresses and ABIs for all deployed contracts.
 * Update the addresses after deployment to Sepolia or other networks.
 */

import ChallengeABI from '@/abis/contracts/Challenge.json';
import PeerRatingABI from '@/abis/contracts/PeerRating.json';
import PollABI from '@/abis/contracts/Poll.json';
import ReputationEngineABI from '@/abis/contracts/ReputationEngine.json';
import TopicRegistryABI from '@/abis/contracts/TopicRegistry.json';
import UserABI from '@/abis/contracts/User.json';
import { ANVIL_CONTRACTS } from './anvil';
import { SEPOLIA_CONTRACTS } from './sepolia';


// Contract addresses - UPDATE THESE AFTER DEPLOYMENT
export const CONTRACTS = {
  // Local development (Anvil)
  31337: ANVIL_CONTRACTS,
  // Sepolia testnet
  11155111: SEPOLIA_CONTRACTS,
} as const;

// ABIs
export const ABIS = {
  TopicRegistry: TopicRegistryABI.abi,
  User: UserABI.abi,
  Challenge: ChallengeABI.abi,
  ReputationEngine: ReputationEngineABI.abi,
  Poll: PollABI.abi,
  PeerRating: PeerRatingABI.abi,
} as const;

// Get contract address for current network
export function getContractAddress(
  chainId: number,
  contractName: keyof typeof CONTRACTS[11155111]
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
