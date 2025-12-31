import React, { FC, useMemo, ReactNode } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

import '@solana/wallet-adapter-react-ui/styles.css';

export const SolanaWalletContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const endpoint = useMemo(() => {
    const raw = (import.meta.env.VITE_SOLANA_RPC_URL || '').trim();

    if (raw) {
      if (/^https?:\/\//i.test(raw)) {
        console.log('Using custom Solana RPC endpoint');
        return raw;
      }

      console.error('Invalid VITE_SOLANA_RPC_URL (must start with http:// or https://). Falling back to default public Solana RPC.');
      return clusterApiUrl('mainnet-beta');
    }

    console.warn('Using default public Solana RPC - consider using a dedicated RPC provider like Helius, QuickNode, or Alchemy for better reliability');
    return clusterApiUrl('mainnet-beta');
  }, []);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};