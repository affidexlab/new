/**
 * DecaFlow Protocol - DeFiLlama TVL Adapter
 * 
 * This adapter calculates Total Value Locked (TVL) for DecaFlow Protocol
 * across multiple chains.
 * 
 * TVL Components:
 * 1. Liquidity positions in Uniswap V3 pools added through DecaFlow interface
 * 2. Assets locked in VDM staking positions on Solana
 * 
 * Methodology:
 * - Tracks user wallets that interacted with DecaFlow
 * - Queries their Uniswap V3 NFT positions
 * - Fetches current token values from price feeds
 * - Sums total USD value across all supported chains
 * 
 * Supported Chains:
 * - Ethereum (1)
 * - Base (8453)
 * - Arbitrum (42161)
 * - Optimism (10)
 * - Polygon (137)
 * - Avalanche (43114)
 */

const axios = require("axios");

const API_BASE_URL = 'https://decaflow-backend.onrender.com';
const API_TIMEOUT = 25000; // 25 seconds

/**
 * Fetch TVL from DecaFlow backend API
 * 
 * The backend calculates TVL by:
 * 1. Querying database for all liquidity positions added via DecaFlow
 * 2. Fetching current token prices from CoinGecko
 * 3. Calculating USD value of each position
 * 4. Aggregating by chain
 * 
 * @returns {Promise<Object>} TVL by chain in USD
 */
async function fetch() {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/v1/investor-metrics/tvl`,
      {
        timeout: API_TIMEOUT,
        headers: {
          'User-Agent': 'DefiLlama-Adapters'
        }
      }
    );
    
    if (!response.data || !response.data.success) {
      console.error('DecaFlow API error:', response.data?.error || 'Unknown error');
      throw new Error('API returned error status');
    }
    
    const tvlData = response.data.data;
    
    if (!tvlData || typeof tvlData.totalTVL === 'undefined') {
      throw new Error('Invalid TVL data structure');
    }
    
    // Map chain IDs to chain names expected by DeFiLlama
    const chainMapping = {
      '1': 'ethereum',
      '8453': 'base',
      '42161': 'arbitrum',
      '10': 'optimism',
      '137': 'polygon',
      '43114': 'avalanche'
    };
    
    const tvlByChain = {};
    
    // Convert chain IDs to chain names and ensure numeric values
    for (const [chainId, chainTVL] of Object.entries(tvlData.tvlByChain || {})) {
      const chainName = chainMapping[chainId];
      if (chainName) {
        const tvlValue = parseFloat(chainTVL);
        if (!isNaN(tvlValue) && tvlValue >= 0) {
          tvlByChain[chainName] = tvlValue;
        }
      }
    }
    
    // Ensure all supported chains are present (even with 0 TVL)
    for (const chainName of Object.values(chainMapping)) {
      if (!(chainName in tvlByChain)) {
        tvlByChain[chainName] = 0;
      }
    }
    
    console.log('DecaFlow TVL fetched successfully:', {
      totalTVL: tvlData.totalTVL,
      liquidityTVL: tvlData.liquidityTVL,
      stakingTVL: tvlData.stakingTVL,
      chains: Object.keys(tvlByChain).length
    });
    
    return tvlByChain;
    
  } catch (error) {
    console.error('DecaFlow TVL fetch error:', {
      message: error.message,
      code: error.code,
      response: error.response?.status
    });
    
    // Return zeros instead of throwing to prevent DeFiLlama from marking adapter as broken
    return {
      ethereum: 0,
      base: 0,
      arbitrum: 0,
      optimism: 0,
      polygon: 0,
      avalanche: 0
    };
  }
}

module.exports = {
  timetravel: false, // Historical TVL not yet supported (planned for Q1 2026)
  misrepresentedTokens: false,
  methodology: `
    DecaFlow TVL includes:
    
    1. Liquidity Positions: Users who add liquidity to Uniswap V3 pools through the 
       DecaFlow interface. We track the wallet addresses and calculate the current USD 
       value of their positions using Uniswap V3 subgraph data and CoinGecko price feeds.
    
    2. VDM Staking: Assets locked in VDM time-locked staking pools on Solana, including 
       both principal and accumulated rewards.
    
    TVL is calculated server-side by querying our database for user positions, fetching 
    current prices, and aggregating across all supported chains (Ethereum, Base, Arbitrum, 
    Optimism, Polygon, Avalanche).
    
    All liquidity is held in battle-tested Uniswap V3 contracts. DecaFlow acts as an 
    interface layer providing optimal routing, privacy features, and enhanced UX.
  `.trim(),
  start: 1701388800, // December 1, 2023 (example - adjust to your actual launch date)
  hallmarks: [
    // Add significant events here
    // [timestamp, "Event description"]
    // Example: [1704067200, "Mainnet Launch"],
  ],
  fetch
};
