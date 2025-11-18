// Privacy submission using Flashbots Protect RPC for Arbitrum
// This helps protect against MEV (front-running, sandwich attacks)

const FLASHBOTS_PROTECT_RPC = "https://rpc.flashbots.net";

export type PrivacySubmitParams = {
  transaction: {
    to: string;
    data: string;
    value?: string;
    from: string;
  };
  chainId: number;
};

export async function submitPrivateTransaction(params: PrivacySubmitParams): Promise<string> {
  try {
    // Flashbots Protect submission
    const response = await fetch(FLASHBOTS_PROTECT_RPC, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_sendRawTransaction",
        params: [params.transaction],
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }

    return data.result;
  } catch (error) {
    console.error("Private submission failed:", error);
    throw error;
  }
}

// Alternative: CoW Protocol intent-based privacy
export async function submitCowIntent(params: {
  order: any;
  signature: string;
}): Promise<string> {
  const COW_API = "https://api.cow.fi/mainnet/api/v1/orders";
  
  try {
    const response = await fetch(COW_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...params.order,
        signature: params.signature,
        signingScheme: "eip712",
        appData: "0x", // App-specific data
      }),
    });

    if (!response.ok) {
      throw new Error(`CoW submission failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.orderUid;
  } catch (error) {
    console.error("CoW intent submission failed:", error);
    throw error;
  }
}

// Check if privacy mode is available for current chain
export function isPrivacyAvailable(chainId: number): boolean {
  // Flashbots Protect currently supports Ethereum mainnet (1)
  // For Arbitrum and other L2s, privacy is more limited
  // CoW Protocol works on Ethereum mainnet and Gnosis Chain
  
  const supportedChains = [1, 100]; // Ethereum, Gnosis
  return supportedChains.includes(chainId);
}

export function getPrivacyDisclaimer(chainId: number): string {
  if (chainId === 42161) {
    return "Privacy mode on Arbitrum uses CoW intents where available. Full MEV protection is limited on L2s.";
  }
  if (chainId === 1) {
    return "Privacy mode uses Flashbots Protect RPC to shield your transaction from front-running.";
  }
  return "Privacy mode may have limited support on this chain.";
}
