# DecaFlow Embedded Widget

Embeddable DecaFlow widgets for partner integration.

## Deployment

This should be deployed to:
- Production: `https://partners.decaflow.xyz/embed`
- Sandbox: `https://partners-sandbox.decaflow.xyz/embed`

## Usage

### Basic Embed (Swap)

```html
<iframe
  src="https://partners.decaflow.xyz/embed?partner=tychi&mode=swap&theme=dark"
  width="500"
  height="600"
  frameborder="0"
  allow="clipboard-write"
></iframe>
```

### Bridge Embed

```html
<iframe
  src="https://partners.decaflow.xyz/embed?partner=tychi&mode=bridge&theme=light"
  width="500"
  height="650"
  frameborder="0"
></iframe>
```

### Liquidity Embed

```html
<iframe
  src="https://partners.decaflow.xyz/embed?partner=tychi&mode=liquidity&theme=dark"
  width="500"
  height="700"
  frameborder="0"
></iframe>
```

## Query Parameters

- `partner` (required): Partner ID (e.g., `tychi`)
- `mode` (optional): Widget mode - `swap`, `bridge`, or `liquidity` (default: `swap`)
- `theme` (optional): Theme - `light` or `dark` (default: `light`)
- `accent` (optional): Accent color in hex format, use `%23` for `#` (e.g., `accent=%234F46E5`)

## PostMessage Events

The embed sends events to the parent window:

```javascript
window.addEventListener('message', (event) => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'READY':
      console.log('Widget ready:', data);
      break;
    case 'SWAP_SUBMITTED':
      console.log('Swap submitted:', data);
      break;
    case 'BRIDGE_SUBMITTED':
      console.log('Bridge submitted:', data);
      break;
    case 'ERROR':
      console.error('Error:', data);
      break;
  }
});
```

### Event Types

- `READY` - Widget initialized
- `SWAP_REQUESTED` - User requested swap quote
- `SWAP_SUBMITTED` - Swap transaction submitted
- `SWAP_CONFIRMED` - Swap transaction confirmed
- `BRIDGE_REQUESTED` - User requested bridge quote
- `BRIDGE_SUBMITTED` - Bridge transaction submitted
- `BRIDGE_CONFIRMED` - Bridge completed
- `ERROR` - Error occurred

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Build output will be in `/dist` directory.
