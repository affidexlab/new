import { useState } from 'react';
import { sendMessage, EventType } from '../utils/postMessage';

interface BridgeEmbedProps {
  theme: 'light' | 'dark';
  accentColor: string;
  partner: string;
}

export default function BridgeEmbed({ theme, accentColor, partner }: BridgeEmbedProps) {
  const [amount, setAmount] = useState('');
  const [fromChain, setFromChain] = useState('Ethereum');
  const [toChain, setToChain] = useState('Arbitrum');
  const [loading, setLoading] = useState(false);

  const handleBridge = async () => {
    setLoading(true);
    
    sendMessage(EventType.BRIDGE_REQUESTED, {
      fromChain,
      toChain,
      amount,
      partner,
      timestamp: new Date().toISOString()
    });

    setTimeout(() => {
      sendMessage(EventType.BRIDGE_SUBMITTED, {
        fromChain,
        toChain,
        amount,
        trackingId: 'bridge_' + Math.random().toString(36).substring(2, 15),
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
        <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 700 }}>Bridge</h2>
        <div style={{ fontSize: '12px', opacity: 0.6 }}>
          Powered by <strong>DecaFlow</strong>
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ marginBottom: '8px', fontSize: '14px', opacity: 0.7 }}>From Chain</div>
        <select
          value={fromChain}
          onChange={(e) => setFromChain(e.target.value)}
          style={{
            width: '100%',
            background: inputBg,
            border: `1px solid ${borderColor}`,
            borderRadius: '12px',
            padding: '16px',
            fontSize: '16px',
            fontWeight: 600,
            color: textColor,
            cursor: 'pointer'
          }}
        >
          <option>Ethereum</option>
          <option>Arbitrum</option>
          <option>Base</option>
          <option>Optimism</option>
          <option>Polygon</option>
        </select>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ marginBottom: '8px', fontSize: '14px', opacity: 0.7 }}>Amount (USDC)</div>
        <input
          type="text"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.0"
          style={{
            width: '100%',
            background: inputBg,
            border: `1px solid ${borderColor}`,
            borderRadius: '12px',
            padding: '16px',
            fontSize: '24px',
            fontWeight: 600,
            color: textColor,
            boxSizing: 'border-box'
          }}
        />
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
          fontSize: '20px'
        }}>
          ↓
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <div style={{ marginBottom: '8px', fontSize: '14px', opacity: 0.7 }}>To Chain</div>
        <select
          value={toChain}
          onChange={(e) => setToChain(e.target.value)}
          style={{
            width: '100%',
            background: inputBg,
            border: `1px solid ${borderColor}`,
            borderRadius: '12px',
            padding: '16px',
            fontSize: '16px',
            fontWeight: 600,
            color: textColor,
            cursor: 'pointer'
          }}
        >
          <option>Arbitrum</option>
          <option>Ethereum</option>
          <option>Base</option>
          <option>Optimism</option>
          <option>Polygon</option>
        </select>
      </div>

      <button
        onClick={handleBridge}
        disabled={!amount || loading}
        style={{
          width: '100%',
          background: amount && !loading ? accentColor : inputBg,
          color: amount && !loading ? '#ffffff' : textColor,
          opacity: amount && !loading ? 1 : 0.5,
          border: 'none',
          borderRadius: '12px',
          padding: '18px',
          fontSize: '18px',
          fontWeight: 700,
          cursor: amount && !loading ? 'pointer' : 'not-allowed',
          transition: 'all 0.2s'
        }}
      >
        {loading ? 'Bridging...' : amount ? 'Bridge' : 'Enter Amount'}
      </button>

      {amount && (
        <div style={{ marginTop: '16px', fontSize: '13px', opacity: 0.6, textAlign: 'center' }}>
          Estimated time: ~10 minutes • Fee: $3.50
        </div>
      )}
    </div>
  );
}
