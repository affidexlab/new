"""
DecaFlow Python Client
Main client for interacting with DecaFlow MEV protection API
"""

import asyncio
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
import aiohttp
from web3 import Web3
from eth_account import Account
from eth_account.signers.local import LocalAccount

from .models import (
    SwapParams,
    SwapQuote,
    MEVRiskScore,
    TransactionStatus,
    ProtectionStats,
    Chain,
)
from .exceptions import (
    NetworkError,
    ValidationError,
    MEVProtectionError,
    QuoteExpiredError,
)


class DecaFlowClient:
    """
    DecaFlow Python SDK Client
    
    Provides MEV protection and privacy swaps for Python applications.
    
    Example:
        >>> client = DecaFlowClient(api_key="your-api-key", chain=Chain.ARBITRUM)
        >>> quote = await client.get_swap_quote(SwapParams(
        ...     from_token="0x...",
        ...     to_token="0x...",
        ...     amount="1000000000000000000",
        ...     from_address="0x..."
        ... ))
        >>> tx_hash = await client.execute_swap(quote, signer)
    """
    
    def __init__(
        self,
        api_key: Optional[str] = None,
        base_url: str = "https://api.decaflow.xyz",
        chain: Chain = Chain.ARBITRUM,
        timeout: int = 30,
    ):
        """
        Initialize DecaFlow client
        
        Args:
            api_key: API key for authentication (optional for public endpoints)
            base_url: Base URL for DecaFlow API
            chain: Default blockchain network
            timeout: Request timeout in seconds
        """
        self.api_key = api_key
        self.base_url = base_url.rstrip('/')
        self.chain = chain
        self.timeout = timeout
        self._session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        """Async context manager entry"""
        await self._ensure_session()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        await self.close()
    
    async def _ensure_session(self):
        """Ensure aiohttp session exists"""
        if self._session is None or self._session.closed:
            headers = {"Content-Type": "application/json"}
            if self.api_key:
                headers["Authorization"] = f"Bearer {self.api_key}"
            self._session = aiohttp.ClientSession(headers=headers)
    
    async def close(self):
        """Close the HTTP session"""
        if self._session and not self._session.closed:
            await self._session.close()
    
    async def _request(
        self,
        method: str,
        endpoint: str,
        data: Optional[Dict] = None,
        params: Optional[Dict] = None,
    ) -> Dict[str, Any]:
        """Make HTTP request to DecaFlow API"""
        await self._ensure_session()
        
        url = f"{self.base_url}{endpoint}"
        
        try:
            async with self._session.request(
                method,
                url,
                json=data,
                params=params,
                timeout=aiohttp.ClientTimeout(total=self.timeout),
            ) as response:
                response_data = await response.json()
                
                if response.status >= 400:
                    error_msg = response_data.get("error", "Unknown error")
                    raise NetworkError(
                        f"API request failed: {error_msg}",
                        code=str(response.status),
                        details=response_data,
                    )
                
                return response_data
        
        except aiohttp.ClientError as e:
            raise NetworkError(f"Network error: {str(e)}")
        except asyncio.TimeoutError:
            raise NetworkError("Request timed out")
    
    async def get_swap_quote(self, params: SwapParams) -> SwapQuote:
        """
        Get a swap quote with MEV protection
        
        Args:
            params: Swap parameters
            
        Returns:
            SwapQuote with pricing and MEV risk assessment
            
        Raises:
            ValidationError: Invalid parameters
            NetworkError: API communication error
        """
        data = params.dict()
        data['chain'] = params.chain.value
        
        response = await self._request(
            "POST",
            "/v1/swap/quote",
            data=data,
        )
        
        return SwapQuote(**response)
    
    async def execute_swap(
        self,
        quote: SwapQuote,
        signer: LocalAccount,
    ) -> str:
        """
        Execute a swap with MEV protection
        
        Args:
            quote: Swap quote from get_swap_quote()
            signer: Web3 account for signing transaction
            
        Returns:
            Transaction hash
            
        Raises:
            QuoteExpiredError: Quote has expired
            MEVProtectionError: Failed to apply MEV protection
            NetworkError: API communication error
        """
        if datetime.utcnow() > quote.expires_at:
            raise QuoteExpiredError("Swap quote has expired")
        
        data = {
            "quote_id": quote.quote_id,
            "from_address": signer.address,
        }
        
        response = await self._request(
            "POST",
            "/v1/swap/execute",
            data=data,
        )
        
        tx_data = response.get("transaction")
        if not tx_data:
            raise MEVProtectionError("No transaction data returned")
        
        signed_tx = signer.sign_transaction(tx_data)
        
        submit_response = await self._request(
            "POST",
            "/v1/swap/submit",
            data={
                "signed_transaction": signed_tx.rawTransaction.hex(),
                "quote_id": quote.quote_id,
            },
        )
        
        return submit_response.get("tx_hash")
    
    async def get_mev_risk_score(
        self,
        from_token: str,
        to_token: str,
        amount: str,
        chain: Optional[Chain] = None,
    ) -> MEVRiskScore:
        """
        Get MEV risk assessment for a potential swap
        
        Args:
            from_token: Source token address
            to_token: Destination token address
            amount: Swap amount
            chain: Blockchain network (default: client default)
            
        Returns:
            MEVRiskScore with risk analysis
        """
        response = await self._request(
            "POST",
            "/v1/mev/risk-score",
            data={
                "from_token": from_token,
                "to_token": to_token,
                "amount": amount,
                "chain": (chain or self.chain).value,
            },
        )
        
        return MEVRiskScore(**response)
    
    async def get_transaction_status(self, tx_hash: str) -> TransactionStatus:
        """
        Get status of a submitted transaction
        
        Args:
            tx_hash: Transaction hash
            
        Returns:
            TransactionStatus with current status
        """
        response = await self._request(
            "GET",
            f"/v1/swap/status/{tx_hash}",
        )
        
        return TransactionStatus(**response)
    
    async def get_protection_stats(self, address: str) -> ProtectionStats:
        """
        Get MEV protection statistics for an address
        
        Args:
            address: Wallet address
            
        Returns:
            ProtectionStats with user statistics
        """
        response = await self._request(
            "GET",
            f"/v1/analytics/user/{address}/stats",
        )
        
        return ProtectionStats(**response)
    
    async def get_swap_history(
        self,
        address: str,
        limit: int = 10,
        offset: int = 0,
    ) -> List[Dict[str, Any]]:
        """
        Get swap history for an address
        
        Args:
            address: Wallet address
            limit: Number of results to return
            offset: Pagination offset
            
        Returns:
            List of historical swaps
        """
        response = await self._request(
            "GET",
            f"/v1/analytics/user/{address}/history",
            params={"limit": limit, "offset": offset},
        )
        
        return response.get("swaps", [])
    
    async def health_check(self) -> Dict[str, Any]:
        """
        Check API health status
        
        Returns:
            Health status information
        """
        return await self._request("GET", "/health")
