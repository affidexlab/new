"""
Batch swap operations for DecaFlow
"""

import asyncio
from typing import List, Dict, Any
from datetime import datetime

from .client import DecaFlowClient
from .models import SwapParams, BatchSwapRequest, BatchSwapResult
from .exceptions import DecaFlowError


class BatchSwapManager:
    """
    Manager for executing multiple swaps in batch
    
    Example:
        >>> client = DecaFlowClient(api_key="your-key")
        >>> manager = BatchSwapManager(client)
        >>> swaps = [
        ...     SwapParams(from_token="0x...", to_token="0x...", ...),
        ...     SwapParams(from_token="0x...", to_token="0x...", ...),
        ... ]
        >>> result = await manager.execute_batch(swaps, strategy="parallel")
    """
    
    def __init__(self, client: DecaFlowClient):
        """
        Initialize batch manager
        
        Args:
            client: DecaFlow client instance
        """
        self.client = client
    
    async def execute_batch(
        self,
        swaps: List[SwapParams],
        strategy: str = "parallel",
        fail_on_error: bool = False,
        signer = None,
    ) -> BatchSwapResult:
        """
        Execute multiple swaps in batch
        
        Args:
            swaps: List of swap parameters
            strategy: Execution strategy ("parallel" or "sequential")
            fail_on_error: Stop batch if one swap fails
            signer: Web3 account for signing transactions
            
        Returns:
            BatchSwapResult with execution results
        """
        start_time = datetime.utcnow()
        results = []
        successful = 0
        failed = 0
        total_mev_saved = "0"
        
        if strategy == "parallel":
            tasks = [self._execute_single_swap(swap, signer) for swap in swaps]
            swap_results = await asyncio.gather(*tasks, return_exceptions=True)
            
            for result in swap_results:
                if isinstance(result, Exception):
                    failed += 1
                    results.append({"error": str(result), "success": False})
                    if fail_on_error:
                        break
                else:
                    successful += 1
                    results.append(result)
        
        elif strategy == "sequential":
            for swap in swaps:
                try:
                    result = await self._execute_single_swap(swap, signer)
                    successful += 1
                    results.append(result)
                except Exception as e:
                    failed += 1
                    results.append({"error": str(e), "success": False})
                    if fail_on_error:
                        break
        
        else:
            raise ValueError(f"Invalid strategy: {strategy}")
        
        execution_time = (datetime.utcnow() - start_time).total_seconds() * 1000
        
        return BatchSwapResult(
            batch_id=f"batch_{int(start_time.timestamp())}",
            total_swaps=len(swaps),
            successful=successful,
            failed=failed,
            results=results,
            total_mev_saved=total_mev_saved,
            execution_time_ms=int(execution_time),
        )
    
    async def _execute_single_swap(
        self,
        params: SwapParams,
        signer = None,
    ) -> Dict[str, Any]:
        """Execute a single swap"""
        quote = await self.client.get_swap_quote(params)
        
        if signer:
            tx_hash = await self.client.execute_swap(quote, signer)
            return {
                "success": True,
                "tx_hash": tx_hash,
                "quote": quote.dict(),
                "mev_saved": quote.estimated_mev_saved,
            }
        else:
            return {
                "success": True,
                "quote": quote.dict(),
                "mev_saved": quote.estimated_mev_saved,
            }
