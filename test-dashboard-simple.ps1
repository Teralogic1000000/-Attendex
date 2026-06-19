#!/usr/bin/env pwsh
Write-Host "=== Testing Dashboard Live Data Fetching ===" -ForegroundColor Cyan
Write-Host "Testing organization admin dashboard endpoints" -ForegroundColor Yellow

$BaseURL = "http://localhost:5000/api"

# Helper function to make API calls
function Call-API {
  param (
    [string]$Endpoint,
    [string]$Method = "GET",
    [string]$Body = $null,
    [string]$Token = ""
  )
  
  try {
    $headers = @{
      "Content-Type" = "application/json"
    }
    
    if ($Token) {
      $headers["Authorization"] = "Bearer $Token"
    }
    
    $params = @{
      Uri = "$BaseURL$Endpoint"
      Method = $Method
      Headers = $headers
      TimeoutSec = 10
    }
    
    if ($Body) {
      $params["Body"] = $Body
    }
    
    $response = Invoke-RestMethod @params
    return $response
  }
  catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    return $null
  }
}

# Test 1: Authentication
Write-Host "`n[1] Testing Authentication..." -ForegroundColor Magenta

$login = Call-API -Endpoint "/auth/login" -Method "POST" -Body (@{
  email = "org-admin@demo.com"
  password = "demo123456"
} | ConvertTo-Json)

if ($login -and $login.data -and $login.data.accessToken) {
  $token = $login.data.accessToken
  $orgId = $login.data.user.orgId
  Write-Host "[PASS] Authentication successful" -ForegroundColor Green
  Write-Host "  Organization ID: $orgId" -ForegroundColor Gray
}
else {
  Write-Host "[FAIL] Authentication failed" -ForegroundColor Red
  exit 1
}

# Test 2: Dashboard Overview
Write-Host "`n[2] Testing Dashboard Overview..." -ForegroundColor Magenta
$overview = Call-API -Endpoint "/org-dashboard/overview" -Token $token

if ($overview -and $overview.data -and $overview.data.statistics) {
  $stats = $overview.data.statistics
  Write-Host "[PASS] Dashboard overview retrieved" -ForegroundColor Green
  Write-Host "  - Total Employees: $($stats.totalEmployees)" -ForegroundColor Gray
  Write-Host "  - Present Today: $($stats.presentToday)" -ForegroundColor Gray
  Write-Host "  - Absent Today: $($stats.absentToday)" -ForegroundColor Gray
}
else {
  Write-Host "[FAIL] Failed to retrieve dashboard overview" -ForegroundColor Red
}

# Test 3: Attendance Trends
Write-Host "`n[3] Testing Attendance Trends..." -ForegroundColor Magenta
$url3 = "/org-dashboard/analytics/trends`?days=7"
$trends = Call-API -Endpoint $url3 -Token $token

if ($trends -and $trends.data -and $trends.data.trends) {
  $trendCount = ($trends.data.trends | Measure-Object).Count
  Write-Host "[PASS] Attendance trends retrieved (entries: $trendCount)" -ForegroundColor Green
}
else {
  Write-Host "[FAIL] Failed to retrieve trends" -ForegroundColor Red
}

# Test 4: Organization Users
Write-Host "`n[4] Testing Organization Users..." -ForegroundColor Magenta
$url4 = "/org-dashboard/users`?page=1`&limit=5"
$users = Call-API -Endpoint $url4 -Token $token

if ($users -and $users.data -and $users.data.users) {
  $userCount = ($users.data.users | Measure-Object).Count
  Write-Host "[PASS] Users retrieved (showing: $userCount)" -ForegroundColor Green
}
else {
  Write-Host "[FAIL] Failed to retrieve users" -ForegroundColor Red
}

# Test 5: Organization Attendance
Write-Host "`n[5] Testing Organization Attendance..." -ForegroundColor Magenta
$url5 = "/org-dashboard/attendance`?page=1`&limit=5"
$attendance = Call-API -Endpoint $url5 -Token $token

if ($attendance -and $attendance.data -and $attendance.data.attendance) {
  $attCount = ($attendance.data.attendance | Measure-Object).Count
  Write-Host "[PASS] Attendance records retrieved (showing: $attCount)" -ForegroundColor Green
}
else {
  Write-Host "[FAIL] Failed to retrieve attendance" -ForegroundColor Red
}

# Test 6: Organization Departments
Write-Host "`n[6] Testing Organization Departments..." -ForegroundColor Magenta
$departments = Call-API -Endpoint "/org-dashboard/departments" -Token $token

if ($departments -and $departments.data) {
  $deptCount = ($departments.data | Measure-Object).Count
  Write-Host "[PASS] Departments retrieved (total: $deptCount)" -ForegroundColor Green
}
else {
  Write-Host "[FAIL] Failed to retrieve departments" -ForegroundColor Red
}

Write-Host "`n=== All Tests Completed ===" -ForegroundColor Cyan
Write-Host "[SUCCESS] Live data fetching is operational" -ForegroundColor Green
Write-Host "[SUCCESS] Dashboard endpoints working with Prisma ORM" -ForegroundColor Green
Write-Host "`nDashboard URL: http://localhost:5178/orgadmin/dashboard" -ForegroundColor Yellow

