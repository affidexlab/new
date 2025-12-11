import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, arbitrum, avalanche, base, optimism, polygon } from 'wagmi/chains';

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID as string | undefined;

if (!projectId) {
  console.error('❌ VITE_WALLETCONNECT_PROJECT_ID is not set. WalletConnect features will not work.');
  console.error('Please add VITE_WALLETCONNECT_PROJECT_ID to your environment variables.');
}

export const config = getDefaultConfig({
  appName: 'DecaFlow',
  projectId: projectId || '459eaeff6b6ccb624b0560abeb84b9e8',
  chains: [base, mainnet, arbitrum, avalanche, optimism, polygon],
  ssr: false,
});
