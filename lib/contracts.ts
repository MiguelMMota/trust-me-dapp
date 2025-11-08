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
    Challenge: '0x0000000000000000000000000000000000000000',
    PeerRating: '0x0000000000000000000000000000000000000000',
    Poll: '0x0000000000000000000000000000000000000000',
    ReputationEngine: '0x0000000000000000000000000000000000000000',
    TopicRegistry: '0x0000000000000000000000000000000000000000',
    User: '0x0000000000000000000000000000000000000000',
  },
  // Sepolia testnet
  11155111: {
    Challenge: '0x62f7B186d6F183DC66B0Cd4300e766A227AF6454',
    PeerRating: '0xE6c17c2fcdfD1BD39f3D8136c5fF16ca71cc09BF',
    Poll: '0x06A2014F7674692cCEc4368f37704E40D7D5421c',
    ReputationEngine: '0xE90E5B97F9be1cf655229E783E8fbe7ce5c8dfA4',
    TopicRegistry: '0x51089AF5435B0EcB0a6a11BfB99ff921Ddb6B2c7',
    User: '0xA6b973d7662D6466cdC2D40F3B12F062d6f373b9',
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
