# TrustMe dApp

A modern Web3 decentralized application built with Next.js, TypeScript, wagmi, and RainbowKit. This project demonstrates blockchain integration, wallet connectivity, and smart contract interactions.

## Features

- **Multi-chain Support**: Ethereum, Polygon, Optimism, Arbitrum, Base, and Sepolia testnet
- **Wallet Connection**: Seamless wallet integration via RainbowKit (MetaMask, WalletConnect, Coinbase Wallet, and more)
- **Real-time Data**: Live wallet balance and account information display
- **Smart Contract Interaction**: Read and write operations with blockchain smart contracts
- **Modern UI**: Responsive design with Tailwind CSS
- **Type Safety**: Full TypeScript implementation for robust development
- **Production Ready**: Built with Next.js 15 and React 19

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Web3 Libraries**:
  - [wagmi](https://wagmi.sh/) - React Hooks for Ethereum
  - [viem](https://viem.sh/) - TypeScript Interface for Ethereum
  - [RainbowKit](https://www.rainbowkit.com/) - Wallet Connection UI
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: [TanStack Query](https://tanstack.com/query)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Web3 wallet (MetaMask, Coinbase Wallet, etc.)
- WalletConnect Project ID (get one at [WalletConnect Cloud](https://cloud.walletconnect.com))

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd trust-me-dapp
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your WalletConnect Project ID:
```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
trust-me-dapp/
├── app/                      # Next.js app directory
│   ├── layout.tsx           # Root layout with providers
│   ├── page.tsx             # Home page
│   ├── providers.tsx        # Web3 providers setup
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── ConnectButton.tsx   # Wallet connection button
│   ├── WalletInfo.tsx      # Display wallet information
│   └── ContractInteraction.tsx  # Smart contract interactions
├── config/                  # Configuration files
│   └── wagmi.ts            # Wagmi & chain configuration
└── public/                 # Static assets
```

## Key Components

### ConnectButton
Provides wallet connection functionality using RainbowKit's pre-built UI component.

### WalletInfo
Displays connected wallet information including:
- Wallet address
- Current chain ID
- Account balance

### ContractInteraction
Demonstrates smart contract interactions:
- Reading data from contracts
- Writing data to contracts
- Transaction status tracking

## Customization

### Adding Your Smart Contract

1. Update the contract address in `components/ContractInteraction.tsx`:
```typescript
const contractAddress = 'YOUR_CONTRACT_ADDRESS';
```

2. Replace the ABI with your contract's ABI:
```typescript
const YOUR_CONTRACT_ABI = [ /* your ABI */ ] as const;
```

### Adding More Chains

Edit `config/wagmi.ts` to add more blockchain networks:
```typescript
import { yourChain } from 'wagmi/chains';

export const config = getDefaultConfig({
  // ...
  chains: [mainnet, sepolia, yourChain],
});
```

## Development

### Building for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy

### Deploy to Other Platforms

This Next.js app can be deployed to any platform that supports Node.js:
- Netlify
- Railway
- Render
- AWS Amplify

## Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [wagmi Documentation](https://wagmi.sh)
- [RainbowKit Documentation](https://www.rainbowkit.com/docs)
- [Viem Documentation](https://viem.sh)
- [Solidity Documentation](https://docs.soliditylang.org/)

## Showcasing for Job Applications

This project demonstrates:
- **Modern Web3 Development**: Industry-standard tools and practices
- **Full-stack TypeScript**: Type-safe frontend and blockchain interactions
- **Clean Code Architecture**: Well-organized, maintainable codebase
- **User Experience**: Intuitive wallet connection and interaction flows
- **Multi-chain Knowledge**: Understanding of different blockchain networks

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
