import { createConfig, http } from 'wagmi';
import { mainnet, arbitrum, avalanche, base, optimism, polygon } from 'wagmi/chains';
import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import {
  metaMaskWallet,
  coinbaseWallet,
  walletConnectWallet,
  rainbowWallet,
  trustWallet,
  ledgerWallet,
} from '@rainbow-me/rainbowkit/wallets';

// Get Reown Project ID (formerly WalletConnect)
const projectId = (import.meta.env.VITE_REOWN_PROJECT_ID || 'bb466d3ee706ec7ccd389d161d64005a').trim();

if (!projectId || projectId.length < 32) {
  console.error('❌ Reown project ID is invalid!');
  console.error('⚠️  Get a free project ID at: https://cloud.reown.com');
} else {
  console.log('✅ Reown/WalletConnect configured:', projectId.substring(0, 10) + '...');
}

// Supported chains
const chains = [base, mainnet, arbitrum, avalanche, optimism, polygon] as const;

// Explicitly configure connectors with proper metadata
const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: [
        metaMaskWallet,
        coinbaseWallet,
        walletConnectWallet,
        rainbowWallet,
      ],
    },
    {
      groupName: 'Others',
      wallets: [
        trustWallet,
        ledgerWallet,
      ],
    },
  ],
  {
    appName: 'DecaFlow',
    projectId,
  }
);

// Create wagmi config with explicit settings
export const config = createConfig({
  chains,
  connectors,
  
  // Custom RPC endpoints
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
  
  ssr: false,
});

// Debug logging
console.log('🔧 Wagmi config initialized');
console.log('📱 Chains:', chains.map(c => c.name).join(', '));
console.log('🔌 Connectors:', connectors.length, 'configured');
