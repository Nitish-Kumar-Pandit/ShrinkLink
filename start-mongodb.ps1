# MongoDB Startup Script for ShrinkLink Project
# This script starts MongoDB with the correct data directory

Write-Host "🚀 Starting MongoDB for ShrinkLink..." -ForegroundColor Green

# Check if MongoDB is already running
$mongoProcess = Get-Process -Name "mongod" -ErrorAction SilentlyContinue
if ($mongoProcess) {
    Write-Host "✅ MongoDB is already running (PID: $($mongoProcess.Id))" -ForegroundColor Yellow
    exit 0
}

# Create data directory if it doesn't exist
$dataPath = "C:\data\db"
if (!(Test-Path $dataPath)) {
    Write-Host "📁 Creating MongoDB data directory: $dataPath" -ForegroundColor Blue
    New-Item -ItemType Directory -Path $dataPath -Force | Out-Null
}

# MongoDB executable path
$mongoPath = "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe"

# Check if MongoDB is installed
if (!(Test-Path $mongoPath)) {
    Write-Host "❌ MongoDB not found at: $mongoPath" -ForegroundColor Red
    Write-Host "Please install MongoDB from: https://www.mongodb.com/try/download/community" -ForegroundColor Yellow
    exit 1
}

# Start MongoDB
Write-Host "🔄 Starting MongoDB server..." -ForegroundColor Blue
try {
    Start-Process -FilePath $mongoPath -ArgumentList "--dbpath", $dataPath -WindowStyle Minimized
    Start-Sleep -Seconds 3
    
    # Check if MongoDB started successfully
    $mongoProcess = Get-Process -Name "mongod" -ErrorAction SilentlyContinue
    if ($mongoProcess) {
        Write-Host "✅ MongoDB started successfully (PID: $($mongoProcess.Id))" -ForegroundColor Green
        Write-Host "🌐 MongoDB is running on: mongodb://localhost:27017" -ForegroundColor Cyan
        Write-Host "📊 Data directory: $dataPath" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Failed to start MongoDB" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error starting MongoDB: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "🎉 MongoDB is ready for ShrinkLink!" -ForegroundColor Green
