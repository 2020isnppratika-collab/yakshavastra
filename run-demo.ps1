# YakshaVastra Demo Launcher for Windows
Write-Host "============================================================" -ForegroundColor Yellow
Write-Host "  YakshaVastra — Yakshagana Costume Rental Platform" -ForegroundColor Red
Write-Host "============================================================" -ForegroundColor Yellow

$backendDir = Join-Path $PSScriptRoot "backend"
$frontendDir = Join-Path $PSScriptRoot "frontend"

Write-Host "`n[1/2] Starting FastAPI Backend on http://localhost:8000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendDir'; `$env:PYTHONPATH='.'; .\venv\Scripts\uvicorn.exe app.main:app --reload --host 0.0.0.0 --port 8000"

Start-Sleep -Seconds 2

Write-Host "[2/2] Starting Vite React Frontend on http://localhost:5173..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendDir'; npm run dev"

Start-Sleep -Seconds 2

Write-Host "`n============================================================" -ForegroundColor Green
Write-Host "  Platform Running Successfully!" -ForegroundColor Green
Write-Host "  Frontend App:      http://localhost:5173" -ForegroundColor Yellow
Write-Host "  FastAPI Docs:      http://localhost:8000/docs" -ForegroundColor Yellow
Write-Host "  API Health:        http://localhost:8000/health" -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Green
Write-Host "`nDemo Accounts (1-Click buttons available on login page):" -ForegroundColor Magenta
Write-Host "  Customer: customer@demo.com  | Password: Customer@123"
Write-Host "  Admin:    admin@demo.com     | Password: Admin@123`n"
