/**
 * React Integration Example
 * 
 * This example shows how to use DecaFlow SDK in a React application
 * with hooks for easy state management.
 */

import { useState } from 'react';
import { DecaFlowProvider, useSwapQuote } from '@decaflow/privacy-sdk';
import { useAccount } from 'wagmi';

function SwapComponent() {
  const { address } = useAccount();
  const [amount, setAmount] = useState('');
  const [tokenIn, setTokenIn] = useState('0x82aF49447D8a07e3bd95BD0d56f35241523fBab1'); // WETH
  const [tokenOut, setTokenOut] = useState('0xaf88d065e77c8cC2239327C5EDb3A432268e5831'); // USDC

  const { 
    quote, 
    loading, 
    error, 
    execute 
  } = useSwapQuote({
    tokenIn,
    tokenOut,
    amount: amount ? (parseFloat(amount) * 1e18).toString() : '0',
    enabled: !!amount && !!address
  });

  const handleSwap = async () => {
    try {
      const tx = await execute();
      console.log('Swap successful:', tx.transactionHash);
      alert(`Swap successful! You saved $${tx.mevSaved} in MEV`);
    } catch (err) {
      console.error('Swap failed:', err);
      alert('Swap failed. Please try again.');
    }
  };

  return (
    <div className="swap-widget">
      <h2>Privacy Swap</h2>
      
      <div>
        <label>Amount:</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.0"
        />
      </div>

      {loading && <p>Getting quote...</p>}
      
      {quote && (
        <div className="quote-details">
          <p>You'll receive: {(parseInt(quote.outputAmount) / 1e6).toFixed(2)} USDC</p>
          <p>MEV Risk Score: {quote.mevRiskScore}/100</p>
          <p className="savings">💰 Estimated MEV Savings: ${quote.mevSavingsUSD}</p>
          {quote.mevRiskScore > 70 && (
            <div className="warning">
              ⚠️ High MEV risk! Privacy protection enabled.
            </div>
          )}
        </div>
      )}

      {error && <p className="error">{error.message}</p>}

      <button 
        onClick={handleSwap}
        disabled={!quote || loading || !address}
      >
        {loading ? 'Loading...' : 'Swap with MEV Protection'}
      </button>
    </div>
  );
}

export default function App() {
  return (
    <DecaFlowProvider
      config={{
        network: 'arbitrum',
        apiKey: process.env.REACT_APP_DECAFLOW_API_KEY
      }}
    >
      <SwapComponent />
    </DecaFlowProvider>
  );
}
