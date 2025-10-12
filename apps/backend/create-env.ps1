# PowerShell script to create .env file for Boss Traders Backend

Write-Host "🚀 Boss Traders - Email Setup Script" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env already exists
if (Test-Path ".env") {
    Write-Host "⚠️  .env file already exists!" -ForegroundColor Yellow
    $overwrite = Read-Host "Do you want to overwrite it? (y/n)"
    if ($overwrite -ne "y") {
        Write-Host "❌ Setup cancelled" -ForegroundColor Red
        exit
    }
}

Write-Host "📧 Setting up email configuration..." -ForegroundColor Green
Write-Host ""
Write-Host "Before we begin, you need to generate a Gmail App Password:" -ForegroundColor Yellow
Write-Host "1. Go to https://myaccount.google.com/security" -ForegroundColor White
Write-Host "2. Enable 2-Step Verification" -ForegroundColor White
Write-Host "3. Go to https://myaccount.google.com/apppasswords" -ForegroundColor White
Write-Host "4. Create App Password for 'Mail'" -ForegroundColor White
Write-Host ""

# Collect information
$gmailEmail = Read-Host "Enter your Gmail address (e.g., youremail@gmail.com)"
Write-Host ""
Write-Host "Enter your Gmail App Password (16-character password from Google):" -ForegroundColor Yellow
$appPassword = Read-Host -AsSecureString
$appPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($appPassword))

Write-Host ""
$mongoUri = Read-Host "Enter MongoDB URI (press Enter for default: mongodb://localhost:27017/boss-traders)"
if ([string]::IsNullOrWhiteSpace($mongoUri)) {
    $mongoUri = "mongodb://localhost:27017/boss-traders"
}

# Generate random JWT secrets
$jwtAccess = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
$jwtRefresh = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})

Write-Host ""
Write-Host "📝 Creating .env file..." -ForegroundColor Green

# Create .env content
$envContent = @"
# Database Configuration
MONGODB_URI=$mongoUri

# JWT Configuration
JWT_ACCESS_SECRET=$jwtAccess
JWT_REFRESH_SECRET=$jwtRefresh

# Email Configuration (CRITICAL FOR PASSWORD RESET)
SMTP_USER=$gmailEmail
SMTP_PASS=$appPasswordPlain

# Client URL (Frontend URL)
CLIENT_URL=http://localhost:3000

# Server Configuration
PORT=4000
NODE_ENV=development

# UPI Payment Configuration
UPI_ID=your-upi-id@paytm
MERCHANT_NAME=Boss Traders
"@

# Write to file
$envContent | Out-File -FilePath ".env" -Encoding UTF8 -NoNewline

Write-Host ""
Write-Host "✅ .env file created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Configuration Summary:" -ForegroundColor Cyan
Write-Host "  📧 Email: $gmailEmail" -ForegroundColor White
Write-Host "  🔐 App Password: ******** (hidden)" -ForegroundColor White
Write-Host "  💾 MongoDB: $mongoUri" -ForegroundColor White
Write-Host "  🔑 JWT Secrets: Auto-generated" -ForegroundColor White
Write-Host ""
Write-Host "🧪 Testing email configuration..." -ForegroundColor Yellow
Write-Host ""

# Test email
Write-Host "Run this command to test email:" -ForegroundColor Cyan
Write-Host "  npm run test:email" -ForegroundColor White
Write-Host ""
Write-Host "Then restart your backend server:" -ForegroundColor Cyan
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "✨ Setup complete! Your forgot password email should now work." -ForegroundColor Green

