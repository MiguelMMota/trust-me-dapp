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
import PeerRatingABI from '@/abis/contracts/PeerRating.sol/PeerRating.json';


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
    Challenge: '0x60dE84d1fdc1A88596920A276B118510fedF4bca',
    PeerRating: '0xE9F480081bAF5AA165589fdbcB0b7526eFb77A37',
    Poll: '0x2b3a5DF903424B9428B272030f32A6A83f7349fe',
    ReputationEngine: '0xb071D1fBe32F655c2F4056F3A0a537be32a3A5a9',
    TopicRegistry: '0x40A37c94A1A630201a5D7d7CA4b0e79aD8574e7C',
    User: '0xd664ae1Be24D3E5b71D52f2e21F42541b3e8aB7d',
  },
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
