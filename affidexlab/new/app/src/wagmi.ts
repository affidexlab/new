import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, arbitrum, avalanche, base, optimism, polygon } from 'wagmi/chains';

const walletConnectProjectId = (() => {
  const id = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID as string | undefined;
  if (!id) {
    throw new Error('WalletConnect Project ID is required. Set VITE_WALLETCONNECT_PROJECT_ID.');
  }
  return id;
})();

export const config = getDefaultConfig({
  appName: 'DecaFlow',
  projectId: walletConnectProjectId,
  chains: [base, mainnet, arbitrum, avalanche, optimism, polygon],
  ssr: false,
  walletConnectParameters: {
    metadata: {
      name: 'DecaFlow',
      description: 'DecaFlow DeFi protocol for swaps, bridges, liquidity, and rewards.',
      url: 'https://decaflow.xyz',
      icons: ['https://decaflow.xyz/images/branding/app-icon.png'],
    },
  },
});
