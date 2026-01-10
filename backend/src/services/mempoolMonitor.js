/**
 * Real-time Mempool Monitoring Service
 * Monitors Arbitrum mempool for MEV opportunities and threats
 */

const { ethers } = require('ethers');
const EventEmitter = require('events');

class MempoolMonitor extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.providers = [];
    this.isRunning = false;
    this.mempoolCache = new Map();
    this.mevPatterns = new Map();
    
    this.config = {
      chains: config.chains || [42161],
      updateInterval: config.updateInterval || 1000,
      maxCacheSize: config.maxCacheSize || 10000,
      enablePatternDetection: config.enablePatternDetection !== false,
    };
    
    this.initializeProviders();
  }

  initializeProviders() {
    const rpcEndpoints = {
      42161: [
        process.env.ARBITRUM_RPC_1 || 'https://arb1.arbitrum.io/rpc',
        process.env.ARBITRUM_RPC_2 || 'https://arbitrum-one.publicnode.com',
        'https://arbitrum.llamarpc.com',
      ],
      1: [
        process.env.ETHEREUM_RPC_1 || 'https://eth.llamarpc.com',
        'https://ethereum.publicnode.com',
      ],
    };

    for (const chainId of this.config.chains) {
      const endpoints = rpcEndpoints[chainId] || [];
      
      for (const endpoint of endpoints) {
        try {
          const provider = new ethers.providers.JsonRpcProvider(endpoint);
          this.providers.push({
            chainId,
            provider,
            endpoint,
            connected: false,
          });
        } catch (err) {
          console.error(`Failed to initialize provider for ${endpoint}:`, err.message);
        }
      }
    }

    console.log(`Initialized ${this.providers.length} mempool providers`);
  }

  async start() {
    if (this.isRunning) {
      console.log('Mempool monitor already running');
      return;
    }

    console.log('Starting mempool monitor...');
    this.isRunning = true;

    for (const providerConfig of this.providers) {
      try {
        await providerConfig.provider.ready;
        providerConfig.connected = true;
        
        this.subscribeToMempool(providerConfig);
        
        console.log(`Connected to ${providerConfig.endpoint} (Chain ${providerConfig.chainId})`);
      } catch (err) {
        console.error(`Failed to connect to ${providerConfig.endpoint}:`, err.message);
      }
    }

    this.startMonitoringLoop();
    this.emit('started');
  }

  subscribeToMempool(providerConfig) {
    const { provider, chainId } = providerConfig;

    try {
      provider.on('pending', async (txHash) => {
        if (!this.isRunning) return;

        try {
          const tx = await provider.getTransaction(txHash);
          
          if (tx) {
            this.processPendingTransaction(tx, chainId);
          }
        } catch (err) {
          // Ignore errors for individual transactions
        }
      });
    } catch (err) {
      console.error(`Failed to subscribe to mempool on chain ${chainId}:`, err.message);
    }
  }

  processPendingTransaction(tx, chainId) {
    const txData = {
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      value: tx.value.toString(),
      gasPrice: tx.gasPrice?.toString() || '0',
      gasLimit: tx.gasLimit.toString(),
      data: tx.data,
      chainId,
      timestamp: Date.now(),
    };

    this.mempoolCache.set(tx.hash, txData);

    if (this.mempoolCache.size > this.config.maxCacheSize) {
      const oldestKey = this.mempoolCache.keys().next().value;
      this.mempoolCache.delete(oldestKey);
    }

    if (this.config.enablePatternDetection) {
      this.detectMEVPatterns(txData);
    }

    this.emit('transaction', txData);
  }

  detectMEVPatterns(txData) {
    if (!txData.to || !txData.data || txData.data === '0x') {
      return;
    }

    const methodId = txData.data.slice(0, 10);
    
    const knownMEVMethods = {
      '0x38ed1739': 'swapExactTokensForTokens',
      '0x7ff36ab5': 'swapExactETHForTokens',
      '0x18cbafe5': 'swapExactTokensForETH',
      '0x8803dbee': 'swapTokensForExactTokens',
      '0xfb3bdb41': 'swapETHForExactTokens',
      '0x4a25d94a': 'swapTokensForExactETH',
      '0xac9650d8': 'multicall',
      '0x5ae401dc': 'multicall (UniswapV3)',
    };

    if (knownMEVMethods[methodId]) {
      const pattern = {
        type: 'potential_mev',
        method: knownMEVMethods[methodId],
        txHash: txData.hash,
        from: txData.from,
        to: txData.to,
        gasPrice: txData.gasPrice,
        timestamp: txData.timestamp,
        chainId: txData.chainId,
      };

      this.emit('mev-pattern', pattern);
      
      const botAddress = txData.from;
      if (!this.mevPatterns.has(botAddress)) {
        this.mevPatterns.set(botAddress, []);
      }
      this.mevPatterns.get(botAddress).push(pattern);
    }
  }

  startMonitoringLoop() {
    this.monitoringInterval = setInterval(() => {
      if (!this.isRunning) return;

      const stats = this.getMempoolStats();
      this.emit('stats-update', stats);
    }, this.config.updateInterval);
  }

  getMempoolStats(chainId = null) {
    const now = Date.now();
    const recentWindow = 5 * 60 * 1000;

    let transactions = Array.from(this.mempoolCache.values());
    
    if (chainId) {
      transactions = transactions.filter(tx => tx.chainId === chainId);
    }

    const recentTransactions = transactions.filter(
      tx => now - tx.timestamp < recentWindow
    );

    const gasPrices = recentTransactions
      .map(tx => parseFloat(ethers.utils.formatUnits(tx.gasPrice, 'gwei')))
      .filter(price => price > 0);

    const avgGasPrice = gasPrices.length > 0
      ? gasPrices.reduce((a, b) => a + b, 0) / gasPrices.length
      : 0;

    const medianGasPrice = gasPrices.length > 0
      ? gasPrices.sort((a, b) => a - b)[Math.floor(gasPrices.length / 2)]
      : 0;

    const gasVolatility = gasPrices.length > 1
      ? this.calculateStdDev(gasPrices) / avgGasPrice
      : 0;

    const congestionLevel = Math.min(recentTransactions.length / 100, 10);

    const mevBotCount = new Set(
      Array.from(this.mevPatterns.keys()).filter(address => {
        const patterns = this.mevPatterns.get(address);
        return patterns.some(p => now - p.timestamp < recentWindow);
      })
    ).size;

    return {
      chainId: chainId || 'all',
      timestamp: now,
      pendingTxCount: recentTransactions.length,
      totalCachedTxs: transactions.length,
      gasPrice: {
        average: avgGasPrice.toFixed(2),
        median: medianGasPrice.toFixed(2),
        volatility: gasVolatility.toFixed(3),
      },
      congestionLevel: congestionLevel.toFixed(1),
      mevBotActivity: mevBotCount,
      recentMEVEvents: {
        last1h: this.countRecentMEVEvents(60),
        last24h: this.countRecentMEVEvents(1440),
      },
    };
  }

  countRecentMEVEvents(minutes) {
    const cutoff = Date.now() - minutes * 60 * 1000;
    let count = 0;

    for (const patterns of this.mevPatterns.values()) {
      count += patterns.filter(p => p.timestamp > cutoff).length;
    }

    return count;
  }

  calculateStdDev(values) {
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(value => Math.pow(value - avg, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
    return Math.sqrt(variance);
  }

  getOptimalGasPrice(chainId) {
    const stats = this.getMempoolStats(chainId);
    const avgGas = parseFloat(stats.gasPrice.average);
    const volatility = parseFloat(stats.gasPrice.volatility);
    
    const premium = 1 + volatility * 0.5;
    const optimalGas = avgGas * premium;
    
    return ethers.utils.parseUnits(optimalGas.toFixed(2), 'gwei').toString();
  }

  getMEVRiskLevel(chainId) {
    const stats = this.getMempoolStats(chainId);
    const congestion = parseFloat(stats.congestionLevel);
    const mevBots = stats.mevBotActivity;
    const volatility = parseFloat(stats.gasPrice.volatility);

    const riskScore = Math.min(
      (congestion * 0.4 + mevBots * 0.3 + volatility * 10 * 0.3) * 0.8,
      10
    );

    return {
      riskScore: riskScore.toFixed(2),
      riskLevel: riskScore >= 7 ? 'high' : riskScore >= 4 ? 'medium' : 'low',
      factors: {
        congestion,
        mevBotActivity: mevBots,
        gasVolatility: volatility,
      },
    };
  }

  async stop() {
    console.log('Stopping mempool monitor...');
    this.isRunning = false;

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    for (const providerConfig of this.providers) {
      try {
        providerConfig.provider.removeAllListeners('pending');
      } catch (err) {
        console.error('Error removing listener:', err.message);
      }
    }

    this.emit('stopped');
  }

  getConnectionStatus() {
    return {
      running: this.isRunning,
      providers: this.providers.map(p => ({
        chainId: p.chainId,
        endpoint: p.endpoint,
        connected: p.connected,
      })),
      cacheSize: this.mempoolCache.size,
      knownMEVBots: this.mevPatterns.size,
    };
  }
}

let mempoolMonitorInstance = null;

function getMempoolMonitor(config) {
  if (!mempoolMonitorInstance) {
    mempoolMonitorInstance = new MempoolMonitor(config);
  }
  return mempoolMonitorInstance;
}

module.exports = {
  MempoolMonitor,
  getMempoolMonitor,
};
