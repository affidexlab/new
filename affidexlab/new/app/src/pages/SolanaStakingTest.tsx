import { useState, useEffect } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';

export default function SolanaStakingTest() {
  const { publicKey } = useWallet();
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    console.log(message);
  };

  useEffect(() => {
    addLog('✅ Staking page component mounted successfully');
    addLog(`RPC URL configured: ${import.meta.env.VITE_SOLANA_RPC_URL ? 'YES' : 'NO'}`);
    addLog(`API Base configured: ${import.meta.env.VITE_API_BASE_URL ? 'YES' : 'NO'}`);
  }, []);

  useEffect(() => {
    if (publicKey) {
      addLog(`✅ Wallet connected: ${publicKey.toString()}`);
    } else {
      addLog('⏳ No wallet connected yet');
    }
  }, [publicKey]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0E27] via-[#1a1f3a] to-[#0A0E27] text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">VDM Staking Test Page</h1>
              <p className="text-gray-400">Diagnostic page to verify setup</p>
            </div>
            <WalletMultiButton />
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-6">
              <div className="text-3xl mb-2">✅</div>
              <div className="font-bold">Page Loaded</div>
              <div className="text-sm text-gray-300">React is working</div>
            </div>

            <div className={`${import.meta.env.VITE_SOLANA_RPC_URL ? 'bg-green-500/20 border-green-500/50' : 'bg-red-500/20 border-red-500/50'} border rounded-xl p-6`}>
              <div className="text-3xl mb-2">{import.meta.env.VITE_SOLANA_RPC_URL ? '✅' : '❌'}</div>
              <div className="font-bold">RPC Configured</div>
              <div className="text-sm text-gray-300">
                {import.meta.env.VITE_SOLANA_RPC_URL ? 'Custom RPC set' : 'Using default (not recommended)'}
              </div>
            </div>

            <div className={`${import.meta.env.VITE_API_BASE_URL ? 'bg-green-500/20 border-green-500/50' : 'bg-red-500/20 border-red-500/50'} border rounded-xl p-6`}>
              <div className="text-3xl mb-2">{import.meta.env.VITE_API_BASE_URL ? '✅' : '⚠️'}</div>
              <div className="font-bold">API Configured</div>
              <div className="text-sm text-gray-300">
                {import.meta.env.VITE_API_BASE_URL || 'Using default fallback'}
              </div>
            </div>
          </div>

          {/* Wallet Status */}
          <div className="bg-[#151B35]/60 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Wallet Status</h2>
            {publicKey ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-bold text-green-400">Connected</span>
                </div>
                <div className="bg-[#0A0E27] rounded-lg p-3 font-mono text-sm break-all">
                  {publicKey.toString()}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                  <span className="text-gray-400">Not Connected</span>
                </div>
                <p className="text-sm text-gray-400">Click the wallet button above to connect</p>
              </div>
            )}
          </div>

          {/* Environment Variables */}
          <div className="bg-[#151B35]/60 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Environment Configuration</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-700">
                <span className="text-gray-400">VITE_SOLANA_RPC_URL</span>
                <span className={`font-mono text-sm ${import.meta.env.VITE_SOLANA_RPC_URL ? 'text-green-400' : 'text-red-400'}`}>
                  {import.meta.env.VITE_SOLANA_RPC_URL ? '✅ Configured' : '❌ Not Set'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-700">
                <span className="text-gray-400">VITE_API_BASE_URL</span>
                <span className={`font-mono text-sm ${import.meta.env.VITE_API_BASE_URL ? 'text-green-400' : 'text-yellow-400'}`}>
                  {import.meta.env.VITE_API_BASE_URL || 'Using default'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-400">Build Mode</span>
                <span className="font-mono text-sm text-blue-400">
                  {import.meta.env.MODE}
                </span>
              </div>
            </div>
          </div>

          {/* Logs */}
          <div className="bg-[#151B35]/60 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4">Activity Log</h2>
            <div className="bg-black rounded-lg p-4 font-mono text-xs space-y-1 max-h-64 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-gray-500">No logs yet...</div>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="text-gray-300">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Next Steps */}
          <div className="mt-8 bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4">📋 Next Steps</h2>
            <div className="space-y-2 text-sm">
              <p>1. ✅ If you see this page, React and routing are working</p>
              <p>2. {import.meta.env.VITE_SOLANA_RPC_URL ? '✅' : '❌'} Configure VITE_SOLANA_RPC_URL for better performance</p>
              <p>3. {publicKey ? '✅' : '⏳'} Connect your Solana wallet</p>
              <p>4. Check browser console (F12) for any errors</p>
              <p>5. If everything looks good, restore the original staking page</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
