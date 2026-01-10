#!/bin/bash
set -e

echo "==> Installing Node.js dependencies..."
npm install

echo "==> Checking Python availability..."
if command -v python3 &> /dev/null; then
    echo "==> Python 3 found, installing ML dependencies..."
    python3 -m pip install --user scikit-learn xgboost joblib pandas numpy || echo "Warning: Python packages not installed (Python may not be available on Node runtime)"
else
    echo "Warning: Python not available in Node.js runtime"
    echo "ML model will use fallback heuristic mode"
fi

echo "==> Build complete!"
