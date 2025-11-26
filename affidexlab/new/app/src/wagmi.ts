import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, arbitrum, avalanche, base, optimism, polygon } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'DecaFlow',
  projectId: (() => { const id = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID as string | undefined; if (!id) { throw new Error('WalletConnect Project ID is required. Set VITE_WALLETCONNECT_PROJECT_ID.'); } return id; })(),
  chains: [mainnet, arbitrum, avalanche, base, optimism, polygon],
  ssr: false,
});
