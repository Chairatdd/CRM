# Start all CRM/CDP services
Write-Host "Starting CRM/CDP System..." -ForegroundColor Cyan

# Node.js API
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot\api'; npm run dev" -WindowStyle Normal

# C# Backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot\backend'; dotnet run" -WindowStyle Normal

# React Frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot\frontend'; npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "Services starting:" -ForegroundColor Green
Write-Host "  Node.js API   -> http://localhost:3001" -ForegroundColor Yellow
Write-Host "  C# .NET API   -> http://localhost:5050" -ForegroundColor Yellow
Write-Host "  React App     -> http://localhost:5173" -ForegroundColor Yellow
Write-Host ""
Write-Host "Make sure XAMPP MySQL is running first!" -ForegroundColor Magenta
