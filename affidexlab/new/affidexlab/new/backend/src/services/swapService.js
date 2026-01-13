import fetch from 'node-fetch';
import crypto from 'crypto';

const quoteStore = new Map();

const CHAIN_CONFIGS = {
  1: { name: 'Ethereum', zeroX: 'https://api.0x.org' },
  8453: { name: 'Base', zeroX: 'https://base.api.0x.org', aerodrome: true },
  42161: { name: 'Arbitrum', zeroX: 'https://arbitrum.api.0x.org' },
  10: { name: 'Optimism', zeroX: 'https://optimism.api.0x.org' },
  137: { name: 'Polygon', zeroX: 'https://polygon.api.0x.org' },
  43114: { name: 'Avalanche', zeroX: 'https://avalanche.api.0x.org' }
};

export async function getSwapQuote(params, partner) {
  const { fromToken, toToken, amount, chainId, slippage = 0.5, walletAddress } = params;

  const chainConfig = CHAIN_CONFIGS[chainId];
  if (!chainConfig) {
    throw new Error(`Unsupported chain ID: ${chainId}`);
  }

  const quotes = [];

  try {
    const zeroXQuote = await fetch0xQuote({
      sellToken: fromToken,
      buyToken: toToken,
      sellAmount: amount,
      takerAddress: walletAddress,
      slippagePercentage: slippage / 100,
      chainId
    });
    
    if (zeroXQuote) {
      quotes.push({
        provider: '0x',
        protocol: 'Aggregated',
        buyAmount: zeroXQuote.buyAmount,
        sellAmount: zeroXQuote.sellAmount,
        price: zeroXQuote.price,
        estimatedGas: zeroXQuote.estimatedGas || '150000',
        guaranteedPrice: zeroXQuote.guaranteedPrice,
        sources: zeroXQuote.sources || []
      });
    }
  } catch (error) {
    console.error('0x quote error:', error.message);
  }

  if (chainConfig.aerodrome && chainId === 8453) {
    quotes.push({
      provider: 'Aerodrome',
      protocol: 'AMM',
      buyAmount: calculateEstimatedOutput(amount, 0.997),
      sellAmount: amount,
      price: '0.997',
      estimatedGas: '180000',
      note: 'Estimated quote - actual may vary'
    });
  }

  if (quotes.length === 0) {
    throw new Error('No quotes available for this pair');
  }

  quotes.sort((a, b) => BigInt(b.buyAmount) - BigInt(a.buyAmount));

  const quoteId = crypto.randomBytes(16).toString('hex');
  const quote = {
    quoteId,
    fromToken,
    toToken,
    amount,
    chainId,
    slippage,
    walletAddress,
    routes: quotes,
    bestRoute: quotes[0],
    priceImpact: calculatePriceImpact(quotes[0]),
    expiresAt: Date.now() + 30000,
    createdAt: new Date().toISOString()
  };

  quoteStore.set(quoteId, quote);

  setTimeout(() => quoteStore.delete(quoteId), 35000);

  return quote;
}

export async function executeSwap(params, partner) {
  const { quoteId, walletAddress } = params;

  const quote = quoteStore.get(quoteId);
  if (!quote) {
    throw new Error('Quote not found or expired');
  }

  if (Date.now() > quote.expiresAt) {
    quoteStore.delete(quoteId);
    throw new Error('Quote has expired');
  }

  try {
    const chainConfig = CHAIN_CONFIGS[quote.chainId];
    
    const priceParams = new URLSearchParams({
      sellToken: quote.fromToken,
      buyToken: quote.toToken,
      sellAmount: quote.amount,
      takerAddress: walletAddress,
      slippagePercentage: (quote.slippage / 100).toString()
    });

    const response = await fetch(
      `${chainConfig.zeroX}/swap/v1/price?${priceParams}`,
      {
        headers: {
          '0x-api-key': process.env.ZEROX_API_KEY || ''
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to get execution data from 0x');
    }

    const data = await response.json();

    return {
      quoteId,
      to: data.to,
      data: data.data,
      value: data.value || '0',
      gasLimit: data.gas || '200000',
      chainId: quote.chainId,
      estimatedOutput: quote.bestRoute.buyAmount,
      metadata: {
        protocol: quote.bestRoute.provider,
        priceImpact: quote.priceImpact,
        executedAt: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('Execute swap error:', error);
    throw new Error(`Failed to execute swap: ${error.message}`);
  }
}

async function fetch0xQuote(params) {
  const { sellToken, buyToken, sellAmount, takerAddress, slippagePercentage, chainId } = params;
  
  const chainConfig = CHAIN_CONFIGS[chainId];
  if (!chainConfig?.zeroX) {
    return null;
  }

  const queryParams = new URLSearchParams({
    sellToken,
    buyToken,
    sellAmount,
    takerAddress,
    slippagePercentage: slippagePercentage.toString()
  });

  try {
    const response = await fetch(
      `${chainConfig.zeroX}/swap/v1/quote?${queryParams}`,
      {
        headers: {
          '0x-api-key': process.env.ZEROX_API_KEY || ''
        }
      }
    );

    if (!response.ok) {
      console.error(`0x API error: ${response.status}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('0x fetch error:', error);
    return null;
  }
}

function calculateEstimatedOutput(inputAmount, rate) {
  try {
    const input = BigInt(inputAmount);
    const rateMultiplier = BigInt(Math.floor(rate * 1000));
    return ((input * rateMultiplier) / BigInt(1000)).toString();
  } catch {
    return inputAmount;
  }
}

function calculatePriceImpact(route) {
  return '0.1';
}
