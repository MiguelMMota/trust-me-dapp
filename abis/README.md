# TrustMe dApp - Contract ABIs

This directory contains the Application Binary Interface (ABI) files for the TrustMe smart contracts. These ABIs are essential for the frontend to interact with deployed contracts on the blockchain.

## Overview

ABIs define the interface for smart contract interactions, including:
- Function signatures and parameters
- Event definitions
- Error types
- State variable accessors

The frontend imports these ABIs to create typed contract instances using wagmi/viem.

## Core Application Contracts

The TrustMe dApp consists of 5 main smart contracts:

### 1. **TopicRegistry** (`contracts/TopicRegistry.sol/TopicRegistry.json`)
Manages the hierarchical topic taxonomy system.

**Key Features:**
- Create topics with parent-child relationships (e.g., Tech → Software → Backend → Python)
- Check topic ancestry and descendants
- Validate topic existence and status (active/inactive)
- Support for multi-level topic hierarchies

**Main Functions:**
- `createTopic(string name, uint256 parentId)` - Create a new topic
- `getTopicPath(uint256 topicId)` - Get full path from root to topic
- `isAncestorOf(uint256 ancestorId, uint256 descendantId)` - Check relationships

### 2. **User** (`contracts/User.sol/User.json`)
Manages user profiles and expertise tracking.

**Key Features:**
- User registration and profile management
- Topic-specific expertise scores (50-1000 range)
- Challenge attempt history (correct/incorrect counts)
- Accuracy calculations per topic (0-10000 basis points)

**Main Functions:**
- `registerUser(string username, string profileData)` - Register new user
- `getUserProfile(address userAddress)` - Get user details
- `getExpertise(address userAddress, uint256 topicId)` - Get topic expertise
- `getUserAccuracy(address userAddress, uint256 topicId)` - Get accuracy percentage

### 3. **Challenge** (`contracts/Challenge.sol/Challenge.json`)
Handles the challenge creation and attempt system.

**Key Features:**
- Create topic-based challenges
- Track challenge attempts and results
- Validate answers and update user statistics
- Support for multiple challenge types/difficulties

**Main Functions:**
- `createChallenge(...)` - Create new challenge
- `attemptChallenge(uint256 challengeId, bytes answer)` - Submit challenge attempt
- `getChallenge(uint256 challengeId)` - Retrieve challenge details

### 4. **ReputationEngine** (`contracts/ReputationEngine.sol/ReputationEngine.json`)
Calculates and updates user expertise scores based on challenge performance.

**Key Features:**
- Time-weighted scoring algorithm (50-1000 range)
- Accuracy and volume factors
- Exponential time decay for recent activity
- Batch score recalculation
- Voting weight calculation for polls

**Main Functions:**
- `calculateScore(address userAddress, uint256 topicId)` - Calculate expertise score
- `getVotingWeight(address userAddress, uint256 topicId)` - Get voting power
- `updateScores(address[] users, uint256[] topics)` - Batch update

**Scoring Formula:**
```
baseScore = 500
accuracyFactor = (correct - incorrect) / total
volumeFactor = log(totalAttempts + 1)
timeDecay = e^(-k * daysSinceLastAttempt)
finalScore = baseScore + (accuracyFactor * volumeFactor * timeDecay * 250)
```

### 5. **Poll** (`contracts/Poll.sol/Poll.json`)
Manages topic-based voting with expertise-weighted votes.

**Key Features:**
- Create polls associated with topics
- Weighted voting based on user expertise
- Vote tracking and results calculation
- Time-bounded voting periods

**Main Functions:**
- `createPoll(string question, uint256 topicId, ...)` - Create new poll
- `vote(uint256 pollId, uint256 optionId)` - Cast vote
- `getPollResults(uint256 pollId)` - Get voting results

## File Structure

```
abis/
├── README.md (this file)
└── contracts/
    ├── TopicRegistry.sol/
    │   └── TopicRegistry.json ⭐ Core contract
    ├── User.sol/
    │   └── User.json ⭐ Core contract
    ├── Challenge.sol/
    │   └── Challenge.json ⭐ Core contract
    ├── ReputationEngine.sol/
    │   └── ReputationEngine.json ⭐ Core contract
    ├── Poll.sol/
    │   └── Poll.json ⭐ Core contract
    └── [24 development/testing utility files]
```

### Development Files
The directory also contains 24 Forge/Foundry testing utility ABIs (e.g., `Test.json`, `StdCheats.json`, `Vm.json`). These are not used by the frontend but are included for completeness from the contract compilation process.

## Usage in Application

ABIs are imported in `lib/contracts.ts`:

```typescript
import TopicRegistryABI from '@/abis/contracts/TopicRegistry.sol/TopicRegistry.json';
import UserABI from '@/abis/contracts/User.sol/User.json';
import ChallengeABI from '@/abis/contracts/Challenge.sol/Challenge.json';
import ReputationEngineABI from '@/abis/contracts/ReputationEngine.sol/ReputationEngine.json';
import PollABI from '@/abis/contracts/Poll.sol/Poll.json';
```

These ABIs are then used with wagmi hooks throughout the application:

- **Topic Management**: `useTopics()`, `useCreateTopic()` - components/topics
- **User Profiles**: `useUserProfile()`, `useRegisterUser()` - app/profile, app/user
- **Challenges**: `useCreateChallenge()`, `useAttemptChallenge()` - components/ContractInteraction
- **Polls**: `useCreatePoll()`, `useVotePoll()` - app/dashboard

## Contract Addresses

Contract addresses are configured in `lib/contracts.ts` for different networks:

**Supported Networks:**
- **Anvil (Local)**: Chain ID 31337 - For local development with Foundry
- **Sepolia (Testnet)**: Chain ID 11155111 - For testnet deployment

⚠️ **IMPORTANT**: After deploying contracts, update the addresses in `lib/contracts.ts`:

```typescript
export const CONTRACTS = {
  TopicRegistry: '0x...', // Update after deployment
  User: '0x...',
  Challenge: '0x...',
  ReputationEngine: '0x...',
  Poll: '0x...',
};
```

## Source

These ABIs are generated from Solidity smart contracts compiled with Foundry/Forge. The source contracts are maintained in a separate repository.

**Contract Compiler**: Foundry (Forge)
**Solidity Version**: ^0.8.0

## Updating ABIs

When contracts are updated and redeployed:

1. Recompile contracts with Forge: `forge build`
2. Copy updated JSON files from `out/` directory to this `abis/` directory
3. Verify ABI changes don't break existing frontend code
4. Update contract addresses in `lib/contracts.ts`
5. Test all contract interactions in the frontend

## Version Tracking

ABIs should be version-controlled in git to:
- Track interface changes over time
- Ensure consistent contract interactions across deployments
- Enable rollback if needed
- Maintain deployment history

---

**Note**: Always ensure ABIs match the deployed contract versions. Mismatched ABIs will cause transaction failures or incorrect data parsing.
