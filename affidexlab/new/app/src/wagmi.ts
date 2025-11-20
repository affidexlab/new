import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { arbitrum, avalanche, base, bsc, optimism, polygon } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'DecaFlow',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'bb466d3ee706ec7ccd389d161d64005a',
  chains: [arbitrum, base, optimism, polygon],
  ssr: false,
});
