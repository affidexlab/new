"""
Data models for DecaFlow SDK
"""

from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field, validator


class Chain(str, Enum):
    """Supported blockchain networks"""
    ARBITRUM = "arbitrum"
    ETHEREUM = "ethereum"
    BASE = "base"
    OPTIMISM = "optimism"
    POLYGON = "polygon"
    AVALANCHE = "avalanche"


class RiskLevel(str, Enum):
    """MEV risk level categories"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class SwapParams(BaseModel):
    """Parameters for requesting a swap quote"""
    from_token: str = Field(..., description="Source token address")
    to_token: str = Field(..., description="Destination token address")
    amount: str = Field(..., description="Amount to swap (in token decimals)")
    from_address: str = Field(..., description="Sender wallet address")
    chain: Chain = Field(Chain.ARBITRUM, description="Blockchain network")
    slippage_bps: int = Field(50, description="Slippage tolerance in basis points")
    use_privacy: bool = Field(True, description="Enable MEV protection")
    
    @validator('from_token', 'to_token', 'from_address')
    def validate_address(cls, v):
        if not v.startswith('0x') or len(v) != 42:
            raise ValueError(f"Invalid Ethereum address: {v}")
        return v.lower()


class SwapQuote(BaseModel):
    """Quote for a swap with MEV protection"""
    quote_id: str
    from_token: str
    to_token: str
    from_amount: str
    to_amount: str
    to_amount_min: str
    price: str
    price_impact: float
    gas_estimate: int
    route: List[str]
    mev_risk_score: float
    estimated_mev_saved: str
    fees: Dict[str, str]
    expires_at: datetime
    metadata: Optional[Dict[str, Any]] = None


class MEVRiskScore(BaseModel):
    """MEV risk assessment for a transaction"""
    risk_score: float = Field(..., ge=0.0, le=10.0, description="Risk score 0-10")
    risk_level: RiskLevel
    estimated_mev: str = Field(..., description="Estimated MEV in USD")
    factors: Dict[str, Any] = Field(default_factory=dict)
    recommendations: List[str] = Field(default_factory=list)
    optimal_route: str
    timeboost_recommended: bool = False
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class TransactionStatus(BaseModel):
    """Status of a submitted transaction"""
    tx_hash: str
    status: str
    confirmations: int
    mev_saved: Optional[str] = None
    actual_price: Optional[str] = None
    gas_used: Optional[int] = None
    timestamp: datetime
    metadata: Optional[Dict[str, Any]] = None


class ProtectionStats(BaseModel):
    """User's MEV protection statistics"""
    total_swaps: int
    protected_swaps: int
    total_mev_saved: str
    protection_rate: float
    rank: Optional[int] = None
    achievements: List[str] = Field(default_factory=list)
    historical_savings: List[Dict[str, Any]] = Field(default_factory=list)


class BatchSwapRequest(BaseModel):
    """Request for batch swap execution"""
    swaps: List[SwapParams]
    strategy: str = Field("parallel", description="Execution strategy: parallel or sequential")
    max_slippage_bps: int = Field(100, description="Max slippage for entire batch")
    fail_on_error: bool = Field(False, description="Stop batch if one swap fails")


class BatchSwapResult(BaseModel):
    """Result of batch swap execution"""
    batch_id: str
    total_swaps: int
    successful: int
    failed: int
    results: List[Dict[str, Any]]
    total_mev_saved: str
    execution_time_ms: int
