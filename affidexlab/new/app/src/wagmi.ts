import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, arbitrum, avalanche, base, optimism, polygon } from 'wagmi/chains';
import { http } from 'wagmi';

// Get WalletConnect Project ID from environment
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID as string;

// Validate project ID
if (!projectId) {
  console.error('❌ CRITICAL: VITE_WALLETCONNECT_PROJECT_ID is not set!');
  console.error('This will cause WalletConnect to fail.');
  console.error('Get your project ID from: https://cloud.walletconnect.com');
} else {
  console.log('✅ WalletConnect Project ID loaded:', projectId.substring(0, 10) + '...');
}

// Supported chains
const chains = [base, mainnet, arbitrum, avalanche, optimism, polygon] as const;

// Application metadata
const appInfo = {
  appName: 'DecaFlow',
  appDescription: 'Multi-chain DEX aggregator and cross-chain bridge platform powered by Base',
  appUrl: 'https://decaflow.xyz',
  appIcon: 'https://decaflow.xyz/images/branding/wordmark-500.png',
};

// Create wagmi configuration
export const config = getDefaultConfig({
  // App info
  ...appInfo,
  
  // WalletConnect project ID
  projectId: projectId,
  
  // Supported chains
  chains,
  
  // SSR config
  ssr: false,
  
  // Custom RPC endpoints for better reliability
  transports: {
    [base.id]: http('https://mainnet.base.org'),
    [mainnet.id]: http('https://eth.llamarpc.com'),
    [arbitrum.id]: http('https://arbitrum.llamarpc.com'), 
    [avalanche.id]: http('https://api.avax.network/ext/bc/C/rpc'),
    [optimism.id]: http('https://mainnet.optimism.io'),
    [polygon.id]: http('https://polygon-rpc.com'),
  },
  
  // Enable multicall for batch transactions
  batch: {
    multicall: true,
  },
});

// Debug logging
if (typeof window !== 'undefined') {
  console.log('🔧 Wagmi config initialized');
  console.log('🌐 Current domain:', window.location.origin);
  console.log('📱 Chains:', chains.map(c => c.name).join(', '));
  console.log('🔑 Project ID:', projectId ? 'Set ✓' : 'Missing ✗');
}
