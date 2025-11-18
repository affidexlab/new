import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { arbitrum, base, optimism, polygon } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'DeFiSwap',
  projectId: 'YOUR_PROJECT_ID', // Get from WalletConnect Cloud
  chains: [arbitrum, base, optimism, polygon],
  ssr: false,
});
