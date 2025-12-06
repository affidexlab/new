import { useState } from 'react';
import { sendMessage, EventType } from '../utils/postMessage';

interface SwapEmbedProps {
  theme: 'light' | 'dark';
  accentColor: string;
  partner: string;
}

export default function SwapEmbed({ theme, accentColor, partner }: SwapEmbedProps) {
  const [fromAmount, setFromAmount] = useState('');
  const [fromToken, setFromToken] = useState('USDC');
  const [toToken, setToToken] = useState('ETH');
  const [loading, setLoading] = useState(false);

  const handleSwap = async () => {
    setLoading(true);
    
    sendMessage(EventType.SWAP_REQUESTED, {
      fromToken,
      toToken,
      amount: fromAmount,
      partner,
      timestamp: new Date().toISOString()
    });

    setTimeout(() => {
      sendMessage(EventType.SWAP_SUBMITTED, {
        fromToken,
        toToken,
        amount: fromAmount,
        txHash: '0x' + Math.random().toString(16).substring(2, 66),
        timestamp: new Date().toISOString()
      });
      setLoading(false);
    }, 2000);
  };

  const bgColor = theme === 'dark' ? '#1f2937' : '#ffffff';
  const textColor = theme === 'dark' ? '#f9fafb' : '#111827';
  const inputBg = theme === 'dark' ? '#374151' : '#f3f4f6';
  const borderColor = theme === 'dark' ? '#4b5563' : '#d1d5db';

  return (
    <div style={{
      width: '100%',
      maxWidth: '480px',
      background: bgColor,
      borderRadius: '20px',
      padding: '24px',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
      color: textColor
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 700 }}>Swap</h2>
        <div style={{ fontSize: '12px', opacity: 0.6 }}>
          Powered by <strong>DecaFlow</strong>
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ marginBottom: '8px', fontSize: '14px', opacity: 0.7 }}>From</div>
        <div style={{
          background: inputBg,
          border: `1px solid ${borderColor}`,
          borderRadius: '12px',
          padding: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <input
            type="text"
            value={fromAmount}
            onChange={(e) => setFromAmount(e.target.value)}
            placeholder="0.0"
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '24px',
              fontWeight: 600,
              color: textColor,
              width: '60%'
            }}
          />
          <select
            value={fromToken}
            onChange={(e) => setFromToken(e.target.value)}
            style={{
              background: theme === 'dark' ? '#4b5563' : '#ffffff',
              color: textColor,
              border: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <option>USDC</option>
            <option>ETH</option>
            <option>WBTC</option>
            <option>DAI</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', margin: '16px 0' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: inputBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          cursor: 'pointer'
        }}>
          ↓
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <div style={{ marginBottom: '8px', fontSize: '14px', opacity: 0.7 }}>To</div>
        <div style={{
          background: inputBg,
          border: `1px solid ${borderColor}`,
          borderRadius: '12px',
          padding: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 600, opacity: 0.5 }}>
            {fromAmount ? (parseFloat(fromAmount) * 0.997).toFixed(4) : '0.0'}
          </div>
          <select
            value={toToken}
            onChange={(e) => setToToken(e.target.value)}
            style={{
              background: theme === 'dark' ? '#4b5563' : '#ffffff',
              color: textColor,
              border: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <option>ETH</option>
            <option>USDC</option>
            <option>WBTC</option>
            <option>DAI</option>
          </select>
        </div>
      </div>

      <button
        onClick={handleSwap}
        disabled={!fromAmount || loading}
        style={{
          width: '100%',
          background: fromAmount && !loading ? accentColor : inputBg,
          color: fromAmount && !loading ? '#ffffff' : textColor,
          opacity: fromAmount && !loading ? 1 : 0.5,
          border: 'none',
          borderRadius: '12px',
          padding: '18px',
          fontSize: '18px',
          fontWeight: 700,
          cursor: fromAmount && !loading ? 'pointer' : 'not-allowed',
          transition: 'all 0.2s'
        }}
      >
        {loading ? 'Swapping...' : fromAmount ? 'Swap' : 'Enter Amount'}
      </button>

      {fromAmount && (
        <div style={{ marginTop: '16px', fontSize: '13px', opacity: 0.6, textAlign: 'center' }}>
          1 {fromToken} = 1.003 {toToken} • Fee: 0.3%
        </div>
      )}
    </div>
  );
}
