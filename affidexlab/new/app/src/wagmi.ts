import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, arbitrum, avalanche, base, optimism, polygon } from 'wagmi/chains';
import { http } from 'wagmi';

// Get WalletConnect Project ID from environment
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID as string;

if (!projectId || projectId === 'YOUR_PROJECT_ID_HERE') {
  console.warn('⚠️  WalletConnect Project ID not properly configured');
  console.info('💡 Get a free project ID at https://cloud.walletconnect.com');
  console.info('📝 Add it to your .env file as VITE_WALLETCONNECT_PROJECT_ID');
}

// Configure supported chains
const chains = [base, mainnet, arbitrum, avalanche, optimism, polygon] as const;

// Create wagmi config with all wallet support
export const config = getDefaultConfig({
  appName: 'DecaFlow',
  projectId: projectId || 'c3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3',
  chains,
  ssr: false,
  
  // Custom RPC transports for better reliability
  transports: {
    [base.id]: http('https://mainnet.base.org'),
    [mainnet.id]: http('https://eth.llamarpc.com'),
    [arbitrum.id]: http('https://arbitrum.llamarpc.com'), 
    [avalanche.id]: http('https://api.avax.network/ext/bc/C/rpc'),
    [optimism.id]: http('https://mainnet.optimism.io'),
    [polygon.id]: http('https://polygon-rpc.com'),
  },
  
  // Enable batch transactions
  batch: {
    multicall: true,
  },
});
