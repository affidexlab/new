"""
Custom exceptions for DecaFlow SDK
"""


class DecaFlowError(Exception):
    """Base exception for all DecaFlow errors"""
    def __init__(self, message: str, code: str = None, details: dict = None):
        super().__init__(message)
        self.message = message
        self.code = code
        self.details = details or {}


class NetworkError(DecaFlowError):
    """Error communicating with DecaFlow API"""
    pass


class ValidationError(DecaFlowError):
    """Invalid input parameters"""
    pass


class MEVProtectionError(DecaFlowError):
    """Error applying MEV protection"""
    pass


class InsufficientLiquidityError(DecaFlowError):
    """Not enough liquidity for swap"""
    pass


class SlippageExceededError(DecaFlowError):
    """Price slippage exceeded tolerance"""
    pass


class QuoteExpiredError(DecaFlowError):
    """Swap quote has expired"""
    pass


class TransactionFailedError(DecaFlowError):
    """Transaction execution failed"""
    pass
