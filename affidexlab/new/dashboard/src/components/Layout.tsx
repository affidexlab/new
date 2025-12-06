import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Overview', icon: '📊' },
    { path: '/api-keys', label: 'API Keys', icon: '🔑' },
    { path: '/usage', label: 'Usage', icon: '📈' },
    { path: '/documentation', label: 'Documentation', icon: '📚' },
    { path: '/settings', label: 'Settings', icon: '⚙️' }
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f9fafb' }}>
      <aside style={{
        width: '260px',
        background: '#111827',
        color: '#f9fafb',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 8px 0' }}>
            DecaFlow
          </h1>
          <p style={{ margin: 0, fontSize: '14px', opacity: 0.7 }}>Partner Dashboard</p>
        </div>

        <nav style={{ flex: 1 }}>
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '8px',
                textDecoration: 'none',
                color: isActive(item.path) ? '#ffffff' : '#9ca3af',
                background: isActive(item.path) ? '#374151' : 'transparent',
                fontWeight: isActive(item.path) ? 600 : 400,
                transition: 'all 0.2s'
              }}
            >
              <span style={{ marginRight: '12px', fontSize: '18px' }}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div style={{
          padding: '16px',
          background: '#1f2937',
          borderRadius: '8px',
          fontSize: '13px'
        }}>
          <div style={{ marginBottom: '8px', fontWeight: 600 }}>Tychi Wallet</div>
          <div style={{ opacity: 0.7 }}>tech@tychiwallet.com</div>
          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #374151', opacity: 0.6 }}>
            Environment: Production
          </div>
        </div>
      </aside>

      <main style={{
        flex: 1,
        padding: '32px',
        overflowY: 'auto'
      }}>
        {children}
      </main>
    </div>
  );
}
