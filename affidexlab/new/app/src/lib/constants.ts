// Token interface
export interface Token {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  logo: string;
  chainId: number;
}

// Chain IDs
export const CHAIN_IDS = {
  ARBITRUM: 42161,
  AVALANCHE: 43114,
  BASE: 8453,
  OPTIMISM: 10,
  POLYGON: 137,
} as const;

export type ChainKey = keyof typeof CHAIN_IDS;

// Chain metadata
export const CHAIN_METADATA: Record<ChainKey, { name: string; logo: string; nativeCurrency: string }> = {
  ARBITRUM: { name: "Arbitrum", logo: "/images/chains/arbitrum.png", nativeCurrency: "ETH" },
  AVALANCHE: { name: "Avalanche", logo: "/images/chains/avalanche.png", nativeCurrency: "AVAX" },
  BASE: { name: "Base", logo: "/images/chains/base.png", nativeCurrency: "ETH" },
  OPTIMISM: { name: "Optimism", logo: "/images/chains/optimism.png", nativeCurrency: "ETH" },
  POLYGON: { name: "Polygon", logo: "/images/chains/polygon.png", nativeCurrency: "MATIC" },
};

// Arbitrum Tokens
export const ARBITRUM_TOKENS: Token[] = [
  { symbol: "ETH", name: "Ethereum", address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", decimals: 18, logo: "https://tokens.1inch.io/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.png", chainId: CHAIN_IDS.ARBITRUM },
  { symbol: "WETH", name: "Wrapped Ether", address: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", decimals: 18, logo: "https://tokens.1inch.io/0x82af49447d8a07e3bd95bd0d56f35241523fbab1.png", chainId: CHAIN_IDS.ARBITRUM },
  { symbol: "USDC", name: "USD Coin", address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", decimals: 6, logo: "https://tokens.1inch.io/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png", chainId: CHAIN_IDS.ARBITRUM },
  { symbol: "USDC.e", name: "Bridged USDC", address: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8", decimals: 6, logo: "https://tokens.1inch.io/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png", chainId: CHAIN_IDS.ARBITRUM },
  { symbol: "USDT", name: "Tether USD", address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", decimals: 6, logo: "https://tokens.1inch.io/0xdac17f958d2ee523a2206206994597c13d831ec7.png", chainId: CHAIN_IDS.ARBITRUM },
  { symbol: "ARB", name: "Arbitrum", address: "0x912CE59144191C1204E64559FE8253a0e49E6548", decimals: 18, logo: "https://tokens.1inch.io/0x912ce59144191c1204e64559fe8253a0e49e6548.png", chainId: CHAIN_IDS.ARBITRUM },
  { symbol: "WBTC", name: "Wrapped BTC", address: "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f", decimals: 8, logo: "https://tokens.1inch.io/0x2260fac5e5542a773aa44fbcfedf7c193bc2c599.png", chainId: CHAIN_IDS.ARBITRUM },
  { symbol: "DAI", name: "Dai Stablecoin", address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1", decimals: 18, logo: "https://tokens.1inch.io/0x6b175474e89094c44da98b954eedeac495271d0f.png", chainId: CHAIN_IDS.ARBITRUM },
  { symbol: "LINK", name: "ChainLink Token", address: "0xf97f4df75117a78c1A5a0DBb814Af92458539FB4", decimals: 18, logo: "https://tokens.1inch.io/0x514910771af9ca656af840dff83e8264ecf986ca.png", chainId: CHAIN_IDS.ARBITRUM },
  { symbol: "UNI", name: "Uniswap", address: "0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0", decimals: 18, logo: "https://tokens.1inch.io/0x1f9840a85d5af5bf1d1762f925bdaddc4201f984.png", chainId: CHAIN_IDS.ARBITRUM },
];

// Avalanche Tokens
export const AVALANCHE_TOKENS: Token[] = [
  { symbol: "AVAX", name: "Avalanche", address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", decimals: 18, logo: "https://tokens.1inch.io/0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7.png", chainId: CHAIN_IDS.AVALANCHE },
  { symbol: "WAVAX", name: "Wrapped AVAX", address: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7", decimals: 18, logo: "https://tokens.1inch.io/0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7.png", chainId: CHAIN_IDS.AVALANCHE },
  { symbol: "USDC", name: "USD Coin", address: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E", decimals: 6, logo: "https://tokens.1inch.io/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png", chainId: CHAIN_IDS.AVALANCHE },
  { symbol: "USDT", name: "Tether USD", address: "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7", decimals: 6, logo: "https://tokens.1inch.io/0xdac17f958d2ee523a2206206994597c13d831ec7.png", chainId: CHAIN_IDS.AVALANCHE },
  { symbol: "WETH.e", name: "Wrapped ETH", address: "0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB", decimals: 18, logo: "https://tokens.1inch.io/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.png", chainId: CHAIN_IDS.AVALANCHE },
  { symbol: "WBTC.e", name: "Wrapped BTC", address: "0x50b7545627a5162F82A992c33b87aDc75187B218", decimals: 8, logo: "https://tokens.1inch.io/0x2260fac5e5542a773aa44fbcfedf7c193bc2c599.png", chainId: CHAIN_IDS.AVALANCHE },
];

// Base Tokens
export const BASE_TOKENS: Token[] = [
  { symbol: "ETH", name: "Ethereum", address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", decimals: 18, logo: "https://tokens.1inch.io/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.png", chainId: CHAIN_IDS.BASE },
  { symbol: "WETH", name: "Wrapped Ether", address: "0x4200000000000000000000000000000000000006", decimals: 18, logo: "https://tokens.1inch.io/0x4200000000000000000000000000000000000006.png", chainId: CHAIN_IDS.BASE },
  { symbol: "USDC", name: "USD Coin", address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", decimals: 6, logo: "https://tokens.1inch.io/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png", chainId: CHAIN_IDS.BASE },
  { symbol: "DAI", name: "Dai Stablecoin", address: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb", decimals: 18, logo: "https://tokens.1inch.io/0x6b175474e89094c44da98b954eedeac495271d0f.png", chainId: CHAIN_IDS.BASE },
];

// Optimism Tokens
export const OPTIMISM_TOKENS: Token[] = [
  { symbol: "ETH", name: "Ethereum", address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", decimals: 18, logo: "https://tokens.1inch.io/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.png", chainId: CHAIN_IDS.OPTIMISM },
  { symbol: "WETH", name: "Wrapped Ether", address: "0x4200000000000000000000000000000000000006", decimals: 18, logo: "https://tokens.1inch.io/0x4200000000000000000000000000000000000006.png", chainId: CHAIN_IDS.OPTIMISM },
  { symbol: "USDC", name: "USD Coin", address: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", decimals: 6, logo: "https://tokens.1inch.io/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png", chainId: CHAIN_IDS.OPTIMISM },
  { symbol: "USDT", name: "Tether USD", address: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58", decimals: 6, logo: "https://tokens.1inch.io/0xdac17f958d2ee523a2206206994597c13d831ec7.png", chainId: CHAIN_IDS.OPTIMISM },
  { symbol: "OP", name: "Optimism", address: "0x4200000000000000000000000000000000000042", decimals: 18, logo: "https://ethereum-optimism.github.io/data/OP/logo.png", chainId: CHAIN_IDS.OPTIMISM },
  { symbol: "DAI", name: "Dai Stablecoin", address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1", decimals: 18, logo: "https://tokens.1inch.io/0x6b175474e89094c44da98b954eedeac495271d0f.png", chainId: CHAIN_IDS.OPTIMISM },
];

// Polygon Tokens
export const POLYGON_TOKENS: Token[] = [
  { symbol: "MATIC", name: "Polygon", address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", decimals: 18, logo: "https://tokens.1inch.io/0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0.png", chainId: CHAIN_IDS.POLYGON },
  { symbol: "WMATIC", name: "Wrapped Matic", address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270", decimals: 18, logo: "https://tokens.1inch.io/0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0.png", chainId: CHAIN_IDS.POLYGON },
  { symbol: "USDC", name: "USD Coin", address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", decimals: 6, logo: "https://tokens.1inch.io/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png", chainId: CHAIN_IDS.POLYGON },
  { symbol: "USDT", name: "Tether USD", address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", decimals: 6, logo: "https://tokens.1inch.io/0xdac17f958d2ee523a2206206994597c13d831ec7.png", chainId: CHAIN_IDS.POLYGON },
  { symbol: "WETH", name: "Wrapped Ether", address: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619", decimals: 18, logo: "https://tokens.1inch.io/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.png", chainId: CHAIN_IDS.POLYGON },
  { symbol: "WBTC", name: "Wrapped BTC", address: "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6", decimals: 8, logo: "https://tokens.1inch.io/0x2260fac5e5542a773aa44fbcfedf7c193bc2c599.png", chainId: CHAIN_IDS.POLYGON },
  { symbol: "DAI", name: "Dai Stablecoin", address: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063", decimals: 18, logo: "https://tokens.1inch.io/0x6b175474e89094c44da98b954eedeac495271d0f.png", chainId: CHAIN_IDS.POLYGON },
];

// All tokens by chain
export const TOKENS_BY_CHAIN: Record<number, Token[]> = {
  [CHAIN_IDS.ARBITRUM]: ARBITRUM_TOKENS,
  [CHAIN_IDS.AVALANCHE]: AVALANCHE_TOKENS,
  [CHAIN_IDS.BASE]: BASE_TOKENS,
  [CHAIN_IDS.OPTIMISM]: OPTIMISM_TOKENS,
  [CHAIN_IDS.POLYGON]: POLYGON_TOKENS,
};

// API endpoints per chain
export const API_ENDPOINTS: Record<number, { zeroX?: string; cow?: string }> = {
  [CHAIN_IDS.ARBITRUM]: { zeroX: "https://arbitrum.api.0x.org", cow: "https://api.cow.fi/arbitrum/api/v1" },
  [CHAIN_IDS.AVALANCHE]: { zeroX: "https://avalanche.api.0x.org" },
  [CHAIN_IDS.BASE]: { zeroX: "https://base.api.0x.org", cow: "https://api.cow.fi/base/api/v1" },
  [CHAIN_IDS.OPTIMISM]: { zeroX: "https://optimism.api.0x.org", cow: "https://api.cow.fi/optimism/api/v1" },
  [CHAIN_IDS.POLYGON]: { zeroX: "https://polygon.api.0x.org" },
};

// Security constants
export const SECURITY_SETTINGS = {
  MAX_SLIPPAGE_PERCENT: 50,
  DEFAULT_SLIPPAGE_PERCENT: 0.5,
  HIGH_SLIPPAGE_WARNING_THRESHOLD: 5,
  LOW_SLIPPAGE_WARNING_THRESHOLD: 0.1,
  DEFAULT_TIMEOUT_MS: 1200000, // 20 minutes
  MIN_TIMEOUT_MS: 60000, // 1 minute
  MAX_TIMEOUT_MS: 3600000, // 60 minutes
  DUST_THRESHOLD_USD: 0.01,
} as const;

// Legacy exports (for existing imports)
export const ZERO_X_API_BASE = "https://arbitrum.api.0x.org";
export const COW_API_BASE = "https://api.cow.fi/arbitrum/api/v1";
export const SOCKET_API_BASE = "https://api.socket.tech/v2";
