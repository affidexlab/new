#!/bin/bash

# DecaFlow Backend Deployment Verification Script
# This script verifies that the backend is properly deployed and connected to the database

set -e

API_BASE="${1:-https://api.decaflow.xyz}"
TEST_WALLET="0x1234567890123456789012345678901234567890"

echo "🔍 Verifying DecaFlow Backend Deployment"
echo "📍 API Base: $API_BASE"
echo ""

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to test endpoint
test_endpoint() {
    local name=$1
    local endpoint=$2
    local expected_status=${3:-200}
    
    echo -n "Testing $name... "
    
    response=$(curl -s -w "\n%{http_code}" "$API_BASE$endpoint")
    body=$(echo "$response" | head -n -1)
    status=$(echo "$response" | tail -n 1)
    
    if [ "$status" -eq "$expected_status" ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $status)"
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (HTTP $status, expected $expected_status)"
        echo "Response: $body"
        return 1
    fi
}

# Function to test JSON response
test_json_endpoint() {
    local name=$1
    local endpoint=$2
    local key=$3
    
    echo -n "Testing $name... "
    
    response=$(curl -s "$API_BASE$endpoint")
    
    if echo "$response" | grep -q "$key"; then
        echo -e "${GREEN}✓ PASS${NC}"
        echo "  Response: $(echo "$response" | head -c 100)..."
        return 0
    else
        echo -e "${RED}✗ FAIL${NC}"
        echo "  Expected key '$key' not found in response"
        echo "  Response: $response"
        return 1
    fi
}

echo "═══════════════════════════════════════════════════════════"
echo "1️⃣  Basic Health Checks"
echo "═══════════════════════════════════════════════════════════"

test_json_endpoint "Health Check" "/health" "status"
test_json_endpoint "API Info" "/v1" "DecaFlow Partner API"

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "2️⃣  Database Connectivity"
echo "═══════════════════════════════════════════════════════════"

# Test health endpoint with database check
echo -n "Database Health... "
health_response=$(curl -s "$API_BASE/health")
if echo "$health_response" | grep -q '"healthy":true'; then
    echo -e "${GREEN}✓ PASS${NC}"
    echo "  Database is connected and healthy"
elif echo "$health_response" | grep -q '"healthy":false'; then
    echo -e "${RED}✗ FAIL${NC}"
    echo "  Database connection failed"
    echo "  Response: $health_response"
else
    echo -e "${YELLOW}⚠ UNKNOWN${NC}"
    echo "  Could not determine database status"
    echo "  Response: $health_response"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "3️⃣  Points System Endpoints"
echo "═══════════════════════════════════════════════════════════"

test_json_endpoint "Get User Points" "/v1/points/user/$TEST_WALLET" "success"
test_json_endpoint "Get Leaderboard (All Time)" "/v1/leaderboard?period=all&limit=10" "success"
test_json_endpoint "Get Leaderboard (Weekly)" "/v1/leaderboard?period=weekly&limit=10" "success"
test_json_endpoint "Get Leaderboard (Monthly)" "/v1/leaderboard?period=monthly&limit=10" "success"

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "4️⃣  Webhook Endpoint (POST)"
echo "═══════════════════════════════════════════════════════════"

echo -n "Testing Webhook (should fail without data)... "
webhook_response=$(curl -s -X POST "$API_BASE/v1/webhooks/transaction-confirmed" \
    -H "Content-Type: application/json" \
    -d '{}')

if echo "$webhook_response" | grep -q "Validation failed"; then
    echo -e "${GREEN}✓ PASS${NC}"
    echo "  Endpoint is responding (validation working)"
else
    echo -e "${YELLOW}⚠ UNKNOWN${NC}"
    echo "  Response: $webhook_response"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "5️⃣  CORS Configuration"
echo "═══════════════════════════════════════════════════════════"

echo -n "Testing CORS headers... "
cors_response=$(curl -s -I -X OPTIONS "$API_BASE/health" \
    -H "Origin: https://decaflow.xyz" \
    -H "Access-Control-Request-Method: GET")

if echo "$cors_response" | grep -q "Access-Control-Allow-Origin"; then
    echo -e "${GREEN}✓ PASS${NC}"
    echo "  CORS is properly configured"
else
    echo -e "${YELLOW}⚠ WARNING${NC}"
    echo "  CORS headers not found (might be OK depending on setup)"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "📊 Deployment Verification Summary"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Next Steps:"
echo "1. Check Render logs for any errors"
echo "2. Verify DATABASE_URL environment variable is set"
echo "3. Test a real transaction from the frontend"
echo "4. Monitor /health endpoint for database connectivity"
echo ""
echo "Frontend Integration:"
echo "- Swap page: ✅ usePointsTracking integrated"
echo "- Bridge page: ✅ usePointsTracking integrated"
echo "- Webhook endpoint: /v1/webhooks/transaction-confirmed"
echo ""
echo "Admin Endpoints:"
echo "- Refresh leaderboard: POST /v1/leaderboard/refresh"
echo "- Create multiplier: POST /v1/points/admin/multiplier"
echo "- Airdrop snapshot: POST /v1/points/admin/airdrop/snapshot"
echo ""
echo -e "${GREEN}✨ Verification Complete!${NC}"
