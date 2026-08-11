# Fix node_modules for YAPP API
Write-Host "Fixing node_modules for YAPP API..." -ForegroundColor Green

# Navigate to API directory
Set-Location -Path "\\wsl.localhost\Ubuntu\home\yuvan2op\git\yapp\api"

# Create .env file if it doesn't exist
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
}

# Run the bash script in WSL
Write-Host "Running fix script in WSL..." -ForegroundColor Yellow
wsl bash -c "cd /home/yuvan2op/git/yapp/api && chmod +x fix-node-modules.sh && ./fix-node-modules.sh"

Write-Host "Done! You can now start the API with: npm start" -ForegroundColor Green
