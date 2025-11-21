import { COINGECKO_NATIVE_IDS, COINGECKO_PLATFORMS } from "./constants";

const cache: Record<string, { t: number; v: number }> = {};
const TTL_MS = 5 * 60 * 1000;

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { "Accept": "application/json" } });
  if (!res.ok) throw new Error(`Price fetch failed: ${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}

export async function getNativePriceUSD(chainId: number): Promise<number> {
  const key = `native:${chainId}`;
  const now = Date.now();
  const c = cache[key];
  if (c && now - c.t < TTL_MS) return c.v;
  const id = COINGECKO_NATIVE_IDS[chainId];
  if (!id) return 0;
  const data = await fetchJson<Record<string, { usd: number }>>(
    `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(id)}&vs_currencies=usd`
  );
  const v = data?.[id]?.usd ?? 0;
  cache[key] = { t: now, v };
  return v;
}

export async function getTokenPriceUSD(chainId: number, tokenAddress: string): Promise<number> {
  const addr = tokenAddress.toLowerCase();
  const key = `token:${chainId}:${addr}`;
  const now = Date.now();
  const c = cache[key];
  if (c && now - c.t < TTL_MS) return c.v;
  const platform = COINGECKO_PLATFORMS[chainId];
  if (!platform) return 0;
  const url = `https://api.coingecko.com/api/v3/simple/token_price/${platform}?contract_addresses=${addr}&vs_currencies=usd`;
  const data = await fetchJson<Record<string, { usd: number }>>(url);
  const v = data?.[addr]?.usd ?? 0;
  cache[key] = { t: now, v };
  return v;
}