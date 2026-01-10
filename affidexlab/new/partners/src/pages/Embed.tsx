import { useState, useEffect } from 'react';

interface EmbedProps {
  partner?: string;
  theme?: 'light' | 'dark';
  accent?: string;
}

export default function Embed() {
  const [selectedTab, setSelectedTab] = useState<'swap' | 'bridge' | 'liquidity'>('swap');
  const [fromToken, setFromToken] = useState('');
  const [toToken, setToToken] = useState('');
  const [amount, setAmount] = useState('');
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);
  const partner = urlParams.get('partner') || 'default';
  const theme = (urlParams.get('theme') || 'dark') as 'light' | 'dark';
  const accent = urlParams.get('accent') || '#4F46E5';

  const isDark = theme === 'dark';

  useEffect(() => {
    window.parent.postMessage({
      type: 'EMBED_READY',
      partner
    }, '*');
  }, [partner]);

  const handleSwap = async () => {
    setLoading(true);
    try {
      window.parent.postMessage({
        type: 'SWAP_REQUESTED',
        data: {
          fromToken,
          toToken,
          amount
        }
      }, '*');

      await new Promise(resolve => setTimeout(resolve, 1500));

      window.parent.postMessage({
        type: 'SWAP_SUBMITTED',
        data: {
          txHash: '0x' + Math.random().toString(16).slice(2, 66)
        }
      }, '*');

      setQuote({ success: true });
    } catch (error: any) {
      window.parent.postMessage({
        type: 'ERROR',
        error: error.message
      }, '*');
    } finally {
      setLoading(false);
    }
  };

  const bgColor = isDark ? '#0A0E27' : '#FFFFFF';
  const cardBg = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)';
  const textColor = isDark ? '#FFFFFF' : '#000000';
  const mutedColor = isDark ? '#9CA3AF' : '#6B7280';

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: bgColor,
      color: textColor,
      padding: '1rem'
    }}>
      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        <div style={{
          background: cardBg,
          backdropFilter: 'blur(10px)',
          border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
          borderRadius: '16px',
          padding: '1.5rem'
        }}>
          <div style={{ 
            display: 'flex', 
            gap: '0.5rem',
            marginBottom: '1.5rem',
            borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
            paddingBottom: '1rem'
          }}>
            {['swap', 'bridge', 'liquidity'].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab as any)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: selectedTab === tab ? accent : 'transparent',
                  color: selectedTab === tab ? '#FFFFFF' : mutedColor,
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  textTransform: 'capitalize',
                  transition: 'all 0.2s'
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {selectedTab === 'swap' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: mutedColor }}>
                  From Token
                </label>
                <input
                  type="text"
                  value={fromToken}
                  onChange={(e) => setFromToken(e.target.value)}
                  placeholder="0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.5)',
                    border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                    borderRadius: '8px',
                    color: textColor,
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: mutedColor }}>
                  To Token
                </label>
                <input
                  type="text"
                  value={toToken}
                  onChange={(e) => setToToken(e.target.value)}
                  placeholder="0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.5)',
                    border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                    borderRadius: '8px',
                    color: textColor,
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: mutedColor }}>
                  Amount
                </label>
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="1000000"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.5)',
                    border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                    borderRadius: '8px',
                    color: textColor,
                    outline: 'none'
                  }}
                />
              </div>

              <button
                onClick={handleSwap}
                disabled={loading || !fromToken || !toToken || !amount}
                style={{
                  width: '100%',
                  padding: '1rem',
                  background: accent,
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '1rem',
                  opacity: (loading || !fromToken || !toToken || !amount) ? 0.5 : 1,
                  transition: 'all 0.2s'
                }}
              >
                {loading ? 'Processing...' : 'Swap'}
              </button>

              {quote && (
                <div style={{
                  padding: '1rem',
                  background: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                  border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
                  borderRadius: '8px',
                  color: '#10B981'
                }}>
                  Swap submitted successfully!
                </div>
              )}
            </div>
          )}

          {selectedTab === 'bridge' && (
            <div style={{ textAlign: 'center', padding: '2rem', color: mutedColor }}>
              <p>Bridge functionality - Connect your wallet to begin</p>
            </div>
          )}

          {selectedTab === 'liquidity' && (
            <div style={{ textAlign: 'center', padding: '2rem', color: mutedColor }}>
              <p>Liquidity management - Connect your wallet to begin</p>
            </div>
          )}

          <div style={{
            marginTop: '1.5rem',
            paddingTop: '1rem',
            borderTop: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
            textAlign: 'center',
            fontSize: '0.75rem',
            color: mutedColor
          }}>
            Powered by DecaFlow
          </div>
        </div>
      </div>
    </div>
  );
}
