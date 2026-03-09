#!/usr/bin/env pwsh

Write-Host "🔐 Testing Dashboard Endpoints`n" -ForeGroundColor Cyan

# Get auth token
$loginBody = @{
    email = "testadmin1772952397298@test.com"
    password = "Admin123!"
} | ConvertTo-Json

$loginResp = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body $loginBody `
  -ErrorAction Stop

$loginData = $loginResp.Content | ConvertFrom-Json
$token = $loginData.data.accessToken

Write-Host "✓ Login successful" -ForeGroundColor Green
Write-Host "  Token: $($token.Substring(0, 50))...`n"

$headers = @{
    Authorization = "Bearer $token"
}

# Test endpoints
$endpoints = @(
    @{ name = "📊 Overview"; path = "/api/superadmin/dashboard/overview" },
    @{ name = "📈 Organization Growth"; path = "/api/superadmin/dashboard/analytics/organization-growth" },
    @{ name = "👥 User Growth"; path = "/api/superadmin/dashboard/analytics/user-growth" },
    @{ name = "⏰ Attendance Trends"; path = "/api/superadmin/dashboard/analytics/attendance-trends" },
    @{ name = "🏢 Organizations"; path = "/api/superadmin/organizations?page=1&limit=5" },
    @{ name = "📋 Audit Logs"; path = "/api/superadmin/audit-logs?page=1&limit=5" }
)

foreach ($endpoint in $endpoints) {
    Write-Host "`n$($endpoint.name)" -ForeGroundColor Yellow
    Write-Host "  URL: $($endpoint.path)"
    
    try {
        $resp = Invoke-WebRequest -Uri "http://localhost:5000$($endpoint.path)" `
          -Method GET `
          -Headers $headers `
          -ErrorAction Stop
        
        $data = $resp.Content | ConvertFrom-Json
        
        Write-Host "  ✓ Status: $($resp.StatusCode)" -ForeGroundColor Green
        Write-Host "  ✓ Message: $($data.message)"
        
        if ($data.data) {
            $jsonStr = ConvertTo-Json $data.data -Depth 2
            Write-Host "  ✓ Response: $($jsonStr.Substring(0, [Math]::Min(200, $jsonStr.Length)))..." 
        }
    } catch {
        $resp = $_.Exception.Response
        $statusCode = $resp.StatusCode
        
        try {
            $errorBody = $_.Exception.Response.Content.ReadAsStream() | {$reader = New-Object System.IO.StreamReader($_); $reader.ReadToEnd()}
            $errorData = $errorBody | ConvertFrom-Json
            Write-Host "  ✗ Status: $statusCode" -ForeGroundColor Red
            Write-Host "  ✗ Error: $($errorData.message)"
        } catch {
            Write-Host "  ✗ Error: $($_.Exception.Message)" -ForeGroundColor Red
        }
    }
}

Write-Host "`n✅ Test complete!`n" -ForeGroundColor Green
