# MongoDB Stop Script for ShrinkLink Project
# This script safely stops MongoDB

Write-Host "🛑 Stopping MongoDB for ShrinkLink..." -ForegroundColor Yellow

# Check if MongoDB is running
$mongoProcess = Get-Process -Name "mongod" -ErrorAction SilentlyContinue
if (!$mongoProcess) {
    Write-Host "ℹ️  MongoDB is not running" -ForegroundColor Blue
    exit 0
}

Write-Host "🔄 Stopping MongoDB (PID: $($mongoProcess.Id))..." -ForegroundColor Blue

try {
    # Gracefully stop MongoDB
    $mongoProcess | Stop-Process -Force
    Start-Sleep -Seconds 2
    
    # Verify it's stopped
    $mongoProcess = Get-Process -Name "mongod" -ErrorAction SilentlyContinue
    if (!$mongoProcess) {
        Write-Host "✅ MongoDB stopped successfully" -ForegroundColor Green
    } else {
        Write-Host "⚠️  MongoDB may still be running" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Error stopping MongoDB: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "🏁 MongoDB shutdown complete" -ForegroundColor Green
