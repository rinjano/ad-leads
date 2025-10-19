#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000/api"

echo -e "${BLUE}=== Budget History Test Script ===${NC}\n"

# Test 1: Create a new budget
echo -e "${YELLOW}Test 1: Creating new budget with initial amount${NC}"
CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/ads-budget" \
  -H "Content-Type: application/json" \
  -d '{
    "kodeAdsId": 1,
    "sumberLeadsId": 1,
    "budget": 5000000,
    "periode": "2025-10",
    "createdBy": "TestUser"
  }')

echo -e "${GREEN}Response:${NC}"
echo "$CREATE_RESPONSE" | jq '.'
BUDGET_ID=$(echo "$CREATE_RESPONSE" | jq -r '.data.id')
echo -e "${BLUE}Budget ID: $BUDGET_ID${NC}\n"

# Test 2: Check initial history
echo -e "${YELLOW}Test 2: Check initial budget history${NC}"
curl -s "$BASE_URL/ads-budget-history?adsBudgetId=$BUDGET_ID" | jq '.'
echo ""

# Test 3: Add more budget
echo -e "${YELLOW}Test 3: Adding additional budget${NC}"
UPDATE_RESPONSE=$(curl -s -X POST "$BASE_URL/ads-budget" \
  -H "Content-Type: application/json" \
  -d "{
    \"kodeAdsId\": 1,
    \"sumberLeadsId\": 1,
    \"budget\": 7500000,
    \"periode\": \"2025-10\",
    \"createdBy\": \"TestUser\"
  }")

echo -e "${GREEN}Response:${NC}"
echo "$UPDATE_RESPONSE" | jq '.'
echo ""

# Test 4: Check budget history after update
echo -e "${YELLOW}Test 4: Check budget history after adding more budget${NC}"
curl -s "$BASE_URL/ads-budget-history?adsBudgetId=$BUDGET_ID&type=budget" | jq '.'
echo ""

# Test 5: Update spent
echo -e "${YELLOW}Test 5: Recording spend update${NC}"
SPEND_RESPONSE=$(curl -s -X PUT "$BASE_URL/ads-budget" \
  -H "Content-Type: application/json" \
  -d "{
    \"id\": $BUDGET_ID,
    \"spent\": 2000000,
    \"updatedBy\": \"TestUser\"
  }")

echo -e "${GREEN}Response:${NC}"
echo "$SPEND_RESPONSE" | jq '.'
echo ""

# Test 6: Add more spend
echo -e "${YELLOW}Test 6: Recording another spend update${NC}"
SPEND_RESPONSE2=$(curl -s -X PUT "$BASE_URL/ads-budget" \
  -H "Content-Type: application/json" \
  -d "{
    \"id\": $BUDGET_ID,
    \"spent\": 3500000,
    \"updatedBy\": \"TestUser\"
  }")

echo -e "${GREEN}Response:${NC}"
echo "$SPEND_RESPONSE2" | jq '.'
echo ""

# Test 7: Check full history (budget + spend)
echo -e "${YELLOW}Test 7: Full history (all types)${NC}"
curl -s "$BASE_URL/ads-budget-history?adsBudgetId=$BUDGET_ID" | jq '.'
echo ""

# Test 8: Check spend history only
echo -e "${YELLOW}Test 8: Spend history only${NC}"
curl -s "$BASE_URL/ads-budget-history?adsBudgetId=$BUDGET_ID&type=spend" | jq '.'
echo ""

# Test 9: Get ads spend data with history
echo -e "${YELLOW}Test 9: Get ads spend data with history included${NC}"
curl -s "$BASE_URL/ads-spend" | jq '.data[0] | {budget, budgetSpent, budgetHistory, spentHistory}'
echo ""

echo -e "${GREEN}=== All tests completed ===${NC}"
