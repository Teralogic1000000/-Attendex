$API_BASE = "http://localhost:5000/api"

Write-Host "`nTesting Attendex API Endpoints`n" -ForegroundColor Cyan

# Login first
try {
    $loginBody = @{
        email = "superadmin@attendex.com"
        password = "SuperAdmin@123"
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "$API_BASE/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $loginData = $response.Content | ConvertFrom-Json
    
    Write-Host "Login Status: $($response.StatusCode)" -ForegroundColor Green
    $token = $loginData.accessToken
    
    if ($token) {
        Write-Host "Token obtained successfully`n" -ForegroundColor Green
        
        $headers = @{
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json"
        }
        
        # Test endpoints
        Write-Host "Testing Endpoints:" -ForegroundColor Cyan
        Write-Host "==================" -ForegroundColor Cyan
        
        $tests = @(
            @{name="User Profile"; uri="$API_BASE/users/profile"},
            @{name="Lookups"; uri="$API_BASE/lookups/attendance-statuses"},
            @{name="Dashboard"; uri="$API_BASE/dashboard/overview"},
            @{name="Organizations"; uri="$API_BASE/organization/list"},
            @{name="Attendance"; uri="$API_BASE/attendance/today"},
            @{name="Audit Logs"; uri="$API_BASE/audit-logs/logs"}
        )
        
        foreach ($test in $tests) {
            try {
                $res = Invoke-WebRequest -Uri $test.uri -Method GET -Headers $headers -ErrorAction Stop
                Write-Host "$('"[OK]"') $($test.name) - $($res.StatusCode)" -ForegroundColor Green
            } catch {
                Write-Host "$('"[FAIL]"') $($test.name)" -ForegroundColor Red
            }
        }
        
        Write-Host "`nServers Status:" -ForegroundColor Cyan
        Write-Host "================" -ForegroundColor Cyan
        Write-Host "Frontend: http://localhost:5177" -ForegroundColor Yellow
        Write-Host "Backend:  http://localhost:5000/api" -ForegroundColor Yellow
        Write-Host "`nDemo Login: superadmin@attendex.com / SuperAdmin@123`n" -ForegroundColor Green
    }
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
