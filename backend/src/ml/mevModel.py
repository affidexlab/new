"""
DecaFlow ML-based MEV Prediction Model
Production-ready machine learning model for MEV risk prediction
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional
from datetime import datetime, timedelta
import joblib
from pathlib import Path

try:
    from sklearn.ensemble import GradientBoostingClassifier, GradientBoostingRegressor
    from sklearn.preprocessing import StandardScaler
    from sklearn.model_selection import train_test_split
    import xgboost as xgb
except ImportError:
    print("Warning: scikit-learn or xgboost not installed. Model training disabled.")


class MEVPredictionModel:
    """
    Production ML model for MEV risk prediction
    Uses XGBoost for high-performance inference (<20ms)
    """
    
    def __init__(self, model_path: Optional[str] = None):
        self.model_path = model_path or 'models/mev_model.pkl'
        self.scaler_path = 'models/scaler.pkl'
        
        self.model = None
        self.scaler = None
        self.feature_columns = [
            # Mempool features
            'pending_tx_count',
            'avg_gas_price',
            'gas_price_volatility',
            'mempool_congestion',
            
            # Token pair features
            'token_pair_volatility_30d',
            'liquidity_depth',
            'price_impact_estimate',
            'historical_mev_rate',
            
            # Trade features
            'trade_size_usd',
            'trade_size_relative',  # Relative to pool size
            'slippage_tolerance',
            
            # Temporal features
            'hour_of_day',
            'day_of_week',
            'is_weekend',
            'utc_hour',
            
            # Chain features
            'chain_risk_factor',
            'sequencer_delay',  # Arbitrum-specific
            'timeboost_active',  # Arbitrum Timeboost
            
            # Historical patterns
            'recent_mev_events_1h',
            'recent_mev_events_24h',
            'mev_bot_activity',
        ]
        
        # Load model if exists
        if Path(self.model_path).exists():
            self.load_model()
    
    def extract_features(self, trade_data: Dict) -> pd.DataFrame:
        """
        Extract features from trade data for model inference
        
        Args:
            trade_data: Dictionary with trade parameters and market data
        
        Returns:
            DataFrame with extracted features
        """
        features = {
            # Mempool features
            'pending_tx_count': trade_data.get('mempool', {}).get('pending_count', 100),
            'avg_gas_price': trade_data.get('mempool', {}).get('avg_gas_price', 0.1),
            'gas_price_volatility': trade_data.get('mempool', {}).get('gas_volatility', 0.2),
            'mempool_congestion': self._calculate_congestion(trade_data.get('mempool', {})),
            
            # Token pair features
            'token_pair_volatility_30d': trade_data.get('pair_volatility', 0.15),
            'liquidity_depth': trade_data.get('liquidity_usd', 1000000),
            'price_impact_estimate': self._estimate_price_impact(
                trade_data.get('amount_usd', 0),
                trade_data.get('liquidity_usd', 1000000)
            ),
            'historical_mev_rate': trade_data.get('historical_mev_rate', 0.005),
            
            # Trade features
            'trade_size_usd': trade_data.get('amount_usd', 0),
            'trade_size_relative': trade_data.get('amount_usd', 0) / trade_data.get('liquidity_usd', 1),
            'slippage_tolerance': trade_data.get('slippage', 0.5),
            
            # Temporal features
            'hour_of_day': datetime.now().hour,
            'day_of_week': datetime.now().weekday(),
            'is_weekend': 1 if datetime.now().weekday() >= 5 else 0,
            'utc_hour': datetime.utcnow().hour,
            
            # Chain features
            'chain_risk_factor': self._get_chain_risk_factor(trade_data.get('chain_id', 42161)),
            'sequencer_delay': trade_data.get('sequencer_delay', 0),
            'timeboost_active': trade_data.get('timeboost_active', 0),
            
            # Historical patterns
            'recent_mev_events_1h': trade_data.get('recent_mev_1h', 5),
            'recent_mev_events_24h': trade_data.get('recent_mev_24h', 80),
            'mev_bot_activity': trade_data.get('mev_bot_count', 3),
        }
        
        return pd.DataFrame([features])
    
    def predict_mev_risk(self, trade_data: Dict) -> Tuple[float, float, str]:
        """
        Predict MEV risk for a trade
        
        Args:
            trade_data: Trade parameters and market data
        
        Returns:
            Tuple of (risk_score, estimated_mev, risk_level)
        """
        if self.model is None:
            # Fallback to heuristic model if ML model not loaded
            return self._heuristic_prediction(trade_data)
        
        # Extract features
        features = self.extract_features(trade_data)
        
        # Scale features
        if self.scaler:
            features_scaled = self.scaler.transform(features[self.feature_columns])
        else:
            features_scaled = features[self.feature_columns].values
        
        # Predict risk score (0-10)
        risk_score = self.model.predict(features_scaled)[0]
        risk_score = np.clip(risk_score, 0, 10)
        
        # Estimate MEV amount
        estimated_mev = self._estimate_mev_amount(risk_score, trade_data.get('amount_usd', 0))
        
        # Determine risk level
        if risk_score >= 7.0:
            risk_level = 'high'
        elif risk_score >= 4.0:
            risk_level = 'medium'
        else:
            risk_level = 'low'
        
        return float(risk_score), float(estimated_mev), risk_level
    
    def train(self, training_data: pd.DataFrame) -> Dict[str, float]:
        """
        Train the MEV prediction model
        
        Args:
            training_data: Historical MEV data with labels
        
        Returns:
            Training metrics (accuracy, precision, recall)
        """
        print("Training MEV prediction model...")
        
        # Prepare training data
        X = training_data[self.feature_columns]
        y_risk = training_data['mev_risk_score']  # 0-10 scale
        y_mev = training_data['actual_mev_usd']  # Actual MEV extracted
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y_risk, test_size=0.2, random_state=42
        )
        
        # Scale features
        self.scaler = StandardScaler()
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Train XGBoost model (fast inference)
        self.model = xgb.XGBRegressor(
            n_estimators=100,
            max_depth=6,
            learning_rate=0.1,
            objective='reg:squarederror',
            random_state=42,
            n_jobs=-1,
        )
        
        self.model.fit(X_train_scaled, y_train)
        
        # Evaluate model
        train_score = self.model.score(X_train_scaled, y_train)
        test_score = self.model.score(X_test_scaled, y_test)
        
        # Predictions
        y_pred = self.model.predict(X_test_scaled)
        mae = np.mean(np.abs(y_pred - y_test))
        
        metrics = {
            'train_r2': float(train_score),
            'test_r2': float(test_score),
            'mae': float(mae),
        }
        
        print(f"Model trained - R²: {test_score:.3f}, MAE: {mae:.3f}")
        
        # Save model
        self.save_model()
        
        return metrics
    
    def save_model(self):
        """Save trained model to disk"""
        Path(self.model_path).parent.mkdir(parents=True, exist_ok=True)
        joblib.dump(self.model, self.model_path)
        joblib.dump(self.scaler, self.scaler_path)
        print(f"Model saved to {self.model_path}")
    
    def load_model(self):
        """Load trained model from disk"""
        if Path(self.model_path).exists():
            self.model = joblib.load(self.model_path)
            self.scaler = joblib.load(self.scaler_path)
            print(f"Model loaded from {self.model_path}")
        else:
            print("No trained model found. Using heuristic fallback.")
    
    def _heuristic_prediction(self, trade_data: Dict) -> Tuple[float, float, str]:
        """
        Fallback heuristic prediction when ML model not available
        """
        amount_usd = trade_data.get('amount_usd', 0)
        hour = datetime.utcnow().hour
        
        # Time-based risk
        time_risk = 0.3 if hour < 8 else 0.95 if 12 <= hour <= 15 else 0.6
        
        # Size-based risk
        if amount_usd >= 100000:
            size_mult = 2.5
        elif amount_usd >= 10000:
            size_mult = 1.5
        else:
            size_mult = 1.0
        
        # Calculate risk score
        risk_score = time_risk * 10 * size_mult
        risk_score = min(risk_score, 10.0)
        
        # Estimate MEV
        mev_percentage = (risk_score / 10) * 0.02
        estimated_mev = amount_usd * mev_percentage
        
        # Risk level
        if risk_score >= 7.0:
            risk_level = 'high'
        elif risk_score >= 4.0:
            risk_level = 'medium'
        else:
            risk_level = 'low'
        
        return risk_score, estimated_mev, risk_level
    
    def _calculate_congestion(self, mempool_data: Dict) -> float:
        """Calculate mempool congestion level (0-1)"""
        pending = mempool_data.get('pending_count', 100)
        # Normalize: 0-500 pending txs maps to 0-1 congestion
        return min(pending / 500, 1.0)
    
    def _estimate_price_impact(self, trade_size: float, liquidity: float) -> float:
        """Estimate price impact percentage"""
        if liquidity == 0:
            return 1.0
        return (trade_size / liquidity) ** 0.5 * 0.1
    
    def _get_chain_risk_factor(self, chain_id: int) -> float:
        """Get chain-specific risk factor"""
        factors = {
            1: 1.0,      # Ethereum
            42161: 0.6,  # Arbitrum
            8453: 0.7,   # Base
            10: 0.7,     # Optimism
            137: 0.8,    # Polygon
            43114: 0.75, # Avalanche
        }
        return factors.get(chain_id, 0.8)
    
    def _estimate_mev_amount(self, risk_score: float, amount_usd: float) -> float:
        """Estimate MEV extraction amount based on risk score"""
        # Higher risk = higher MEV percentage
        mev_percentage = (risk_score / 10) * 0.025  # Max 2.5% at highest risk
        return amount_usd * mev_percentage
    
    def get_feature_importance(self) -> Dict[str, float]:
        """Get feature importance from trained model"""
        if self.model is None or not hasattr(self.model, 'feature_importances_'):
            return {}
        
        importance = dict(zip(self.feature_columns, self.model.feature_importances_))
        # Sort by importance
        return dict(sorted(importance.items(), key=lambda x: x[1], reverse=True))


# Global model instance
_model_instance = None

def get_model() -> MEVPredictionModel:
    """Get or create global model instance"""
    global _model_instance
    if _model_instance is None:
        _model_instance = MEVPredictionModel()
    return _model_instance


def predict_mev_risk(trade_data: Dict) -> Dict:
    """
    Convenience function for MEV risk prediction
    
    Args:
        trade_data: Trade parameters and market data
    
    Returns:
        Dictionary with risk_score, estimated_mev, risk_level
    """
    model = get_model()
    risk_score, estimated_mev, risk_level = model.predict_mev_risk(trade_data)
    
    return {
        'risk_score': risk_score,
        'estimated_mev': estimated_mev,
        'risk_level': risk_level,
        'recommendation': _get_recommendation(risk_level, estimated_mev),
    }


def _get_recommendation(risk_level: str, estimated_mev: float) -> str:
    """Get human-readable recommendation"""
    if risk_level == 'high':
        return f"High MEV risk detected (~${estimated_mev:.2f}). Privacy routing strongly recommended."
    elif risk_level == 'medium':
        return f"Medium MEV risk (~${estimated_mev:.2f}). Consider privacy routing for trades >$10,000."
    else:
        return "Low MEV risk. Direct routing recommended for faster execution."


if __name__ == '__main__':
    # Test the model
    model = get_model()
    
    test_trade = {
        'amount_usd': 50000,
        'chain_id': 42161,
        'liquidity_usd': 5000000,
        'pair_volatility': 0.18,
        'mempool': {
            'pending_count': 250,
            'avg_gas_price': 0.05,
            'gas_volatility': 0.15,
        },
    }
    
    result = predict_mev_risk(test_trade)
    print("\nTest Prediction:")
    print(f"Risk Score: {result['risk_score']:.2f}/10")
    print(f"Risk Level: {result['risk_level']}")
    print(f"Estimated MEV: ${result['estimated_mev']:.2f}")
    print(f"Recommendation: {result['recommendation']}")
