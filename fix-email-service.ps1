# Email Service Fix Script for Windows PowerShell

Write-Host "🔧 Email Service Fix Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This script will help you fix the email service issue by setting"
Write-Host "the required environment variables in Railway."
Write-Host ""

# Check if railway CLI is installed
$railwayExists = Get-Command railway -ErrorAction SilentlyContinue
if (-not $railwayExists) {
    Write-Host "❌ Railway CLI is not installed." -ForegroundColor Red
    Write-Host "Please install it first: npm i -g @railway/cli"
    exit 1
}

Write-Host "✅ Railway CLI found" -ForegroundColor Green
Write-Host ""

# Show current service
Write-Host "📍 Current Railway service:" -ForegroundColor Yellow
railway status
Write-Host ""

Write-Host "⚠️  IMPORTANT: Make sure you're linked to the WEBAPP service, not the API service!" -ForegroundColor Yellow
Write-Host ""
$confirm = Read-Host "Are you in the correct webapp service? (y/n)"

if ($confirm -ne "y") {
    Write-Host ""
    Write-Host "Please run: railway service"
    Write-Host "And select the webapp service (e.g., 'clinic-consent-webapp')"
    exit 1
}

Write-Host ""
Write-Host "🔧 Setting environment variables..." -ForegroundColor Cyan
Write-Host ""

# Set the variables
railway variables set EXPO_PUBLIC_API_URL=https://clinic-consent-app-production.up.railway.app/api
railway variables set EXPO_PUBLIC_THERAPIST_EMAIL=clinic@caretrace.uk
railway variables set NODE_ENV=production

Write-Host ""
Write-Host "✅ Environment variables set!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Current variables:" -ForegroundColor Yellow
railway variables
Write-Host ""

$redeploy = Read-Host "Do you want to trigger a redeploy now? (y/n)"

if ($redeploy -eq "y") {
    Write-Host ""
    Write-Host "🚀 Triggering redeploy..." -ForegroundColor Cyan
    railway up --detach
    Write-Host ""
    Write-Host "✅ Redeploy triggered!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 You can monitor the deployment with:" -ForegroundColor Yellow
    Write-Host "   railway logs"
} else {
    Write-Host ""
    Write-Host "⚠️  Remember to redeploy manually for changes to take effect!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "You can redeploy by:"
    Write-Host "  1. Running: railway up --detach"
    Write-Host "  2. Or pushing a new commit: git push"
    Write-Host "  3. Or via Railway dashboard: Click 'Redeploy'"
}

Write-Host ""
Write-Host "🎉 Done! After redeployment, test the email service." -ForegroundColor Green
Write-Host ""
Write-Host "📝 See EMAIL_SERVICE_FIX.md for detailed instructions." -ForegroundColor Cyan
