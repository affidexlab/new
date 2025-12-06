export default function Documentation() {
  const resources = [
    { title: 'Getting Started', desc: 'Quick start guide for integrating DecaFlow', icon: '🚀' },
    { title: 'API Reference', desc: 'Complete API documentation with examples', icon: '📖' },
    { title: 'SDK Guide', desc: 'How to use @decaflow/partner-sdk', icon: '⚡' },
    { title: 'Embed Widget', desc: 'Integration guide for embedded widgets', icon: '🖼️' },
    { title: 'Code Examples', desc: 'Sample code and integration patterns', icon: '💻' },
    { title: 'Best Practices', desc: 'Security and performance recommendations', icon: '✨' }
  ];

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700, margin: '0 0 8px 0' }}>Documentation</h1>
        <p style={{ margin: 0, color: '#6b7280' }}>Resources to help you integrate DecaFlow</p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        {resources.map((resource, index) => (
          <div key={index} style={{
            background: '#ffffff',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>{resource.icon}</div>
            <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
              {resource.title}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>
              {resource.desc}
            </div>
          </div>
        ))}
      </div>

      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: 600 }}>
          Quick Links
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <a href="https://api.decaflow.xyz/v1" style={{
            color: '#4f46e5',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '14px'
          }}>
            → API Base URL (Production)
          </a>
          <a href="https://sandbox.decaflow.xyz/v1" style={{
            color: '#4f46e5',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '14px'
          }}>
            → API Base URL (Sandbox)
          </a>
          <a href="https://partners.decaflow.xyz/embed?partner=tychi" style={{
            color: '#4f46e5',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '14px'
          }}>
            → Embed Widget Demo
          </a>
          <a href="https://www.npmjs.com/package/@decaflow/partner-sdk" style={{
            color: '#4f46e5',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '14px'
          }}>
            → SDK on NPM
          </a>
        </div>
      </div>
    </div>
  );
}
