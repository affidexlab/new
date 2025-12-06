export default function Usage() {
  const endpointStats = [
    { endpoint: '/v1/swap/quote', requests: 12450, avgTime: '125ms', successRate: '99.5%' },
    { endpoint: '/v1/swap/execute', requests: 11980, avgTime: '210ms', successRate: '99.2%' },
    { endpoint: '/v1/bridge/quote', requests: 3200, avgTime: '180ms', successRate: '98.8%' },
    { endpoint: '/v1/bridge/execute', requests: 3050, avgTime: '320ms', successRate: '99.0%' },
    { endpoint: '/v1/liquidity/pools', requests: 1850, avgTime: '95ms', successRate: '99.9%' },
    { endpoint: '/v1/liquidity/positions', requests: 980, avgTime: '150ms', successRate: '99.7%' }
  ];

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700, margin: '0 0 8px 0' }}>API Usage</h1>
        <p style={{ margin: 0, color: '#6b7280' }}>Detailed analytics for your API consumption</p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 600 }}>
            Requests by Endpoint
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {endpointStats.slice(0, 4).map((stat, index) => (
              <div key={index}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '14px' }}>
                  <span>{stat.endpoint.split('/').pop()}</span>
                  <span style={{ fontWeight: 600 }}>{stat.requests.toLocaleString()}</span>
                </div>
                <div style={{
                  height: '8px',
                  background: '#f3f4f6',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${(stat.requests / 12450) * 100}%`,
                    background: '#4f46e5',
                    borderRadius: '4px'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 600 }}>
            Rate Limit Status
          </h3>
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>Current Usage</span>
              <span style={{ fontWeight: 600 }}>24,593 / 100,000</span>
            </div>
            <div style={{
              height: '12px',
              background: '#f3f4f6',
              borderRadius: '6px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: '24.6%',
                background: '#10b981',
                borderRadius: '6px'
              }} />
            </div>
            <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '8px' }}>
              Resets in 23 days
            </div>
          </div>

          <div style={{
            background: '#f9fafb',
            borderRadius: '8px',
            padding: '16px'
          }}>
            <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
              Current Plan: Enterprise
            </div>
            <div style={{ fontSize: '13px', color: '#6b7280' }}>
              100,000 requests/month<br />
              100 requests/minute<br />
              Priority support
            </div>
          </div>
        </div>
      </div>

      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 600 }}>
          Endpoint Performance
        </h3>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse'
        }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #f3f4f6' }}>
              <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: '14px', fontWeight: 600, color: '#6b7280' }}>
                Endpoint
              </th>
              <th style={{ textAlign: 'right', padding: '12px 8px', fontSize: '14px', fontWeight: 600, color: '#6b7280' }}>
                Requests
              </th>
              <th style={{ textAlign: 'right', padding: '12px 8px', fontSize: '14px', fontWeight: 600, color: '#6b7280' }}>
                Avg Response Time
              </th>
              <th style={{ textAlign: 'right', padding: '12px 8px', fontSize: '14px', fontWeight: 600, color: '#6b7280' }}>
                Success Rate
              </th>
            </tr>
          </thead>
          <tbody>
            {endpointStats.map((stat, index) => (
              <tr key={index} style={{ borderBottom: '1px solid #f9fafb' }}>
                <td style={{ padding: '16px 8px', fontFamily: 'monospace', fontSize: '14px' }}>
                  {stat.endpoint}
                </td>
                <td style={{ padding: '16px 8px', textAlign: 'right', fontWeight: 600 }}>
                  {stat.requests.toLocaleString()}
                </td>
                <td style={{ padding: '16px 8px', textAlign: 'right' }}>
                  {stat.avgTime}
                </td>
                <td style={{ padding: '16px 8px', textAlign: 'right' }}>
                  <span style={{
                    background: '#d1fae5',
                    color: '#065f46',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '13px',
                    fontWeight: 600
                  }}>
                    {stat.successRate}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
