import React, { useState } from 'react';
import { useSwapQuote } from '../hooks/useSwapQuote';

interface SwapWidgetProps {
  chainId: number;
  onSwap?: (quote: any) => void;
  theme?: 'light' | 'dark';
}

export function SwapWidget({ chainId, onSwap, theme = 'dark' }: SwapWidgetProps) {
  const [fromToken, setFromToken] = useState('');
  const [toToken, setToToken] = useState('');
  const [amount, setAmount] = useState('');

  const { quote, loading, error } = useSwapQuote(
    fromToken && toToken && amount
      ? { fromToken, toToken, amount, chainId }
      : null
  );

  const handleSwap = () => {
    if (quote && onSwap) {
      onSwap(quote);
    }
  };

  const isDark = theme === 'dark';
  const bgColor = isDark ? '#0A0E27' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#000000';

  return (
    <div style={{ 
      background: bgColor, 
      color: textColor,
      padding: '1.5rem',
      borderRadius: '12px',
      border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`
    }}>
      <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: '600' }}>Swap</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input
          type="text"
          placeholder="From Token"
          value={fromToken}
          onChange={(e) => setFromToken(e.target.value)}
          style={{
            padding: '0.75rem',
            borderRadius: '8px',
            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
            background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
            color: textColor
          }}
        />
        
        <input
          type="text"
          placeholder="To Token"
          value={toToken}
          onChange={(e) => setToToken(e.target.value)}
          style={{
            padding: '0.75rem',
            borderRadius: '8px',
            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
            background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
            color: textColor
          }}
        />
        
        <input
          type="text"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{
            padding: '0.75rem',
            borderRadius: '8px',
            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
            background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
            color: textColor
          }}
        />
        
        {quote && (
          <div style={{
            padding: '0.75rem',
            borderRadius: '8px',
            background: isDark ? 'rgba(79, 70, 229, 0.1)' : 'rgba(79, 70, 229, 0.1)',
            border: '1px solid rgba(79, 70, 229, 0.3)'
          }}>
            <div>You will receive: {quote.toAmount}</div>
            <div>Price Impact: {quote.priceImpact}%</div>
          </div>
        )}
        
        {error && (
          <div style={{ color: '#EF4444', fontSize: '0.875rem' }}>{error}</div>
        )}
        
        <button
          onClick={handleSwap}
          disabled={loading || !quote}
          style={{
            padding: '0.75rem',
            borderRadius: '8px',
            background: '#4F46E5',
            color: '#FFFFFF',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '600',
            opacity: (loading || !quote) ? 0.5 : 1
          }}
        >
          {loading ? 'Loading...' : 'Swap'}
        </button>
      </div>
    </div>
  );
}
