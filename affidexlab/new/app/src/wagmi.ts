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

// Get WalletConnect Project ID from environment
const projectIdSource =
  import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ||
  import.meta.env.VITE_REOWN_PROJECT_ID ||
  '';

const projectId = projectIdSource.trim();

if (!projectId) {
  console.error('❌ WalletConnect/Reown project ID is not set!');
} else {
  console.log('✅ WalletConnect/Reown Project ID:', projectId.substring(0, 10) + '...');
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
console.log('🔧 Wagmi config initialized with explicit connectors');
console.log('📱 Chains:', chains.map(c => c.name).join(', '));
console.log('🔌 Connectors:', connectors.length, 'configured');
