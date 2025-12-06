# DecaFlow Partner Dashboard

Partner management dashboard for DecaFlow integrations.

## Deployment

This should be deployed to:
- Production: `https://partners.decaflow.xyz/dashboard`
- Sandbox: `https://partners-sandbox.decaflow.xyz/dashboard`

## Features

- **Overview**: Real-time analytics and activity monitoring
- **API Keys**: Manage production and sandbox API keys
- **Usage**: Detailed endpoint analytics and rate limit tracking
- **Documentation**: Quick access to integration resources
- **Settings**: Partner account configuration

## Development

```bash
npm install
npm run dev
```

Dashboard will be available at `http://localhost:5175`

## Build

```bash
npm run build
```

Build output will be in `/dist` directory.

## Environment Variables

None required - dashboard is a static application that communicates with the DecaFlow API.

## Authentication

In production, this dashboard should be protected with authentication. Partners should log in with their credentials to access their dashboard.

Current implementation is a demo/mock version. Production version should:
1. Integrate with auth provider (Auth0, Clerk, etc.)
2. Fetch real data from DecaFlow API
3. Store partner session securely
4. Implement proper RBAC (Role-Based Access Control)
