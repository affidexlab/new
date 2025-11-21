// Arbitrum Mainnet Token Addresses
export const ARBITRUM_TOKENS = [
  {
    symbol: "ETH",
    name: "Ethereum",
    address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", // Native ETH
    decimals: 18,
    logo: "https://tokens.1inch.io/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.png"
  },
  {
    symbol: "WETH",
    name: "Wrapped Ether",
    address: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
    decimals: 18,
    logo: "https://tokens.1inch.io/0x82af49447d8a07e3bd95bd0d56f35241523fbab1.png"
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    decimals: 6,
    logo: "https://tokens.1inch.io/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png"
  },
  {
    symbol: "USDC.e",
    name: "Bridged USDC",
    address: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
    decimals: 6,
    logo: "https://tokens.1inch.io/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png"
  },
  {
    symbol: "USDT",
    name: "Tether USD",
    address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
    decimals: 6,
    logo: "https://tokens.1inch.io/0xdac17f958d2ee523a2206206994597c13d831ec7.png"
  },
  {
    symbol: "ARB",
    name: "Arbitrum",
    address: "0x912CE59144191C1204E64559FE8253a0e49E6548",
    decimals: 18,
    logo: "https://tokens.1inch.io/0x912ce59144191c1204e64559fe8253a0e49e6548.png"
  },
  {
    symbol: "WBTC",
    name: "Wrapped BTC",
    address: "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f",
    decimals: 8,
    logo: "https://tokens.1inch.io/0x2260fac5e5542a773aa44fbcfedf7c193bc2c599.png"
  },
  {
    symbol: "DAI",
    name: "Dai Stablecoin",
    address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
    decimals: 18,
    logo: "https://tokens.1inch.io/0x6b175474e89094c44da98b954eedeac495271d0f.png"
  },
  {
    symbol: "LINK",
    name: "ChainLink Token",
    address: "0xf97f4df75117a78c1A5a0DBb814Af92458539FB4",
    decimals: 18,
    logo: "https://tokens.1inch.io/0x514910771af9ca656af840dff83e8264ecf986ca.png"
  },
  {
    symbol: "UNI",
    name: "Uniswap",
    address: "0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0",
    decimals: 18,
    logo: "https://tokens.1inch.io/0x1f9840a85d5af5bf1d1762f925bdaddc4201f984.png"
  }
];

export const CHAIN_IDS = {
  ARBITRUM: 42161,
  BASE: 8453,
  OPTIMISM: 10,
  POLYGON: 137,
} as const;

export const ZERO_X_API_BASE = "https://arbitrum.api.0x.org";
export const COW_API_BASE = "https://api.cow.fi/arbitrum/api/v1"; // CoW Protocol Arbitrum One
export const SOCKET_API_BASE = "https://api.socket.tech/v2";
