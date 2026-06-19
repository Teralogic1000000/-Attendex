Write-Host "`n╔════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║       ATTENDEX API ENDPOINT TESTS         ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$API_BASE = "http://localhost:5000/api"

# Login to get token
Write-Host "📝 AUTHENTICATION TEST" -ForegroundColor Blue
Write-Host "─────────────────────────────────────────────" -ForegroundColor Blue

try {
    $loginBody = @{
        email = "superadmin@attendex.com"
        password = "SuperAdmin@123"
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "$API_BASE/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $loginData = $response.Content | ConvertFrom-Json
    
    Write-Host "✓ Login successful (Status: $($response.StatusCode))" -ForegroundColor Green
    $token = $loginData.accessToken
    
    if ($token) {
        Write-Host "✓ Token obtained" -ForegroundColor Green
        
        # Create headers with token
        $headers = @{
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json"
        }
        
        Write-Host "`n📚 TESTING ENDPOINTS WITH AUTHENTICATION" -ForegroundColor Blue
        Write-Host "─────────────────────────────────────────────" -ForegroundColor Blue
        
        $endpoints = @(
            @{name="User Profile"; method="GET"; uri="$API_BASE/users/profile"},
            @{name="Attendance Statuses"; method="GET"; uri="$API_BASE/lookups/attendance-statuses"},
            @{name="Dashboard Overview"; method="GET"; uri="$API_BASE/dashboard/overview"},
            @{name="Superadmin Dashboard"; method="GET"; uri="$API_BASE/superadmin/dashboard/overview"},
            @{name="Organizations List"; method="GET"; uri="$API_BASE/organization/list"},
            @{name="Attendance Today"; method="GET"; uri="$API_BASE/attendance/today"},
            @{name="Audit Logs"; method="GET"; uri="$API_BASE/audit-logs/logs"}
        )
        
        $passed = 0
        $failed = 0
        
        foreach ($endpoint in $endpoints) {
            try {
                $result = Invoke-WebRequest -Uri $endpoint.uri -Method $endpoint.method -Headers $headers -ErrorAction Stop
                Write-Host "✓ $($endpoint.name) (Status: $($result.StatusCode))" -ForegroundColor Green
                $passed++
            } catch {
                $statusCode = $_.Exception.Response.StatusCode.Value__
                Write-Host "✗ $($endpoint.name) (Status: $statusCode)" -ForegroundColor Red
                $failed++
            }
        }
        
        Write-Host "`n╔════════════════════════════════════════════╗" -ForegroundColor Green
        Write-Host "║         TEST SUMMARY                       ║" -ForegroundColor Green
        Write-Host "╚════════════════════════════════════════════╝`n" -ForegroundColor Green
        
        Write-Host "✓ Passed: $passed" -ForegroundColor Green
        Write-Host "✗ Failed: $failed" -ForegroundColor Red
        
        Write-Host "`n🌐 FRONTEND & API URLs:" -ForegroundColor Yellow
        Write-Host "Frontend:  http://localhost:5177" -ForegroundColor Cyan
        Write-Host "Backend:   http://localhost:5000/api" -ForegroundColor Cyan
        
        Write-Host "`n📋 DEMO ACCOUNTS:" -ForegroundColor Yellow
        Write-Host "SuperAdmin: superadmin@attendex.com / SuperAdmin@123" -ForegroundColor Green
        Write-Host "Admin 1:    admin@democorp.com / Admin@123" -ForegroundColor Green
        Write-Host "Admin 2:    admin@sample.com / Admin@123" -ForegroundColor Green
        Write-Host "Employee:   john.doe@democorp.com / Emp@1234`n" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ Login failed: $($_.Exception.Message)" -ForegroundColor Red
}
