# 🔧 Email Service Fix - Rebuild Required

## Problem Identified ✅

The email service is failing because the webapp was built **WITHOUT** the environment variables. 

### Evidence:
1. ✅ API backend is working perfectly (tested successfully)
2. ✅ Environment variables ARE set in Railway:
   - `EXPO_PUBLIC_API_URL=https://clinic-consent-app-production.up.railway.app/api`
   - `EXPO_PUBLIC_THERAPIST_EMAIL=clinic@caretrace.uk`
   - `EXPO_PUBLIC_ENV_MODE=production`
3. ❌ JavaScript bundle shows: `EXPO_PUBLIC_API_URL: void 0` (undefined)
4. ❌ JavaScript bundle shows: `EXPO_PUBLIC_ENV_MODE: void 0` (undefined)

### Root Cause:
The webapp was built BEFORE the environment variables were added to Railway, so they weren't baked into the JavaScript bundle during the build process.

## Solution: Trigger a Rebuild 🚀

You need to trigger a **new deployment** in Railway so the build process can access the environment variables and bake them into the JavaScript bundle.

### Option 1: Force Redeploy in Railway Dashboard (Recommended)

1. Go to Railway dashboard: https://railway.app
2. Select the **clinic-webapp** project
3. Click on the **clinic-webapp** service
4. Go to the **Deployments** tab
5. Click the **"..."** menu on the latest deployment
6. Select **"Redeploy"**
7. Wait for the build to complete (~5-10 minutes)

### Option 2: Push a Small Change to Trigger Rebuild

```bash
# Make a small change to trigger rebuild
git commit --allow-empty -m "Trigger rebuild with environment variables"
git push origin main
```

### Option 3: Use Railway CLI

```bash
# Trigger a redeploy
railway up --detach
```

## What Will Happen After Rebuild

1. **Build Process**:
   - Railway will run: `npm ci && npm run build:web`
   - During build, `process.env.EXPO_PUBLIC_API_URL` will be available
   - Expo will bake the environment variables into the JavaScript bundle
   - The bundle will contain the correct API URL

2. **Result**:
   - JavaScript bundle will have: `EXPO_PUBLIC_API_URL: "https://clinic-consent-app-production.up.railway.app/api"`
   - The app will use the correct API URL
   - Email sending will work ✅

## Verification After Rebuild

### 1. Check the JavaScript Bundle
Run this script to verify the API URL is in the bundle:
```bash
node check-bundle-config.js
```

Expected output:
```
✅ Found "clinic-consent-app-production.up.railway.app": 1 occurrence(s)
✅ Found "EXPO_PUBLIC_API_URL": Should show the actual URL, not "void 0"
```

### 2. Test Email Sending
1. Open the webapp: https://clinic-webapp-production.up.railway.app
2. Fill out a consent form
3. Try to send email
4. Should work successfully ✅

### 3. Check Browser Console
Open browser console (F12) and look for:
```
=== API Configuration ===
Environment: production
API Base URL: https://clinic-consent-app-production.up.railway.app/api
EXPO_PUBLIC_API_URL: https://clinic-consent-app-production.up.railway.app/api
```

## Why This Happened

**Expo's Build Process**:
- Expo uses environment variables at **BUILD TIME**, not runtime
- The variables are replaced in the code during the build
- If variables aren't available during build, they become `undefined`
- This is different from server-side apps where env vars are read at runtime

**Timeline**:
1. Initial deployment: Built without environment variables
2. Environment variables added: But app wasn't rebuilt
3. Current state: Variables are set, but not in the built bundle
4. Solution: Rebuild to bake variables into the bundle

## Important Notes

⚠️ **Always rebuild after changing environment variables** in Expo apps

✅ **Environment variables are set correctly** - no need to change them

✅ **API backend is working** - no changes needed there

✅ **Only the webapp needs a rebuild** - that's it!

## Expected Timeline

- **Rebuild trigger**: Immediate
- **Build time**: 5-10 minutes
- **Deployment**: Automatic after build
- **Total time**: ~10-15 minutes

## Success Criteria

After rebuild, you should see:
- ✅ Email sending works from the webapp
- ✅ No "Failed to send email" errors
- ✅ Console shows correct API URL
- ✅ JavaScript bundle contains the API URL

---

**Status**: Ready to rebuild  
**Action Required**: Trigger redeploy in Railway  
**Expected Result**: Email service will work after rebuild
