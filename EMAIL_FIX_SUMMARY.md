# 🔧 Email Service Fix - Quick Summary

## The Problem
✅ **API Backend**: Working perfectly  
❌ **Webapp**: Can't send emails - missing API URL configuration

## The Solution (Choose One)

### Option 1: Automated Fix (Recommended)
```powershell
# Run the fix script
.\fix-email-service.ps1
```

### Option 2: Manual Fix via Railway Dashboard
1. Go to Railway Dashboard
2. Select your **webapp service** (not API service)
3. Go to "Variables" tab
4. Add these variables:
   - `EXPO_PUBLIC_API_URL` = `https://clinic-consent-app-production.up.railway.app/api`
   - `EXPO_PUBLIC_THERAPIST_EMAIL` = `clinic@caretrace.uk`
   - `NODE_ENV` = `production`
5. Click "Redeploy"

### Option 3: Manual Fix via CLI
```bash
# Switch to webapp service
railway service
# (select webapp service)

# Set variables
railway variables set EXPO_PUBLIC_API_URL=https://clinic-consent-app-production.up.railway.app/api
railway variables set EXPO_PUBLIC_THERAPIST_EMAIL=clinic@caretrace.uk
railway variables set NODE_ENV=production

# Redeploy
railway up --detach
```

## Why This Fixes It

Expo apps need environment variables **during build time**, not runtime. The variables must be:
1. Set with `EXPO_PUBLIC_` prefix
2. Present during `npm run build:web`
3. In the webapp service (not API service)

## Verification

After redeployment:
1. Check logs show: `🔗 API URL: https://clinic-consent-app-production.up.railway.app/api`
2. Visit: `https://[your-webapp-url]/api/config` - should show correct API URL
3. Test email sending in the app - should work! ✅

## Need More Details?
See `EMAIL_SERVICE_FIX.md` for complete technical explanation.

## Test Results
✅ API backend tested and working  
✅ Email sent successfully (MessageId: QzFXvWDjQbutlCj7jYJumQ)  
✅ SMTP credentials configured correctly  
❌ Webapp missing API URL during build  

**Fix**: Set environment variables and redeploy webapp.
