# Stop existing processes on ports 3001 and 5173
Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue | ForEach-Object {
    Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
}
Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue | ForEach-Object {
    Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
}

Start-Sleep -Seconds 1

# Start Backend
$backend = Start-Process node -ArgumentList "server.js" -WorkingDirectory "$PSScriptRoot\server" -PassThru -WindowStyle Hidden
Write-Host "Started Backend PID:" $backend.Id

# Start Frontend
$frontend = Start-Process cmd.exe -ArgumentList "/c npm run dev" -WorkingDirectory "$PSScriptRoot\client" -PassThru -WindowStyle Hidden
Write-Host "Started Frontend PID:" $frontend.Id

# Wait for both to be ready
$backendReady = $false
$frontendReady = $false

for ($i = 0; $i -lt 15; $i++) {
    Start-Sleep -Seconds 1
    if (-not $backendReady) {
        try {
            $res = Invoke-RestMethod -Uri "http://localhost:3001/api/health" -TimeoutSec 2
            if ($res.status -eq "ok") {
                $backendReady = $true
                Write-Host "Backend ready on http://localhost:3001"
            }
        } catch {}
    }

    if (-not $frontendReady) {
        try {
            $res = Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing -TimeoutSec 2
            if ($res.StatusCode -eq 200) {
                $frontendReady = $true
                Write-Host "Frontend ready on http://localhost:5173"
            }
        } catch {}
    }

    if ($backendReady -and $frontendReady) {
        break
    }
}

if ($backendReady -and $frontendReady) {
    Write-Host "=== Deployment on localhost is LIVE! ==="
    Write-Host "Frontend: http://localhost:5173"
    Write-Host "Backend:  http://localhost:3001"
    exit 0
} else {
    Write-Error "Failed to start: BackendReady=$backendReady, FrontendReady=$frontendReady"
    exit 1
}
