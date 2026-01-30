#!/bin/bash

echo "🔧 Email Service Fix Script"
echo "================================"
echo ""
echo "This script will help you fix the email service issue by setting"
echo "the required environment variables in Railway."
echo ""

# Check if railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI is not installed."
    echo "Please install it first: npm i -g @railway/cli"
    exit 1
fi

echo "✅ Railway CLI found"
echo ""

# Show current service
echo "📍 Current Railway service:"
railway status
echo ""

echo "⚠️  IMPORTANT: Make sure you're linked to the WEBAPP service, not the API service!"
echo ""
read -p "Are you in the correct webapp service? (y/n): " confirm

if [ "$confirm" != "y" ]; then
    echo ""
    echo "Please run: railway service"
    echo "And select the webapp service (e.g., 'clinic-consent-webapp')"
    exit 1
fi

echo ""
echo "🔧 Setting environment variables..."
echo ""

# Set the variables
railway variables set EXPO_PUBLIC_API_URL=https://clinic-consent-app-production.up.railway.app/api
railway variables set EXPO_PUBLIC_THERAPIST_EMAIL=clinic@caretrace.uk
railway variables set NODE_ENV=production

echo ""
echo "✅ Environment variables set!"
echo ""
echo "📋 Current variables:"
railway variables
echo ""

read -p "Do you want to trigger a redeploy now? (y/n): " redeploy

if [ "$redeploy" = "y" ]; then
    echo ""
    echo "🚀 Triggering redeploy..."
    railway up --detach
    echo ""
    echo "✅ Redeploy triggered!"
    echo ""
    echo "📊 You can monitor the deployment with:"
    echo "   railway logs"
else
    echo ""
    echo "⚠️  Remember to redeploy manually for changes to take effect!"
    echo ""
    echo "You can redeploy by:"
    echo "  1. Running: railway up --detach"
    echo "  2. Or pushing a new commit: git push"
    echo "  3. Or via Railway dashboard: Click 'Redeploy'"
fi

echo ""
echo "🎉 Done! After redeployment, test the email service."
echo ""
echo "📝 See EMAIL_SERVICE_FIX.md for detailed instructions."
