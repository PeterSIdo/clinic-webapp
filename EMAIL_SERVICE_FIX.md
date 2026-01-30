# Email Service Issue - Diagnosis and Fix

## Problem
Email sending fails with error: "Failed to send email"

## Root Cause Analysis

### ✅ What's Working
1. **API Backend**: Fully functional at `https://clinic-consent-app-production.up.railway.app/api`
   - Health check: ✅ OK
   - Email endpoint: ✅ Working (tested successfully)
   - SMTP credentials: ✅ Configured correctly
   - Test email sent successfully with messageId: `QzFXvWDjQbutlCj7jYJumQ`

2. **Webapp Deployment**: ✅ Healthy and running

### ❌ The Issue
The webapp is likely **missing the `EXPO_PUBLIC_API_URL` environment variable** during the build process.

## Why This Happens

Expo/React Native apps bake environment variables into the JavaScript bundle **during build time**, not runtime. The variables must be set:
1. **During the build** (`npm run build:web`)
2. **With the `EXPO_PUBLIC_` prefix** (Expo requirement)

## Solution

### Step 1: Set Environment Variables in Railway (Webapp Service)

You need to set these variables in the **webapp Railway service** (not the API service):

```bash
EXPO_PUBLIC_API_URL=https://clinic-consent-app-production.up.railway.app/api
EXPO_PUBLIC_THERAPIST_EMAIL=clinic@caretrace.uk
NODE_ENV=production
```

### Step 2: Trigger a Rebuild

After setting the environment variables, you must trigger a **new deployment** so the build process includes these variables:

**Option A: Via Railway Dashboard**
1. Go to your webapp service in Railway
2. Click "Settings" → "Environment Variables"
3. Add the variables above
4. Click "Deploy" → "Redeploy"

**Option B: Via Railway CLI**
```bash
# Make sure you're in the webapp service
railway service

# Set the variables
railway variables set EXPO_PUBLIC_API_URL=https://clinic-consent-app-production.up.railway.app/api
railway variables set EXPO_PUBLIC_THERAPIST_EMAIL=clinic@caretrace.uk
railway variables set NODE_ENV=production

# Trigger redeploy
railway up --detach
```

**Option C: Push a commit to trigger rebuild**
```bash
# Make a small change (like updating this file)
git add .
git commit -m "Trigger rebuild with environment variables"
git push
```

## Verification Steps

### 1. Check Build Logs
After redeployment, check the Railway build logs for:
```
🔗 API URL: https://clinic-consent-app-production.up.railway.app/api
📧 Therapist Email: clinic@caretrace.uk
```

### 2. Test Config Endpoint
Visit: `https://[your-webapp-url]/api/config`

Should show:
```json
{
  "apiUrl": "https://clinic-consent-app-production.up.railway.app/api",
  "therapistEmail": "clinic@caretrace.uk",
  "nodeEnv": "production",
  "railwayUrl": "[your-webapp-url]"
}
```

### 3. Test Email Sending
1. Open the webapp
2. Fill out a consent form
3. Try sending via email
4. Should now work! ✅

## Technical Details

### How Expo Environment Variables Work

```javascript
// config/api.ts
production: {
  baseUrl: process.env.EXPO_PUBLIC_API_URL || 'fallback-url',
}
```

- `process.env.EXPO_PUBLIC_API_URL` is replaced at **build time**
- If not set during build, it becomes `undefined`
- The fallback URL is used, which may be incorrect

### Build Process
```
1. Railway runs: npm ci
2. Railway runs: npm run build:web
   ↓
   Expo reads EXPO_PUBLIC_* variables
   ↓
   Variables are baked into JavaScript bundle
   ↓
   dist/ folder created with bundled code
3. Railway runs: node web-server.js
   ↓
   Serves the pre-built dist/ folder
```

## Common Mistakes

❌ **Setting variables after build**: Variables must be set BEFORE building
❌ **Wrong variable name**: Must use `EXPO_PUBLIC_` prefix
❌ **Setting in wrong service**: Must be in webapp service, not API service
❌ **Not rebuilding**: Must trigger new deployment after setting variables

## Alternative: Hardcode for Quick Fix

If you need a quick fix without redeployment, you can temporarily hardcode the API URL:

```typescript
// config/api.ts
production: {
  baseUrl: 'https://clinic-consent-app-production.up.railway.app/api',
}
```

Then commit and push. But the proper solution is to use environment variables.

## Test Results

✅ **API Backend Test** (using test-email-api.js):
```
Response Status: 200 OK
Email sent successfully
MessageId: QzFXvWDjQbutlCj7jYJumQ
Recipients: clinic@caretrace.uk, test@example.com
```

This confirms the API is working perfectly. The issue is purely on the webapp side.

## Next Steps

1. ✅ Set environment variables in Railway webapp service
2. ✅ Trigger redeploy
3. ✅ Verify config endpoint shows correct values
4. ✅ Test email sending in the app
5. ✅ Celebrate! 🎉
