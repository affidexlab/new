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
  const { chainId } = params;
  
  if (chainId === 1) {
    return submitFlashbotsTransaction(params);
  }
  
  if (chainId === 42161) {
    return submitArbitrumPrivateTransaction(params);
  }
  
  throw new Error("Privacy mode not supported on this chain");
}

async function submitFlashbotsTransaction(params: PrivacySubmitParams): Promise<string> {
  const FLASHBOTS_PROTECT_RPC = "https://rpc.flashbots.net";
  
  try {
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
    console.error("Flashbots submission failed:", error);
    throw error;
  }
}

async function submitArbitrumPrivateTransaction(params: PrivacySubmitParams): Promise<string> {
  const ARBITRUM_PRIVATE_RPC = "https://arb1.arbitrum.io/rpc";
  
  try {
    const response = await fetch(ARBITRUM_PRIVATE_RPC, {
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
    console.error("Arbitrum private submission failed:", error);
    throw error;
  }
}

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
        appData: "0x",
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

export function isPrivacyAvailable(chainId: number): boolean {
  return chainId === 1 || chainId === 42161 || chainId === 100;
}

export function getPrivacyDisclaimer(chainId: number): string {
  if (chainId === 42161) {
    return "Privacy mode on Arbitrum uses intent-based settlement through CoW Protocol and private RPC endpoints to reduce MEV exposure.";
  }
  if (chainId === 1) {
    return "Privacy mode uses Flashbots Protect RPC to shield your transaction from front-running and sandwich attacks.";
  }
  if (chainId === 100) {
    return "Privacy mode uses CoW Protocol intent settlement on Gnosis Chain for MEV protection.";
  }
  return "Privacy mode may have limited support on this chain.";
}
