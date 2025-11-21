import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { arbitrum, base, optimism, polygon, avalanche } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'DeFiSwap',
  projectId: 'bb466d3ee706ec7ccd389d161d64005a',
  chains: [arbitrum, avalanche, base, optimism, polygon],
  ssr: false,
});
