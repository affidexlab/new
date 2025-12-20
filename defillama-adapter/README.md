# DecaFlow DeFiLlama Adapter

This directory contains the TVL adapter for submitting DecaFlow Protocol to DeFiLlama.

## Files

- `index.js` - The adapter code that fetches TVL data
- `README.md` - This file

## Testing Locally

To test this adapter before submission:

```bash
# Clone DeFiLlama adapters repo
git clone https://github.com/DefiLlama/DefiLlama-Adapters.git
cd DefiLlama-Adapters

# Copy this adapter
cp -r /path/to/this/directory ./projects/decaflow

# Install dependencies
npm install

# Test the adapter
npm run test projects/decaflow
```

## Submission Process

See `../DEFILLAMA_SUBMISSION_GUIDE.md` for full instructions.

Quick steps:
1. Fork https://github.com/DefiLlama/DefiLlama-Adapters
2. Copy this directory to `projects/decaflow/`
3. Add entry to `projects/list.json`
4. Test locally
5. Submit pull request

## API Endpoint

The adapter calls: `https://decaflow-backend.onrender.com/v1/investor-metrics/tvl`

This endpoint returns:
```json
{
  "success": true,
  "data": {
    "totalTVL": 150000.50,
    "liquidityTVL": 120000.25,
    "stakingTVL": 30000.25,
    "tvlByChain": {
      "1": 50000.00,
      "8453": 40000.00,
      "42161": 30000.00,
      "10": 15000.00,
      "137": 10000.00,
      "43114": 5000.00
    }
  }
}
```

## Chains Supported

- Ethereum (1)
- Base (8453)
- Arbitrum (42161)
- Optimism (10)
- Polygon (137)
- Avalanche (43114)

## Contact

For questions about this adapter:
- GitHub: https://github.com/affidexlab/new
- Website: https://decaflow.xyz
- Twitter: @DecaFlowXYZ
