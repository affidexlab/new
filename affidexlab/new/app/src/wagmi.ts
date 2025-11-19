import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { arbitrum, base, optimism, polygon } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'DECAFLOW',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: [arbitrum, base, optimism, polygon],
  ssr: false,
});
