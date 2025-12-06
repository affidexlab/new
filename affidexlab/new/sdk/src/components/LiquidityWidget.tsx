import React from 'react';

interface LiquidityWidgetProps {
  chainId?: number;
  theme?: 'light' | 'dark';
  accentColor?: string;
}

export function LiquidityWidget({ 
  chainId, 
  theme = 'light',
  accentColor = '#4F46E5'
}: LiquidityWidgetProps) {
  return (
    <div 
      style={{
        width: '100%',
        maxWidth: '420px',
        padding: '20px',
        borderRadius: '16px',
        backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
        border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
        color: theme === 'dark' ? '#f9fafb' : '#111827'
      }}
    >
      <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 600 }}>
        Liquidity Pools
      </h3>
      <p style={{ margin: 0, fontSize: '14px', opacity: 0.7 }}>
        Use the DecaFlow SDK hooks to implement liquidity management.
        This is a placeholder component showing the widget structure.
      </p>
      <div style={{ marginTop: '16px', padding: '12px', backgroundColor: accentColor, borderRadius: '8px', color: 'white', textAlign: 'center', fontSize: '14px', fontWeight: 500 }}>
        Connect Wallet to Manage Liquidity
      </div>
    </div>
  );
}
