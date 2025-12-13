#!/bin/bash

# Deploy Updated LiquidityRouter with Native ETH Support
# This script deploys the updated router to all supported chains

set -e

echo "🚀 Deploying Updated LiquidityRouter with Native ETH Support"
echo "=================================================="
echo ""

# Check if deployer private key is set
if [ -z "$DEPLOYER_PRIVATE_KEY" ]; then
    echo "❌ Error: DEPLOYER_PRIVATE_KEY environment variable not set"
    echo "   Please set it with: export DEPLOYER_PRIVATE_KEY='0x...'"
    exit 1
fi

# Array of networks to deploy to
NETWORKS=("base" "arbitrum" "optimism" "polygon")

echo "📋 Deployment Plan:"
echo "   Networks: ${NETWORKS[@]}"
echo "   Treasury: $TREASURY_WALLET"
echo ""
read -p "Continue with deployment? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled"
    exit 1
fi

# Deploy to each network
DEPLOYED_ADDRESSES=()
for network in "${NETWORKS[@]}"; do
    echo ""
    echo "=================================================="
    echo "🌐 Deploying to $network..."
    echo "=================================================="
    
    if npx hardhat run deploy_router.js --network $network; then
        echo "✅ Successfully deployed to $network"
        # Extract address from output (you may need to adjust this based on actual output)
        DEPLOYED_ADDRESSES+=("$network: Check deployment logs for address")
    else
        echo "❌ Failed to deploy to $network"
        read -p "Continue with remaining deployments? (y/n) " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
done

echo ""
echo "=================================================="
echo "✅ Deployment Summary"
echo "=================================================="
for addr in "${DEPLOYED_ADDRESSES[@]}"; do
    echo "   $addr"
done

echo ""
echo "📝 Next Steps:"
echo "   1. Update addresses in app/src/lib/contracts.ts"
echo "   2. Update addresses in app/src/lib/liquidityRouter.ts"
echo "   3. Test ETH swaps on each chain"
echo "   4. Commit and push changes"
echo ""
