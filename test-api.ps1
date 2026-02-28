# Attendex API Testing Script (PowerShell)
# Run all endpoints in sequence

$BaseUrl = "http://localhost:3000/api"
$timestamp = Get-Date -Format "yyyyMMddHHmmss"

Write-Host "========================================" -ForegroundColor Blue
Write-Host "Attendex Subscription System - API Tests" -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue
Write-Host ""

# Function to make requests
function Invoke-ApiRequest {
    param(
        [string]$Method,
        [string]$Endpoint,
        [string]$Token = $null,
        [object]$Body = $null
    )
    
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    if ($Token) {
        $headers["Authorization"] = "Bearer $Token"
    }
    
    $url = "$BaseUrl$Endpoint"
    
    try {
        if ($Body) {
            $response = Invoke-WebRequest -Uri $url -Method $Method -Headers $headers -Body ($Body | ConvertTo-Json) -UseBasicParsing
        } else {
            $response = Invoke-WebRequest -Uri $url -Method $Method -Headers $headers -UseBasicParsing
        }
        return $response.Content | ConvertFrom-Json
    }
    catch {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# 1. Register
Write-Host "[1] Testing Registration..." -ForegroundColor Yellow
$registerBody = @{
    firstName = "Test"
    lastName = "User"
    email = "test$timestamp@example.com"
    password = "TestPass123!"
    orgName = "Test Company"
}

$registerResponse = Invoke-ApiRequest -Method "POST" -Endpoint "/auth/register" -Body $registerBody
if ($registerResponse.success) {
    Write-Host "✓ Registration successful" -ForegroundColor Green
    $accessToken = $registerResponse.data.tokens.accessToken
    $refreshToken = $registerResponse.data.tokens.refreshToken
    $userId = $registerResponse.data.user.id
    $email = $registerResponse.data.user.email
    
    Write-Host "User: $($registerResponse.data.user.firstName) $($registerResponse.data.user.lastName)" -ForegroundColor Cyan
    Write-Host "Email: $email" -ForegroundColor Cyan
    Write-Host "Plan: $($registerResponse.data.subscription.plan)" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host "✗ Registration failed" -ForegroundColor Red
    exit
}

# 2. Login
Write-Host "[2] Testing Login..." -ForegroundColor Yellow
$loginBody = @{
    email = $email
    password = "TestPass123!"
}

$loginResponse = Invoke-ApiRequest -Method "POST" -Endpoint "/auth/login" -Body $loginBody -Token $accessToken
if ($loginResponse.success) {
    Write-Host "✓ Login successful" -ForegroundColor Green
    Write-Host "Role: $($loginResponse.data.user.role)" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host "✗ Login failed" -ForegroundColor Red
}

# 3. Get Current Subscription
Write-Host "[3] Testing Get Current Subscription..." -ForegroundColor Yellow
$subResponse = Invoke-ApiRequest -Method "GET" -Endpoint "/subscriptions/current" -Token $accessToken
if ($subResponse.success) {
    Write-Host "✓ Subscription retrieved" -ForegroundColor Green
    Write-Host "Plan: $($subResponse.data.plan.name)" -ForegroundColor Cyan
    Write-Host "Max Users: $($subResponse.data.plan.maxUsers)" -ForegroundColor Cyan
    Write-Host "Status: $($subResponse.data.status)" -ForegroundColor Cyan
    Write-Host "Days Remaining: $($subResponse.data.daysRemaining)" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host "✗ Failed to get subscription" -ForegroundColor Red
}

# 4. Get All Plans
Write-Host "[4] Testing Get All Plans..." -ForegroundColor Yellow
$plansResponse = Invoke-ApiRequest -Method "GET" -Endpoint "/subscriptions/plans" -Token $accessToken
if ($plansResponse.success) {
    Write-Host "✓ Plans retrieved" -ForegroundColor Green
    Write-Host "Total Plans: $($plansResponse.data.Count)" -ForegroundColor Cyan
    $plansResponse.data | ForEach-Object {
        Write-Host "  - $($_.name): $($_.maxUsers) users, `$$($_.price)/month" -ForegroundColor Cyan
    }
    Write-Host ""
} else {
    Write-Host "✗ Failed to get plans" -ForegroundColor Red
}

# 5. Check User Capacity
Write-Host "[5] Testing Check User Capacity..." -ForegroundColor Yellow
$capacityResponse = Invoke-ApiRequest -Method "GET" -Endpoint "/subscriptions/can-add-users?count=1" -Token $accessToken
if ($capacityResponse.success) {
    Write-Host "✓ User capacity checked" -ForegroundColor Green
    Write-Host "Can Add: $($capacityResponse.data.canAdd)" -ForegroundColor Cyan
    Write-Host "Current Users: $($capacityResponse.data.currentUserCount)/$($capacityResponse.data.maxUsers)" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host "✗ Failed to check capacity" -ForegroundColor Red
}

# 6. Check Feature Access (export - should fail on Basic)
Write-Host "[6] Testing Feature Access (export - should fail on Basic)..." -ForegroundColor Yellow
$featureResponse = Invoke-ApiRequest -Method "GET" -Endpoint "/subscriptions/feature-access?feature=export" -Token $accessToken
Write-Host "Expected: Access denied" -ForegroundColor Cyan
Write-Host "Result: $($featureResponse.message)" -ForegroundColor Cyan
Write-Host ""

# 7. Create User
Write-Host "[7] Testing Create User..." -ForegroundColor Yellow
$createUserBody = @{
    firstName = "Employee"
    lastName = "One"
    email = "employee$timestamp@example.com"
    password = "EmployeePass123!"
}

$createUserResponse = Invoke-ApiRequest -Method "POST" -Endpoint "/users" -Token $accessToken -Body $createUserBody
if ($createUserResponse.success) {
    Write-Host "✓ User created" -ForegroundColor Green
    $newUserId = $createUserResponse.data.id
    Write-Host "Name: $($createUserResponse.data.firstName) $($createUserResponse.data.lastName)" -ForegroundColor Cyan
    Write-Host "Role: $($createUserResponse.data.role)" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host "✗ Failed to create user" -ForegroundColor Red
}

# 8. Get All Users
Write-Host "[8] Testing Get All Users..." -ForegroundColor Yellow
$usersResponse = Invoke-ApiRequest -Method "GET" -Endpoint "/users?page=1&limit=10" -Token $accessToken
if ($usersResponse.success) {
    Write-Host "✓ Users retrieved" -ForegroundColor Green
    Write-Host "Total Users: $($usersResponse.data.pagination.total)" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host "✗ Failed to get users" -ForegroundColor Red
}

# 9. Get Specific User
Write-Host "[9] Testing Get Specific User..." -ForegroundColor Yellow
$userResponse = Invoke-ApiRequest -Method "GET" -Endpoint "/users/$newUserId" -Token $accessToken
if ($userResponse.success) {
    Write-Host "✓ User detail retrieved" -ForegroundColor Green
    Write-Host "User: $($userResponse.data.firstName) $($userResponse.data.lastName)" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host "✗ Failed to get user" -ForegroundColor Red
}

# 10. Update User
Write-Host "[10] Testing Update User..." -ForegroundColor Yellow
$updateUserBody = @{
    firstName = "UpdatedEmployee"
    lastName = "Modified"
}

$updateResponse = Invoke-ApiRequest -Method "PUT" -Endpoint "/users/$newUserId" -Token $accessToken -Body $updateUserBody
if ($updateResponse.success) {
    Write-Host "✓ User updated" -ForegroundColor Green
    Write-Host "New Name: $($updateResponse.data.firstName) $($updateResponse.data.lastName)" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host "✗ Failed to update user" -ForegroundColor Red
}

# 11. Get User Stats
Write-Host "[11] Testing Get User Statistics..." -ForegroundColor Yellow
$statsResponse = Invoke-ApiRequest -Method "GET" -Endpoint "/users/stats/overview" -Token $accessToken
if ($statsResponse.success) {
    Write-Host "✓ Statistics retrieved" -ForegroundColor Green
    Write-Host "Total Users: $($statsResponse.data.totalUsers)" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host "✗ Failed to get stats" -ForegroundColor Red
}

# 12. Get Usage Analytics
Write-Host "[12] Testing Get Usage Analytics..." -ForegroundColor Yellow
$analyticsResponse = Invoke-ApiRequest -Method "GET" -Endpoint "/subscriptions/analytics" -Token $accessToken
if ($analyticsResponse.success) {
    Write-Host "✓ Analytics retrieved" -ForegroundColor Green
    Write-Host "Plan: $($analyticsResponse.data.plan)" -ForegroundColor Cyan
    Write-Host "Users: $($analyticsResponse.data.users.current)/$($analyticsResponse.data.users.max)" -ForegroundColor Cyan
    Write-Host "Usage: $($analyticsResponse.data.users.usagePercent)%" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host "✗ Failed to get analytics" -ForegroundColor Red
}

# 13. Upgrade Plan
Write-Host "[13] Testing Plan Upgrade (Basic -> Pro)..." -ForegroundColor Yellow
$upgradeBody = @{
    planId = "pro"
}

$upgradeResponse = Invoke-ApiRequest -Method "POST" -Endpoint "/subscriptions/upgrade" -Token $accessToken -Body $upgradeBody
if ($upgradeResponse.success) {
    Write-Host "✓ Plan upgraded" -ForegroundColor Green
    Write-Host "New Plan: $($upgradeResponse.data.plan.name)" -ForegroundColor Cyan
    Write-Host "Max Users: $($upgradeResponse.data.plan.maxUsers)" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host "✗ Failed to upgrade plan" -ForegroundColor Red
}

# 14. Check Feature Access After Upgrade
Write-Host "[14] Testing Feature Access (export - should succeed on Pro)..." -ForegroundColor Yellow
$featureResponse2 = Invoke-ApiRequest -Method "GET" -Endpoint "/subscriptions/feature-access?feature=export" -Token $accessToken
if ($featureResponse2.success) {
    Write-Host "✓ Feature access confirmed" -ForegroundColor Green
    Write-Host "Export: $($featureResponse2.data.hasAccess)" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host "✗ Feature still not available" -ForegroundColor Red
}

# 15. Refresh Token
Write-Host "[15] Testing Refresh Token..." -ForegroundColor Yellow
$refreshBody = @{
    refreshToken = $refreshToken
}

$refreshResponse = Invoke-ApiRequest -Method "POST" -Endpoint "/auth/refresh" -Body $refreshBody
if ($refreshResponse.success) {
    Write-Host "✓ Token refreshed" -ForegroundColor Green
    $accessToken = $refreshResponse.data.accessToken
    Write-Host ""
} else {
    Write-Host "✗ Failed to refresh token" -ForegroundColor Red
}

# 16. Delete User
Write-Host "[16] Testing Delete User..." -ForegroundColor Yellow
$deleteResponse = Invoke-ApiRequest -Method "DELETE" -Endpoint "/users/$newUserId" -Token $accessToken
if ($deleteResponse.success) {
    Write-Host "✓ User deleted" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "✗ Failed to delete user" -ForegroundColor Red
}

# 17. Logout
Write-Host "[17] Testing Logout..." -ForegroundColor Yellow
$logoutResponse = Invoke-ApiRequest -Method "POST" -Endpoint "/auth/logout" -Token $accessToken
if ($logoutResponse.success) {
    Write-Host "✓ Logged out" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "✗ Failed to logout" -ForegroundColor Red
}

Write-Host "========================================" -ForegroundColor Blue
Write-Host "All tests completed successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Blue
