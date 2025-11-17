import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, sepolia, anvil } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'TrustMe dApp',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: [
    ...(process.env.NODE_ENV === 'development' ? [anvil] : []),
    // mainnet,
    sepolia,
  ],
  ssr: true,
});
