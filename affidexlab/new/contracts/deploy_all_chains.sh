#!/bin/bash

# DecaFlow LiquidityRouter Multi-Chain Deployment Script
# This script deploys the LiquidityRouter to all supported chains

set -e

echo "🚀 DecaFlow LiquidityRouter Multi-Chain Deployment"
echo "=================================================="
echo ""

# Check for required environment variables
if [ -z "$DEPLOYER_PRIVATE_KEY" ]; then
    echo "❌ Error: DEPLOYER_PRIVATE_KEY environment variable is not set"
    echo "   Please set it with: export DEPLOYER_PRIVATE_KEY=your_private_key"
    exit 1
fi

if [ -z "$TREASURY_WALLET" ]; then
    echo "⚠️  Warning: TREASURY_WALLET not set, using default: 0x65b7a307a7e67e38840b91f9a36bf8dfe6e02901"
    export TREASURY_WALLET="0x65b7a307a7e67e38840b91f9a36bf8dfe6e02901"
fi

echo "Treasury Wallet: $TREASURY_WALLET"
echo ""

# Navigate to contracts directory
cd "$(dirname "$0")"

# Array of networks to deploy to
NETWORKS=("base" "arbitrum" "optimism" "polygon" "avalanche")

# Store deployed addresses
declare -A DEPLOYED_ADDRESSES

echo "📋 Deployment Plan:"
echo "  - Base (Uniswap V3 + Aerodrome)"
echo "  - Arbitrum (Uniswap V3)"
echo "  - Optimism (Uniswap V3)"
echo "  - Polygon (Uniswap V3)"
echo "  - Avalanche (Uniswap V3)"
echo ""
echo "⏳ Starting deployments in 5 seconds..."
sleep 5

# Deploy to each network
for network in "${NETWORKS[@]}"; do
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🌐 Deploying to $network..."
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    if npx hardhat run deploy_router.js --network "$network"; then
        echo "✅ Successfully deployed to $network"
        
        # Extract deployed address from output (you'll need to parse this from the deployment output)
        # For now, we'll note that manual verification is needed
        echo "   Please note the deployed address from the output above"
    else
        echo "❌ Failed to deploy to $network"
        echo "   Check the error above and retry if needed"
    fi
    
    echo ""
    sleep 2
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ Deployment Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Next Steps:"
echo ""
echo "1. Copy the deployed addresses from the output above"
echo ""
echo "2. Update app/src/lib/contracts.ts:"
echo "   export const LIQUIDITY_ROUTER_ADDRESSES = {"
echo "     8453: '0x...', // Base"
echo "     42161: '0x...', // Arbitrum"
echo "     10: '0x...', // Optimism"
echo "     137: '0x...', // Polygon"
echo "     43114: '0x...', // Avalanche"
echo "   };"
echo ""
echo "3. Update app/src/lib/liquidityRouter.ts:"
echo "   export const LIQUIDITY_ROUTER_ADDRESSES = {"
echo "     [CHAIN_IDS.BASE]: '0x...',"
echo "     [CHAIN_IDS.ARBITRUM]: '0x...',"
echo "     // ... etc"
echo "   };"
echo ""
echo "4. Set Vercel Environment Variable:"
echo "   VITE_TREASURY_WALLET=$TREASURY_WALLET"
echo ""
echo "5. Deploy frontend to Vercel"
echo ""
echo "6. Test swaps on each chain"
echo ""
echo "🎉 DecaFlow is now production-ready!"
