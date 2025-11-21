// Privacy mode implementation using CoW Protocol for MEV protection on Arbitrum
// CoW Protocol provides intent-based trading that protects against front-running and sandwich attacks

import { COW_API_BASE } from "./constants";

export type PrivacySwapParams = {
  sellToken: string;
  buyToken: string;
  sellAmount: string;
  buyAmount: string;
  validTo: number;
  appData: string;
  feeAmount: string;
  kind: "sell" | "buy";
  partiallyFillable: boolean;
  sellTokenBalance: "erc20" | "external" | "internal";
  buyTokenBalance: "erc20";
};

export type CowOrder = {
  sellToken: string;
  buyToken: string;
  sellAmount: string;
  buyAmount: string;
  validTo: number;
  appData: string;
  feeAmount: string;
  kind: "sell" | "buy";
  partiallyFillable: boolean;
  sellTokenBalance: string;
  buyTokenBalance: string;
  from: string;
  receiver?: string;
  signature?: string;
  signingScheme?: string;
};

// Submit order to CoW Protocol for MEV-protected execution
export async function submitCowOrder(params: {
  order: CowOrder;
  signature: string;
  signingScheme: string;
}): Promise<string> {
  try {
    const response = await fetch(`${COW_API_BASE}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...params.order,
        signature: params.signature,
        signingScheme: params.signingScheme,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`CoW order submission failed: ${errorData.description || response.statusText}`);
    }

    const data = await response.json();
    return data; // Returns order UID
  } catch (error) {
    console.error("CoW order submission failed:", error);
    throw error;
  }
}

// Create CoW Protocol order for privacy-protected swap
export function createCowOrder(params: {
  sellToken: string;
  buyToken: string;
  sellAmount: string;
  buyAmount: string;
  userAddress: string;
  validitySeconds?: number;
}): CowOrder {
  const validTo = Math.floor(Date.now() / 1000) + (params.validitySeconds || 600); // 10 min default
  
  return {
    sellToken: params.sellToken,
    buyToken: params.buyToken,
    sellAmount: params.sellAmount,
    buyAmount: params.buyAmount,
    validTo,
    appData: "0x0000000000000000000000000000000000000000000000000000000000000000",
    feeAmount: "0", // Fee is included in buyAmount
    kind: "sell",
    partiallyFillable: false,
    sellTokenBalance: "erc20",
    buyTokenBalance: "erc20",
    from: params.userAddress,
    receiver: params.userAddress,
  };
}

// Get EIP-712 domain for CoW Protocol on Arbitrum
export function getCowDomain() {
  return {
    name: "Gnosis Protocol",
    version: "v2",
    chainId: 42161, // Arbitrum One
    verifyingContract: "0x9008D19f58AAbD9eD0D60971565AA8510560ab41" as `0x${string}`, // Settlement contract on Arbitrum
  };
}

// Get EIP-712 types for CoW Protocol orders
export function getCowOrderTypes() {
  return {
    Order: [
      { name: "sellToken", type: "address" },
      { name: "buyToken", type: "address" },
      { name: "receiver", type: "address" },
      { name: "sellAmount", type: "uint256" },
      { name: "buyAmount", type: "uint256" },
      { name: "validTo", type: "uint32" },
      { name: "appData", type: "bytes32" },
      { name: "feeAmount", type: "uint256" },
      { name: "kind", type: "string" },
      { name: "partiallyFillable", type: "bool" },
      { name: "sellTokenBalance", type: "string" },
      { name: "buyTokenBalance", type: "string" },
    ],
  };
}

// Check if privacy mode is available for current chain
export function isPrivacyAvailable(chainId: number): boolean {
  // CoW Protocol supports Arbitrum One (42161)
  const supportedChains = [1, 100, 42161]; // Ethereum, Gnosis, Arbitrum One
  return supportedChains.includes(chainId);
}

export function getPrivacyDisclaimer(chainId: number): string {
  if (chainId === 42161) {
    return "Privacy mode uses CoW Protocol intents on Arbitrum to protect against MEV attacks like front-running and sandwich attacks.";
  }
  if (chainId === 1) {
    return "Privacy mode uses CoW Protocol to shield your transaction from MEV extraction through batch auctions.";
  }
  if (chainId === 100) {
    return "Privacy mode uses CoW Protocol on Gnosis Chain for MEV-protected trading.";
  }
  return "Privacy mode may have limited support on this chain.";
}

// Alternative: Private RPC endpoints for Arbitrum
// Note: Arbitrum has a centralized sequencer which provides some MEV protection by default
// But CoW Protocol adds additional protection through batch auction mechanism
export const ARBITRUM_PRIVATE_RPC = "https://arb1.arbitrum.io/rpc"; // Public RPC (Arbitrum has centralized sequencer)
