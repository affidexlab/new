import { http } from 'wagmi';
import { arbitrum, mainnet, polygon, optimism, base, avalanche, bsc } from 'wagmi/chains';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

export const config = getDefaultConfig({
  appName: 'DecaFlow',
  projectId: 'YOUR_PROJECT_ID', // Get from WalletConnect Cloud
  chains: [arbitrum, mainnet, polygon, optimism, base, avalanche, bsc],
  transports: {
    [arbitrum.id]: http(),
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [optimism.id]: http(),
    [base.id]: http(),
    [avalanche.id]: http(),
    [bsc.id]: http(),
  },
});
