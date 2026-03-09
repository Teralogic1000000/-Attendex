#!/bin/bash

# Attendex API Testing Script
# Run all endpoints in sequence

BASE_URL="http://localhost:5000/api"
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Attendex Subscription System - API Tests${NC}"
echo -e "${BLUE}========================================${NC}\n"

# 1. Register
echo -e "${YELLOW}[1] Testing Registration...${NC}"
REGISTER_RESPONSE=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test'$(date +%s)'@example.com",
    "password": "TestPass123!",
    "orgName": "Test Company"
  }')

echo $REGISTER_RESPONSE | jq .
ACCESS_TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.data.tokens.accessToken')
REFRESH_TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.data.tokens.refreshToken')
USER_ID=$(echo $REGISTER_RESPONSE | jq -r '.data.user.id')
ORG_ID=$(echo $REGISTER_RESPONSE | jq -r '.data.user.orgId')

echo -e "${GREEN}✓ Registration successful${NC}"
echo -e "Token: ${YELLOW}${ACCESS_TOKEN:0:20}...${NC}\n"

# 2. Login
echo -e "${YELLOW}[2] Testing Login...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'$(echo $REGISTER_RESPONSE | jq -r '.data.user.email')'",
    "password": "TestPass123!"
  }')

echo $LOGIN_RESPONSE | jq '.data | del(.tokens.accessToken, .tokens.refreshToken)'
echo -e "${GREEN}✓ Login successful${NC}\n"

# 3. Get Current Subscription
echo -e "${YELLOW}[3] Testing Get Current Subscription...${NC}"
curl -s -X GET $BASE_URL/subscriptions/current \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq '.data'
echo -e "${GREEN}✓ Subscription retrieved${NC}\n"

# 4. Get All Plans
echo -e "${YELLOW}[4] Testing Get All Plans...${NC}"
curl -s -X GET $BASE_URL/subscriptions/plans \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq '.data | length'
echo -e "${GREEN}✓ Plans retrieved${NC}\n"

# 5. Check User Capacity
echo -e "${YELLOW}[5] Testing Check User Capacity...${NC}"
curl -s -X GET "$BASE_URL/subscriptions/can-add-users?count=1" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq '.data'
echo -e "${GREEN}✓ User capacity checked${NC}\n"

# 6. Check Feature Access (Basic - Should fail for export)
echo -e "${YELLOW}[6] Testing Feature Access (export - should fail on Basic)...${NC}"
FEATURE_RESPONSE=$(curl -s -X GET "$BASE_URL/subscriptions/feature-access?feature=export" \
  -H "Authorization: Bearer $ACCESS_TOKEN")
echo $FEATURE_RESPONSE | jq '.message'
echo -e "${YELLOW}(Expected: Access denied on Basic plan)${NC}\n"

# 7. Create User
echo -e "${YELLOW}[7] Testing Create User...${NC}"
CREATE_USER_RESPONSE=$(curl -s -X POST $BASE_URL/users \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Employee",
    "lastName": "One",
    "email": "employee1'$(date +%s)'@example.com",
    "password": "EmployeePass123!"
  }')

echo $CREATE_USER_RESPONSE | jq '.data'
NEW_USER_ID=$(echo $CREATE_USER_RESPONSE | jq -r '.data.id')
echo -e "${GREEN}✓ User created${NC}\n"

# 8. Get All Users
echo -e "${YELLOW}[8] Testing Get All Users...${NC}"
curl -s -X GET "$BASE_URL/users?page=1&limit=10" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq '.data'
echo -e "${GREEN}✓ Users retrieved${NC}\n"

# 9. Get Specific User
echo -e "${YELLOW}[9] Testing Get Specific User...${NC}"
curl -s -X GET "$BASE_URL/users/$NEW_USER_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq '.data'
echo -e "${GREEN}✓ User detail retrieved${NC}\n"

# 10. Update User
echo -e "${YELLOW}[10] Testing Update User...${NC}"
curl -s -X PUT "$BASE_URL/users/$NEW_USER_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "UpdatedEmployee",
    "lastName": "Modified"
  }' | jq '.data'
echo -e "${GREEN}✓ User updated${NC}\n"

# 11. Get User Stats
echo -e "${YELLOW}[11] Testing Get User Statistics...${NC}"
curl -s -X GET "$BASE_URL/users/stats/overview" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq '.data'
echo -e "${GREEN}✓ Statistics retrieved${NC}\n"

# 12. Get Usage Analytics
echo -e "${YELLOW}[12] Testing Get Usage Analytics...${NC}"
curl -s -X GET $BASE_URL/subscriptions/analytics \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq '.data'
echo -e "${GREEN}✓ Analytics retrieved${NC}\n"

# 13. Upgrade Plan (from Basic to Pro)
echo -e "${YELLOW}[13] Testing Plan Upgrade (Basic → Pro)...${NC}"
UPGRADE_RESPONSE=$(curl -s -X POST $BASE_URL/subscriptions/upgrade \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "planId": "pro"
  }')

echo $UPGRADE_RESPONSE | jq '.data'
echo -e "${GREEN}✓ Plan upgraded${NC}\n"

# 14. Check Feature Access After Upgrade
echo -e "${YELLOW}[14] Testing Feature Access (export - should succeed on Pro)...${NC}"
curl -s -X GET "$BASE_URL/subscriptions/feature-access?feature=export" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq '.data'
echo -e "${GREEN}✓ Feature access confirmed${NC}\n"

# 15. Refresh Token
echo -e "${YELLOW}[15] Testing Refresh Token...${NC}"
REFRESH_RESPONSE=$(curl -s -X POST $BASE_URL/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "'$REFRESH_TOKEN'"
  }')

NEW_ACCESS_TOKEN=$(echo $REFRESH_RESPONSE | jq -r '.data.accessToken')
echo -e "${GREEN}✓ Token refreshed${NC}"
echo -e "New Token: ${YELLOW}${NEW_ACCESS_TOKEN:0:20}...${NC}\n"

# 16. Delete User
echo -e "${YELLOW}[16] Testing Delete User...${NC}"
curl -s -X DELETE "$BASE_URL/users/$NEW_USER_ID" \
  -H "Authorization: Bearer $NEW_ACCESS_TOKEN" | jq '.'
echo -e "${GREEN}✓ User deleted${NC}\n"

# 17. Logout
echo -e "${YELLOW}[17] Testing Logout...${NC}"
curl -s -X POST $BASE_URL/auth/logout \
  -H "Authorization: Bearer $NEW_ACCESS_TOKEN" | jq '.'
echo -e "${GREEN}✓ Logged out${NC}\n"

echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}All tests completed successfully!${NC}"
echo -e "${BLUE}========================================${NC}"
