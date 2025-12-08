const apiEndpoints = [
  {
    title: 'Production API',
    url: 'https://decaflow-enp9ljbfu-affidexs-projects.vercel.app/v1',
    dns: 'api.decaflow.xyz',
    notes: 'Set CNAME to the URL above once DNS is ready. Requires X-Partner-ID header.',
  },
  {
    title: 'Sandbox API',
    url: 'https://backend-dv8ou60r6-affidexs-projects.vercel.app/v1',
    dns: 'sandbox.decaflow.xyz',
    notes: 'Relaxed rate limits for Tychi QA and staging apps.',
  },
];

const partnerApps = [
  {
    title: 'Partner Dashboard',
    url: 'https://partners-4tx5mqdi3-affidexs-projects.vercel.app/dashboard',
    dns: 'partners.decaflow.xyz/dashboard',
    notes: 'Enter the Tychi Partner ID to view usage, API keys, and embed snippets.',
  },
  {
    title: 'Embedded Experience',
    url: 'https://partners-4tx5mqdi3-affidexs-projects.vercel.app/embed?partner=tychi',
    dns: 'partners.decaflow.xyz/embed?partner=tychi',
    notes: 'Supports theme, accent, and size overrides plus postMessage events.',
  },
  {
    title: 'Sandbox Dashboard',
    url: 'https://partners-sandbox-8nhjfiu3w-affidexs-projects.vercel.app/dashboard',
    dns: 'partners-sandbox.decaflow.xyz/dashboard',
    notes: 'Point Tychi’s staging traffic here until DNS is switched.',
  },
];

const steps = [
  'Add the provided Vercel URLs as CNAME records for api.decaflow.xyz, sandbox.decaflow.xyz, partners.decaflow.xyz, and partners-sandbox.decaflow.xyz.',
  'Inside each Vercel project, add the custom domains and wait for SSL provisioning.',
  'Set SOCKET_API_KEY and allowed origin lists per environment from the DecaFlow dashboard.',
  'Disable Vercel deployment protection or share a bypass token with Tychi so they can call the APIs without SSO.',
  'Validate /v1/health on each domain and load the dashboard + embed in a browser to confirm CORS headers.',
];

const embedEvents = [
  'EMBED_READY – iframe finished loading',
  'SWAP_REQUESTED – user clicked swap CTA',
  'SWAP_SUBMITTED – transaction submitted to chain',
  'SWAP_CONFIRMED – on-chain confirmation received',
  'BRIDGE_REQUESTED – cross-chain transfer initiated',
  'ERROR – bubbled error state for client analytics',
];

export default function App() {
  return (
    <div className="page">
      <header className="hero">
        <p className="eyebrow">DecaFlow × Tychi Wallet</p>
        <h1>Partner Integration Runbook</h1>
        <p className="lead">
          All infrastructure promised in the integration kit is live on Vercel.
          Plug in the DNS records and environment variables below to expose the
          APIs, dashboard, and embed to Tychi teams.
        </p>
      </header>

      <section>
        <h2>API Base URLs</h2>
        <div className="card-grid">
          {apiEndpoints.map((endpoint) => (
            <article key={endpoint.title} className="card">
              <h3>{endpoint.title}</h3>
              <p className="card-url">
                <a href={endpoint.url} target="_blank" rel="noreferrer">
                  {endpoint.url}
                </a>
              </p>
              <p className="card-dns">Map DNS → {endpoint.dns}</p>
              <p>{endpoint.notes}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2>Partner Surfaces</h2>
        <div className="card-grid">
          {partnerApps.map((app) => (
            <article key={app.title} className="card">
              <h3>{app.title}</h3>
              <p className="card-url">
                <a href={app.url} target="_blank" rel="noreferrer">
                  {app.url}
                </a>
              </p>
              <p className="card-dns">Map DNS → {app.dns}</p>
              <p>{app.notes}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2>Partner Embed API</h2>
        <div className="card">
          <p>Drop-in iframe pointing to the production embed URL:</p>
          <pre>
{`<iframe
  src="https://partners.decaflow.xyz/embed?partner=tychi&theme=dark&accent=%234F46E5"
  width="100%"
  height="620"
  style="border:0;border-radius:16px;"
  allow="clipboard-write"
></iframe>`}
          </pre>
          <p className="stacked-label">PostMessage events</p>
          <ul className="pill-list">
            {embedEvents.map((event) => (
              <li key={event}>{event}</li>
            ))}
          </ul>
        </div>
      </section>

      <section>
        <h2>Deployment Checklist</h2>
        <ol className="checklist">
          {steps.map((step, idx) => (
            <li key={idx}>{step}</li>
          ))}
        </ol>
      </section>

      <section>
        <h2>Contact</h2>
        <div className="card">
          <p>techpartners@decaflow.xyz · security@decaflow.xyz · partnerships@decaflow.xyz</p>
          <p>Response SLA: critical &lt; 4 business hours, routine &lt; 1 business day.</p>
        </div>
      </section>
    </div>
  );
}
