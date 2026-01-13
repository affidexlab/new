import React, { useState } from 'react';
import { useBridgeQuote } from '../hooks/useBridgeQuote';

interface BridgeWidgetProps {
  onBridge?: (quote: any) => void;
  theme?: 'light' | 'dark';
}

export function BridgeWidget({ onBridge, theme = 'dark' }: BridgeWidgetProps) {
  const [fromChainId, setFromChainId] = useState<number>(1);
  const [toChainId, setToChainId] = useState<number>(8453);
  const [fromToken, setFromToken] = useState('');
  const [toToken, setToToken] = useState('');
  const [amount, setAmount] = useState('');
  const [walletAddress, setWalletAddress] = useState('');

  const { quote, loading, error } = useBridgeQuote(
    fromToken && toToken && amount && walletAddress
      ? { fromChainId, toChainId, fromToken, toToken, amount, walletAddress }
      : null
  );

  const handleBridge = () => {
    if (quote && onBridge) {
      onBridge(quote);
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
      <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: '600' }}>Bridge</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          <input
            type="number"
            placeholder="From Chain ID"
            value={fromChainId}
            onChange={(e) => setFromChainId(parseInt(e.target.value))}
            style={{
              padding: '0.75rem',
              borderRadius: '8px',
              border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
              background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
              color: textColor
            }}
          />
          
          <input
            type="number"
            placeholder="To Chain ID"
            value={toChainId}
            onChange={(e) => setToChainId(parseInt(e.target.value))}
            style={{
              padding: '0.75rem',
              borderRadius: '8px',
              border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
              background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
              color: textColor
            }}
          />
        </div>
        
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
            <div>Route: {quote.route}</div>
            <div>Estimated Time: {quote.estimatedTime}s</div>
            <div>Fee: {quote.fee}</div>
          </div>
        )}
        
        {error && (
          <div style={{ color: '#EF4444', fontSize: '0.875rem' }}>{error}</div>
        )}
        
        <button
          onClick={handleBridge}
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
          {loading ? 'Loading...' : 'Bridge'}
        </button>
      </div>
    </div>
  );
}
