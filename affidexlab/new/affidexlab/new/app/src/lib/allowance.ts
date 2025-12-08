import { erc20Abi } from "viem";
import { readContract } from "wagmi/actions";
import { logger } from "./logger";

export async function checkTokenAllowance(
  tokenAddress: string,
  ownerAddress: string,
  spenderAddress: string,
  config: any
): Promise<bigint> {
  try {
    const allowance = await readContract(config, {
      address: tokenAddress as `0x${string}`,
      abi: erc20Abi,
      functionName: "allowance",
      args: [ownerAddress as `0x${string}`, spenderAddress as `0x${string}`],
    });
    return allowance as bigint;
  } catch (error) {
    logger.error("Allowance check error", error);
    throw new Error("Failed to check token allowance");
  }
}
