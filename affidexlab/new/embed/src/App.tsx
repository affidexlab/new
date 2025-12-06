import { useEffect, useState } from 'react';
import SwapEmbed from './components/SwapEmbed';
import BridgeEmbed from './components/BridgeEmbed';
import LiquidityEmbed from './components/LiquidityEmbed';
import { sendMessage, EventType } from './utils/postMessage';

function App() {
  const [config, setConfig] = useState({
    partner: 'unknown',
    theme: 'light' as 'light' | 'dark',
    accentColor: '#4F46E5',
    mode: 'swap' as 'swap' | 'bridge' | 'liquidity'
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    
    const partner = params.get('partner') || 'unknown';
    const theme = (params.get('theme') || 'light') as 'light' | 'dark';
    const accent = params.get('accent') || '#4F46E5';
    const mode = (params.get('mode') || 'swap') as 'swap' | 'bridge' | 'liquidity';

    const accentColor = accent.startsWith('%23') 
      ? '#' + accent.substring(3) 
      : accent;

    setConfig({ partner, theme, accentColor, mode });

    sendMessage(EventType.READY, {
      partner,
      timestamp: new Date().toISOString()
    });
  }, []);

  const renderWidget = () => {
    switch (config.mode) {
      case 'bridge':
        return <BridgeEmbed theme={config.theme} accentColor={config.accentColor} partner={config.partner} />;
      case 'liquidity':
        return <LiquidityEmbed theme={config.theme} accentColor={config.accentColor} partner={config.partner} />;
      default:
        return <SwapEmbed theme={config.theme} accentColor={config.accentColor} partner={config.partner} />;
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: config.theme === 'dark' ? '#111827' : '#f9fafb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      {renderWidget()}
    </div>
  );
}

export default App;
