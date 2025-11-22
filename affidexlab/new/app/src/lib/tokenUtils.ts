import { type Token } from "./constants";
import { erc20Abi } from "viem";
import { readContract } from "@wagmi/core";
import { config } from "@/wagmi";

const CUSTOM_TOKENS_KEY = "decaflow_custom_tokens";

export function getCustomTokens(): Token[] {
  try {
    const stored = localStorage.getItem(CUSTOM_TOKENS_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((t: any) => {
      if (!t || typeof t !== 'object') return false;
      if (!t.address || !t.symbol || typeof t.decimals !== 'number' || !t.chainId) return false;
      return isValidAddress(t.address) && t.decimals >= 0 && t.decimals <= 18;
    });
  } catch {
    localStorage.removeItem(CUSTOM_TOKENS_KEY);
    return [];
  }
}

export function saveCustomToken(token: Token): void {
  const tokens = getCustomTokens();
  const exists = tokens.find((t) => t.address.toLowerCase() === token.address.toLowerCase() && t.chainId === token.chainId);
  if (!exists) {
    tokens.push(token);
    localStorage.setItem(CUSTOM_TOKENS_KEY, JSON.stringify(tokens));
  }
}

export function removeCustomToken(address: string, chainId: number): void {
  const tokens = getCustomTokens();
  const filtered = tokens.filter((t) => !(t.address.toLowerCase() === address.toLowerCase() && t.chainId === chainId));
  localStorage.setItem(CUSTOM_TOKENS_KEY, JSON.stringify(filtered));
}

export function isCustomToken(address: string, chainId: number): boolean {
  const tokens = getCustomTokens();
  return tokens.some((t) => t.address.toLowerCase() === address.toLowerCase() && t.chainId === chainId);
}

export async function fetchTokenMetadata(address: string, chainId: number): Promise<Partial<Token>> {
  try {
    const [symbol, name, decimals] = await Promise.all([
      readContract(config, {
        address: address as `0x${string}`,
        abi: erc20Abi,
        functionName: "symbol",
        chainId,
      }),
      readContract(config, {
        address: address as `0x${string}`,
        abi: erc20Abi,
        functionName: "name",
        chainId,
      }),
      readContract(config, {
        address: address as `0x${string}`,
        abi: erc20Abi,
        functionName: "decimals",
        chainId,
      }),
    ]);

    return {
      symbol: symbol as string,
      name: name as string,
      decimals: decimals as number,
      address,
      chainId,
      logo: `https://tokens.1inch.io/${address.toLowerCase()}.png`,
    };
  } catch (error) {
    throw new Error("Failed to fetch token metadata. Please verify the address is a valid ERC20 token.");
  }
}

import { isAddress, getAddress } from "viem";
export function isValidAddress(address: string): boolean {
  try {
    if (!isAddress(address)) return false;
    // getAddress throws if checksum invalid
    getAddress(address);
    return true;
  } catch {
    return false;
  }
}

export function searchTokens(tokens: Token[], query: string): Token[] {
  const lowerQuery = query.toLowerCase().trim();
  
  if (!lowerQuery) return tokens;

  return tokens.filter((token) => {
    return (
      token.symbol.toLowerCase().includes(lowerQuery) ||
      token.name.toLowerCase().includes(lowerQuery) ||
      token.address.toLowerCase().includes(lowerQuery)
    );
  });
}

export function calculateUSDValue(amountInWei: string, decimals: number, priceUSD: number): number {
  const amount = parseFloat(amountInWei) / Math.pow(10, decimals);
  return amount * priceUSD;
}
