export default function Overview() {
  const stats = [
    { label: 'Total Requests', value: '24,593', change: '+12.5%', trend: 'up' },
    { label: 'Active Users', value: '1,247', change: '+8.2%', trend: 'up' },
    { label: 'Success Rate', value: '99.2%', change: '+0.3%', trend: 'up' },
    { label: 'Avg Response Time', value: '142ms', change: '-5.1%', trend: 'down' }
  ];

  const recentActivity = [
    { type: 'Swap', time: '2 minutes ago', status: 'success' },
    { type: 'Bridge', time: '5 minutes ago', status: 'success' },
    { type: 'Liquidity Add', time: '12 minutes ago', status: 'success' },
    { type: 'Swap', time: '18 minutes ago', status: 'success' },
    { type: 'Bridge', time: '25 minutes ago', status: 'pending' }
  ];

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700, margin: '0 0 8px 0' }}>Overview</h1>
        <p style={{ margin: 0, color: '#6b7280' }}>Monitor your integration performance and usage</p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        {stats.map((stat, index) => (
          <div key={index} style={{
            background: '#ffffff',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
              {stat.label}
            </div>
            <div style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>
              {stat.value}
            </div>
            <div style={{
              fontSize: '13px',
              color: stat.trend === 'up' ? '#10b981' : '#ef4444',
              fontWeight: 600
            }}>
              {stat.change} from last month
            </div>
          </div>
        ))}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '20px'
      }}>
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 20px 0' }}>
            API Usage (Last 7 Days)
          </h2>
          <div style={{
            height: '300px',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-around',
            borderBottom: '1px solid #e5e7eb',
            paddingBottom: '20px'
          }}>
            {[45, 60, 52, 70, 85, 65, 90].map((height, index) => (
              <div key={index} style={{
                width: '60px',
                height: `${height}%`,
                background: '#4f46e5',
                borderRadius: '4px 4px 0 0',
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  bottom: '-25px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: '12px',
                  color: '#6b7280'
                }}>
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
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
          <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 20px 0' }}>
            Recent Activity
          </h2>
          {recentActivity.map((activity, index) => (
            <div key={index} style={{
              padding: '12px 0',
              borderBottom: index < recentActivity.length - 1 ? '1px solid #f3f4f6' : 'none',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>{activity.type}</div>
                <div style={{ fontSize: '13px', color: '#6b7280' }}>{activity.time}</div>
              </div>
              <div style={{
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 600,
                background: activity.status === 'success' ? '#d1fae5' : '#fef3c7',
                color: activity.status === 'success' ? '#065f46' : '#92400e'
              }}>
                {activity.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
