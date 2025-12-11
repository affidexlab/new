import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, arbitrum, avalanche, base, optimism, polygon } from 'wagmi/chains';
import { http } from 'wagmi';

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
  transports: {
    [base.id]: http('https://mainnet.base.org'),
    [mainnet.id]: http('https://eth.llamarpc.com'),
    [arbitrum.id]: http('https://arbitrum.llamarpc.com'),
    [avalanche.id]: http('https://api.avax.network/ext/bc/C/rpc'),
    [optimism.id]: http('https://mainnet.optimism.io'),
    [polygon.id]: http('https://polygon-rpc.com'),
  },
});
