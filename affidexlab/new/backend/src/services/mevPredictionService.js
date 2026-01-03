/**
 * MEV Prediction Service
 * AI-powered MEV risk scoring and route optimization
 */

import { ethers } from 'ethers';

// Historical MEV data simulation (in production, this would be from a database with ML model)
const MEV_PATTERNS = {
  // Risk factors by hour of day (UTC)
  hourlyRisk: {
    0: 0.3, 1: 0.25, 2: 0.2, 3: 0.15, // Low risk overnight
    4: 0.2, 5: 0.3, 6: 0.4, 7: 0.5,
    8: 0.6, 9: 0.7, 10: 0.8, 11: 0.85, // Peak risk during US/EU trading hours
    12: 0.9, 13: 0.95, 14: 1.0, 15: 0.95,
    16: 0.9, 17: 0.85, 18: 0.8, 19: 0.7,
    20: 0.6, 21: 0.5, 22: 0.4, 23: 0.35,
  },
  
  // Risk multipliers by trade size (USD)
  sizeMultipliers: [
    { threshold: 1000, multiplier: 1.0 },
    { threshold: 10000, multiplier: 1.3 },
    { threshold: 50000, multiplier: 1.6 },
    { threshold: 100000, multiplier: 2.0 },
    { threshold: 500000, multiplier: 2.5 },
    { threshold: 1000000, multiplier: 3.0 },
  ],
  
  // Volatile pairs have higher MEV risk
  volatilePairs: new Set([
    'ETH-USDC', 'WETH-USDC', 'ETH-USDT', 'WETH-USDT',
    'BTC-USDC', 'WBTC-USDC', 'BTC-USDT', 'WBTC-USDT',
  ]),
};

/**
 * Calculate MEV risk score for a trade
 * @param {Object} params - Trade parameters
 * @returns {Object} Risk assessment
 */
export async function calculateMEVRisk(params) {
  const { chainId, tokenIn, tokenOut, amount, tokenInPrice, tokenOutPrice } = params;
  
  // Calculate trade size in USD
  const amountBigInt = BigInt(amount);
  const decimals = 18; // Assume 18 decimals (adjust based on token)
  const amountInUnits = Number(ethers.utils.formatUnits(amountBigInt, decimals));
  const tradeSizeUSD = amountInUnits * (tokenInPrice || 1);
  
  // Time-based risk factor
  const currentHour = new Date().getUTCHours();
  const timeRiskFactor = MEV_PATTERNS.hourlyRisk[currentHour] || 0.5;
  
  // Size-based risk multiplier
  let sizeMultiplier = 1.0;
  for (const { threshold, multiplier } of MEV_PATTERNS.sizeMultipliers) {
    if (tradeSizeUSD >= threshold) {
      sizeMultiplier = multiplier;
    }
  }
  
  // Pair volatility factor
  const pairKey = `${getTokenSymbol(tokenIn)}-${getTokenSymbol(tokenOut)}`;
  const volatilityMultiplier = MEV_PATTERNS.volatilePairs.has(pairKey) ? 1.4 : 1.0;
  
  // Chain-specific risk (Arbitrum has lower MEV than Ethereum mainnet)
  const chainRiskFactor = getChainRiskFactor(chainId);
  
  // Calculate base risk score (0-10 scale)
  const baseRisk = timeRiskFactor * 10;
  const adjustedRisk = Math.min(baseRisk * sizeMultiplier * volatilityMultiplier * chainRiskFactor, 10);
  
  // Estimate MEV exposure in USD (using research-backed formula)
  // MEV typically ranges from 0.1% to 2% of trade size depending on conditions
  const mevPercentage = (adjustedRisk / 10) * 0.02; // Max 2% at highest risk
  const estimatedMEV = tradeSizeUSD * mevPercentage;
  
  // Determine risk level
  let riskLevel = 'low';
  let recommendation = 'Direct routing recommended for faster execution.';
  
  if (adjustedRisk >= 7.0) {
    riskLevel = 'high';
    recommendation = 'Privacy routing strongly recommended. High MEV risk detected.';
  } else if (adjustedRisk >= 4.0) {
    riskLevel = 'medium';
    recommendation = 'Consider privacy routing for trades >$10,000.';
  }
  
  // Calculate optimal routing strategy
  const optimalRoute = determineOptimalRoute(adjustedRisk, tradeSizeUSD, chainId);
  
  return {
    riskScore: parseFloat(adjustedRisk.toFixed(2)),
    riskLevel,
    estimatedMEV: parseFloat(estimatedMEV.toFixed(2)),
    estimatedMEVPercentage: parseFloat((mevPercentage * 100).toFixed(4)),
    recommendation,
    optimalRoute,
    factors: {
      timeOfDay: currentHour,
      timeRiskFactor: parseFloat(timeRiskFactor.toFixed(2)),
      tradeSizeUSD: parseFloat(tradeSizeUSD.toFixed(2)),
      sizeMultiplier,
      volatilityMultiplier,
      chainRiskFactor,
    },
  };
}

/**
 * Calculate potential MEV savings from privacy routing
 * @param {number} riskScore - MEV risk score
 * @param {number} estimatedMEV - Estimated MEV in USD
 * @returns {Object} Savings estimate
 */
export function calculateMEVSavings(riskScore, estimatedMEV) {
  // Privacy routing saves approximately 70-95% of MEV depending on risk level
  const savingsRate = riskScore >= 7.0 ? 0.95 : riskScore >= 4.0 ? 0.80 : 0.70;
  const savedAmount = estimatedMEV * savingsRate;
  
  return {
    estimatedMEVWithoutProtection: estimatedMEV,
    estimatedMEVSaved: parseFloat(savedAmount.toFixed(2)),
    savingsPercentage: savingsRate * 100,
  };
}

/**
 * Calculate usage fee (1% of transaction value)
 * @param {number} tradeSizeUSD - Trade size in USD
 * @returns {number} Usage fee in USD
 */
export function calculateUsageFee(tradeSizeUSD) {
  return tradeSizeUSD * 0.01; // 1% usage fee
}

/**
 * Calculate performance fee (3.5% of MEV saved)
 * @param {number} mevSaved - MEV saved in USD
 * @returns {number} Performance fee in USD
 */
export function calculatePerformanceFee(mevSaved) {
  return mevSaved * 0.035; // 3.5% performance fee
}

/**
 * Calculate total fees for protected transaction
 * @param {number} tradeSizeUSD - Trade size in USD
 * @param {number} mevSaved - MEV saved in USD
 * @returns {Object} Fee breakdown
 */
export function calculateProtectedTransactionFees(tradeSizeUSD, mevSaved) {
  const usageFee = calculateUsageFee(tradeSizeUSD);
  const performanceFee = calculatePerformanceFee(mevSaved);
  const totalFees = usageFee + performanceFee;
  
  return {
    usageFee: parseFloat(usageFee.toFixed(2)),
    usageFeePercentage: 1.0,
    performanceFee: parseFloat(performanceFee.toFixed(2)),
    performanceFeePercentage: 3.5,
    totalFees: parseFloat(totalFees.toFixed(2)),
    netBenefit: parseFloat((mevSaved - totalFees).toFixed(2)),
  };
}

/**
 * Determine optimal routing strategy based on risk and trade parameters
 */
function determineOptimalRoute(riskScore, tradeSizeUSD, chainId) {
  // High risk or large trades → Privacy routing
  if (riskScore >= 7.0 || tradeSizeUSD >= 50000) {
    return {
      route: 'cow-protocol',
      reason: 'High MEV risk detected or large trade size',
      expectedDelay: '+12 seconds',
    };
  }
  
  // Medium risk with significant size → Privacy routing
  if (riskScore >= 4.0 && tradeSizeUSD >= 10000) {
    return {
      route: 'cow-protocol',
      reason: 'Medium MEV risk with significant trade size',
      expectedDelay: '+10 seconds',
    };
  }
  
  // Low risk or small trades → Direct routing for speed
  return {
    route: 'direct',
    reason: 'Low MEV risk - prioritizing speed',
    expectedDelay: '+2 seconds',
  };
}

/**
 * Get chain-specific risk factor
 */
function getChainRiskFactor(chainId) {
  const chainFactors = {
    1: 1.0, // Ethereum mainnet (highest MEV)
    42161: 0.6, // Arbitrum (lower MEV due to sequencer)
    8453: 0.7, // Base
    10: 0.7, // Optimism
    137: 0.8, // Polygon
    43114: 0.75, // Avalanche
  };
  
  return chainFactors[chainId] || 0.8;
}

/**
 * Get token symbol from address (simplified)
 */
function getTokenSymbol(address) {
  const knownTokens = {
    '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1': 'WETH', // Arbitrum WETH
    '0xaf88d065e77c8cC2239327C5EDb3A432268e5831': 'USDC', // Arbitrum USDC
    '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE': 'ETH',
    // Add more as needed
  };
  
  return knownTokens[address] || 'TOKEN';
}

/**
 * Get historical MEV data for analytics (simulated for MVP)
 */
export async function getHistoricalMEVData(chainId, days = 30) {
  // In production, this would query a database with actual MEV extraction data
  // For MVP, we simulate realistic data
  
  const data = [];
  const now = Date.now();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now - i * 24 * 60 * 60 * 1000);
    const dayOfWeek = date.getDay();
    
    // Weekdays have more MEV than weekends
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const baseVolume = isWeekend ? 8000000 : 15000000;
    const baseMEV = isWeekend ? 120000 : 240000;
    
    // Add some randomness
    const randomFactor = 0.8 + Math.random() * 0.4;
    
    data.push({
      date: date.toISOString().split('T')[0],
      totalVolume: baseVolume * randomFactor,
      mevExtracted: baseMEV * randomFactor,
      transactionsAffected: Math.floor((5000 + Math.random() * 2000) * randomFactor),
      averageMEVPerTx: (baseMEV / 5000) * randomFactor,
    });
  }
  
  return data;
}

export default {
  calculateMEVRisk,
  calculateMEVSavings,
  calculateUsageFee,
  calculatePerformanceFee,
  calculateProtectedTransactionFees,
  getHistoricalMEVData,
};
