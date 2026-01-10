import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { Toaster } from 'sonner'
import { SolanaWalletContextProvider } from './contexts/SolanaWalletContext'
import '@rainbow-me/rainbowkit/styles.css'
import './index.css'
import App from './App.tsx'
import { config } from './wagmi'
import { Buffer } from 'buffer'

window.Buffer = Buffer

// Enforce HTTPS in production
if (typeof window !== 'undefined' && window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
  window.location.href = 'https:' + window.location.href.substring(window.location.protocol.length);
}

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SolanaWalletContextProvider>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider 
            modalSize="compact"
            initialChain={config.chains[0]}
            showRecentTransactions={true}
            coolMode={false}
            appInfo={{
              appName: 'DecaFlow',
              learnMoreUrl: 'https://decaflow.app',
              disclaimer: ({ Text, Link }) => (
                <Text>
                  By connecting your wallet, you agree to the{' '}
                  <Link href="https://decaflow.app/terms">Terms of Service</Link> and{' '}
                  <Link href="https://decaflow.app/privacy">Privacy Policy</Link>
                </Text>
              ),
            }}
          >
            <App />
            <Toaster theme="dark" position="top-right" richColors />
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </SolanaWalletContextProvider>
  </StrictMode>,
)
