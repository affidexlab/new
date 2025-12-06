import { useState } from 'react';

interface LiquidityEmbedProps {
  theme: 'light' | 'dark';
  accentColor: string;
  partner: string;
}

export default function LiquidityEmbed({ theme, accentColor, partner }: LiquidityEmbedProps) {
  const [selectedPool, setSelectedPool] = useState('USDC/ETH');

  const bgColor = theme === 'dark' ? '#1f2937' : '#ffffff';
  const textColor = theme === 'dark' ? '#f9fafb' : '#111827';
  const inputBg = theme === 'dark' ? '#374151' : '#f3f4f6';

  const pools = [
    { name: 'USDC/ETH', apr: '12.5%', tvl: '$5.2M', protocol: 'Uniswap V3' },
    { name: 'USDC/ETH', apr: '18.3%', tvl: '$8.0M', protocol: 'Aerodrome' },
    { name: 'WBTC/ETH', apr: '15.1%', tvl: '$3.5M', protocol: 'Uniswap V3' }
  ];

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
        <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 700 }}>Liquidity Pools</h2>
        <div style={{ fontSize: '12px', opacity: 0.6 }}>
          Powered by <strong>DecaFlow</strong>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        {pools.map((pool, index) => (
          <div
            key={index}
            style={{
              background: inputBg,
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              border: selectedPool === pool.name ? `2px solid ${accentColor}` : '2px solid transparent'
            }}
            onClick={() => setSelectedPool(pool.name)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ fontSize: '18px', fontWeight: 700 }}>{pool.name}</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: accentColor }}>{pool.apr}</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', opacity: 0.6 }}>
              <div>{pool.protocol}</div>
              <div>TVL: {pool.tvl}</div>
            </div>
          </div>
        ))}
      </div>

      <button
        style={{
          width: '100%',
          background: accentColor,
          color: '#ffffff',
          border: 'none',
          borderRadius: '12px',
          padding: '18px',
          fontSize: '18px',
          fontWeight: 700,
          cursor: 'pointer',
          transition: 'all 0.2s',
          marginBottom: '12px'
        }}
      >
        Add Liquidity
      </button>

      <button
        style={{
          width: '100%',
          background: 'transparent',
          color: textColor,
          border: `2px solid ${theme === 'dark' ? '#4b5563' : '#d1d5db'}`,
          borderRadius: '12px',
          padding: '16px',
          fontSize: '18px',
          fontWeight: 700,
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
      >
        View My Positions
      </button>
    </div>
  );
}
