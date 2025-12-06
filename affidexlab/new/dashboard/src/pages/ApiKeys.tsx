import { useState } from 'react';

export default function ApiKeys() {
  const [showKey, setShowKey] = useState<string | null>(null);

  const keys = [
    {
      id: 'tychi_prod_pk_live_8x9y2z3a4b5c6d7e',
      name: 'Production Key',
      environment: 'production',
      created: '2025-11-15',
      lastUsed: '2 minutes ago',
      requests: 24593
    },
    {
      id: 'tychi_test_pk_sandbox_1a2b3c4d5e6f7g8h',
      name: 'Sandbox Key',
      environment: 'sandbox',
      created: '2025-11-15',
      lastUsed: '1 hour ago',
      requests: 1250
    }
  ];

  const maskKey = (key: string) => {
    if (showKey === key) return key;
    return key.substring(0, 15) + '••••••••••••••••' + key.substring(key.length - 4);
  };

  return (
    <div>
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 700, margin: '0 0 8px 0' }}>API Keys</h1>
          <p style={{ margin: 0, color: '#6b7280' }}>Manage your DecaFlow API keys</p>
        </div>
        <button style={{
          background: '#4f46e5',
          color: '#ffffff',
          border: 'none',
          borderRadius: '8px',
          padding: '12px 24px',
          fontSize: '16px',
          fontWeight: 600,
          cursor: 'pointer'
        }}>
          + Generate New Key
        </button>
      </div>

      <div style={{ background: '#fef3c7', border: '1px solid #fbbf24', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          <div style={{ fontSize: '20px', marginRight: '12px' }}>⚠️</div>
          <div>
            <div style={{ fontWeight: 600, marginBottom: '4px' }}>Keep your API keys secure</div>
            <div style={{ fontSize: '14px', color: '#92400e' }}>
              Never share your API keys publicly or commit them to version control. 
              Use environment variables to store keys in your application.
            </div>
          </div>
        </div>
      </div>

      {keys.map((key, index) => (
        <div key={index} style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '16px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>
                {key.name}
              </div>
              <div style={{
                display: 'inline-block',
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 600,
                background: key.environment === 'production' ? '#dbeafe' : '#fef3c7',
                color: key.environment === 'production' ? '#1e40af' : '#92400e'
              }}>
                {key.environment}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button style={{
                background: '#f3f4f6',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                color: '#374151'
              }}>
                Regenerate
              </button>
              <button style={{
                background: '#fee2e2',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                color: '#991b1b'
              }}>
                Revoke
              </button>
            </div>
          </div>

          <div style={{
            background: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '16px',
            fontFamily: 'monospace',
            fontSize: '14px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <span>{maskKey(key.id)}</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setShowKey(showKey === key.id ? null : key.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '18px'
                }}
              >
                {showKey === key.id ? '🙈' : '👁️'}
              </button>
              <button style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '18px'
              }}>
                📋
              </button>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px',
            fontSize: '14px'
          }}>
            <div>
              <div style={{ color: '#6b7280', marginBottom: '4px' }}>Created</div>
              <div style={{ fontWeight: 600 }}>{key.created}</div>
            </div>
            <div>
              <div style={{ color: '#6b7280', marginBottom: '4px' }}>Last Used</div>
              <div style={{ fontWeight: 600 }}>{key.lastUsed}</div>
            </div>
            <div>
              <div style={{ color: '#6b7280', marginBottom: '4px' }}>Total Requests</div>
              <div style={{ fontWeight: 600 }}>{key.requests.toLocaleString()}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
