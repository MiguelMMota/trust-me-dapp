# TrustMe dApp

Expertise-weighted voting system where your influence scales with demonstrated knowledge, not wealth or social status.

## Overview

TrustMe is a decentralized platform built on Ethereum that revolutionizes collective decision-making through expertise-based voting weights. Users build domain-specific credibility by answering objective validation challenges, and their voting power in polls is proportional to their proven expertise in that topic.

### Key Features

- **Expertise-Based Voting**: Your vote weight (0-1000) is determined by your performance in validation challenges
- **Domain-Specific Credibility**: Build separate expertise scores across different topics (Math, History, Languages, Software Engineering)
- **Fair & Meritocratic**: Everyone starts with equal baseline (score: 50). Prove yourself through performance.
- **Time-Weighted Scoring**: Recent activity weighted more heavily to prevent credential staleness
- **Transparent & Decentralized**: All scores, votes, and results are on-chain and publicly verifiable
- **Baseball Card Profiles**: Visual representation of expertise across domains with ranks (Novice → Master)

## Live Demo

🚀 **Coming soon after Sepolia deployment**

## Tech Stack

### Smart Contracts (Foundry)
- **Language**: Solidity ^0.8.24
- **Framework**: Foundry
- **Network**: Sepolia Testnet (for now)
- **Contracts**: 5 core contracts
  - TopicRegistry: Hierarchical topic taxonomy
  - User: Profile and expertise tracking
  - Challenge: Objective validation questions
  - ReputationEngine: Scoring algorithm
  - Poll: Weighted voting system

### Frontend (Next.js)
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Web3 Libraries**:
  - wagmi v2.19 - React Hooks for Ethereum
  - viem v2.38 - TypeScript Interface for Ethereum
  - RainbowKit v2.2 - Beautiful wallet connection UI
- **Styling**: Tailwind CSS 4
- **State Management**: TanStack Query v5
- **Charts**: Recharts (for expertise visualization)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Web3 wallet (MetaMask, Coinbase Wallet, etc.)
- Foundry (for smart contract development)
- WalletConnect Project ID ([get one here](https://cloud.walletconnect.com))

### Installation

#### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd trust-me-dapp
```

#### 2. Install Frontend Dependencies

```bash
npm install
```

#### 3. Configure Environment

Create `.env.local` file:
```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

#### 4. Smart Contracts Setup

The smart contracts are in a separate repository linked via symlink:

```bash
# ABIs are automatically synced from ../trust-me-contracts/out
ls -la abis/contracts  # Should show symlink to contract ABIs
```

#### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Smart Contracts

### Contract Addresses (Sepolia Testnet)

Update these in `/lib/contracts.ts` after deployment:

```typescript
TopicRegistry: '0x...'
User: '0x...'
Challenge: '0x...'
ReputationEngine: '0x...'
Poll: '0x...'
```

### Deploying Contracts

See the [trust-me-contracts repository](../trust-me-contracts/) for deployment instructions.

```bash
cd ../trust-me-contracts
forge script script/Deploy.s.sol:DeployScript --rpc-url sepolia --broadcast --verify
```

## Project Structure

```
trust-me-dapp/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── dashboard/page.tsx          # Main dashboard
│   ├── profile/[address]/page.tsx  # Baseball card profiles
│   ├── challenges/                 # Challenge pages (TODO)
│   ├── polls/                      # Poll pages (TODO)
│   ├── layout.tsx                  # Root layout
│   ├── providers.tsx               # Web3 providers
│   └── globals.css                 # Global styles
├── components/
│   ├── TopicBrowser.tsx            # Topic taxonomy explorer
│   ├── ConnectButton.tsx           # Wallet connection
│   └── WalletInfo.tsx              # Wallet display
├── hooks/
│   └── useContracts.ts             # Contract interaction hooks
├── lib/
│   ├── contracts.ts                # Contract addresses & ABIs
│   └── types.ts                    # TypeScript types
├── abis/
│   └── contracts/                  # Symlink to smart contract ABIs
└── config/
    └── wagmi.ts                    # Wagmi configuration
```

## How It Works

### 1. Build Expertise

- Take objective validation challenges in your areas of knowledge
- Challenges are tagged by topic (e.g., Math → Algebra → Linear Algebra)
- Answer hashes stored on-chain for privacy and verifiability
- Difficulty levels: Easy, Medium, Hard, Expert

### 2. Earn Reputation

Scoring algorithm:
```
score = (accuracy * 0.7) + (volume * 0.3)

accuracy: % of correct answers (0-1000)
volume: sqrt(total_challenges) * 10 (capped at 200)
time_decay:
  - Last 30 days: 100% weight
  - 30-60 days: 75% weight
  - 60+ days: 50% weight
```

Score distribution:
- 50: New user
- 380: 50% accuracy, 10 challenges
- 570: 70% accuracy, 50 challenges
- 820: 90% accuracy, 100 challenges
- 950+: 95%+ accuracy, 200+ challenges

### 3. Weighted Voting

- Create or vote on polls tagged to specific topics
- Your vote weight = your expertise score in that topic
- Results calculated by summing weighted votes
- Full transparency: see vote distribution and percentages

### 4. Track Progress

View your "Baseball Card" profile:
- Overall stats (total challenges, accuracy, polls voted)
- Expertise breakdown by topic
- Rank badges (Novice, Beginner, Intermediate, Advanced, Expert, Master)
- Recent activity feed

## Core Contracts

### TopicRegistry
- Manages hierarchical topic structure
- Admin-controlled topic creation (can be migrated to DAO later)
- Topics can have parent-child relationships

### User
- User registration and profiles
- Expertise scores per topic with efficient storage packing
- Challenge attempt tracking
- Stats aggregation

### Challenge
- Create objective validation questions
- Answer verification via hash comparison
- Difficulty-based scoring
- Challenge statistics and history

### ReputationEngine
- Implements scoring algorithm
- Time-weighted calculations
- Score preview functionality
- Batch recalculation support

### Poll
- Create weighted polls with multiple options
- Vote with expertise-based weight
- Poll lifecycle management (Active → Closed → Finalized)
- Results calculation with percentages

## Development

### Running Tests

Smart contracts (in `trust-me-contracts` repo):
```bash
cd ../trust-me-contracts
forge test -vv
```

Frontend:
```bash
npm run lint
npm run build  # Check for build errors
```

### Adding New Features

1. **New Contract Function**:
   - Add to contract in `trust-me-contracts`
   - Run `forge build` to regenerate ABIs
   - ABIs auto-sync to dapp via symlink
   - Create hook in `hooks/useContracts.ts`

2. **New UI Component**:
   - Add component in `components/`
   - Use contract hooks from `hooks/useContracts.ts`
   - Follow existing patterns for loading/error states

## Deployment

### Frontend (Vercel)

1. Push to GitHub
2. Import to [Vercel](https://vercel.com)
3. Add environment variable: `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
4. Deploy

### Smart Contracts (Sepolia)

See `trust-me-contracts/README.md` for detailed instructions.

## Roadmap

### MVP (Current)
- ✅ Core smart contracts
- ✅ User registration and expertise tracking
- ✅ Topic taxonomy browser
- ✅ Dashboard and baseball card profiles
- ⏳ Challenge creation and taking
- ⏳ Poll creation and voting

### V2
- Challenge pools with categories
- Leaderboards (global and per-topic)
- Achievement system
- Reputation decay implementation
- The Graph indexing for faster queries

### V3
- DAO governance for topic management
- Peer validation for subjective questions
- NFT badges for achievements
- Multi-signature challenge creation
- Dispute resolution system

## Security

- Solidity 0.8.24 (built-in overflow protection)
- Access control modifiers
- One-time contract linking (prevents unauthorized changes)
- Input validation on all external functions
- Comprehensive test coverage (14 tests, all passing)

**Note**: Contracts have not been audited. Use at your own risk.

## Contributing

Contributions welcome! Areas where we'd love help:
- Challenge content creation (Math, History, Languages, Software)
- UI/UX improvements
- Gas optimization
- Additional test coverage
- Documentation improvements

## License

MIT

## Acknowledgments

Built with:
- Foundry team for amazing smart contract tooling
- wagmi & viem teams for excellent Web3 libraries
- RainbowKit for beautiful wallet UI
- Next.js team for the best React framework

---

**Built with Claude Code** 🤖
