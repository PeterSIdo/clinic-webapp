# Railway Deployment Guide for Clinic Consent Web App

## 🎯 Overview

This guide will help you deploy your clinic consent web app to Railway. Your deployment configuration is already set up and ready to go!

## ✅ Pre-Deployment Checklist

### 1. Current Status
- ✅ Deployment files configured (railway.json, nixpacks.toml, Procfile)
- ✅ Web server ready (web-server.js)
- ✅ Build scripts configured in package.json
- ✅ Git repository initialized
- ⏳ Railway project needs to be connected

### 2. Files Ready for Deployment

**Configuration Files**:
- `railway.json` - Railway deployment configuration
- `nixpacks.toml` - Build configuration (Node.js 20)
- `Procfile` - Process definition
- `web-server.js` - Express server for production
- `package.json` - Dependencies and build scripts

**Build Process**:
```
npm ci → npm run build:web → node web-server.js
```

## 🚀 Deployment Steps

### Step 1: Test Local Build

Before deploying, verify the build works locally:

```powershell
# Navigate to project directory
cd C:\Users\Peter\clinic-webapp

# Install dependencies
npm install

# Build the web app
npm run build:web

# This should create a 'dist' folder with your built app
```

**Expected Output**: A `dist/` folder should be created with:
- `index.html`
- `_expo/` folder with static assets
- JavaScript bundles
- CSS files

### Step 2: Test Local Server

```powershell
# Start the production server locally
npm run serve:web
```

Then open: http://localhost:8080

**Verify**:
- ✅ App loads without errors
- ✅ Forms render correctly
- ✅ Navigation works
- ✅ Health check endpoint works: http://localhost:8080/health

### Step 3: Commit Any Pending Changes

```powershell
# Check for uncommitted changes
git status

# If there are changes, commit them
git add .
git commit -m "Prepare for Railway deployment"

# Push to your repository
git push origin railway-deploy
```

### Step 4: Set Up Railway Project

#### Option A: New Railway Project

1. **Go to Railway Dashboard**: https://railway.app/dashboard

2. **Create New Project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository: `clinic-webapp` (or `clinic-consent-webapp`)
   - Select branch: `railway-deploy` (or `main`)

3. **Railway will automatically detect**:
   - Node.js project
   - Build configuration from `railway.json`
   - Start command from `Procfile`

#### Option B: Existing Railway Project

1. **Go to your existing Railway project**

2. **Update Repository Settings**:
   - Settings → Service Settings
   - Change repository to: `PeterSIdo/clinic-consent-webapp`
   - Change branch to: `railway-deploy` (or `main`)

### Step 5: Configure Environment Variables

In Railway Dashboard → Variables, add these:

```bash
# Required Variables
EXPO_PUBLIC_API_URL=https://clinic-consent-app-production.up.railway.app/api
EXPO_PUBLIC_THERAPIST_EMAIL=clinic@caretrace.uk
EXPO_PUBLIC_ENV_MODE=production

# Optional (Railway sets these automatically)
PORT=8080
NODE_ENV=production
```

**Important Notes**:
- Replace the API URL with your actual API backend URL
- Replace the therapist email with the correct email address
- The `PORT` variable is optional (Railway sets it automatically)

### Step 6: Deploy

Railway will automatically deploy when you:
- Push to the connected branch, OR
- Click "Deploy" in the Railway dashboard

**Build Process** (as configured in railway.json):
1. Install dependencies: `npm ci`
2. Build web app: `npm run build:web`
3. Start server: `node web-server.js`

### Step 7: Monitor Deployment

1. **Watch Build Logs** in Railway dashboard
2. **Look for**:
   - ✅ Dependencies installed successfully
   - ✅ Build completed without errors
   - ✅ Server started on port 8080
   - ✅ Health check endpoint responding

**Expected Log Output**:
```
🌐 Clinic Consent Web App Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📱 Server running on port 8080
🌍 Environment: production
🔗 API URL: https://clinic-consent-app-production.up.railway.app/api
📧 Therapist Email: clinic@caretrace.uk
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚂 Railway URL: https://[your-app].up.railway.app
✅ Web app ready to serve requests
```

## 🔍 Post-Deployment Verification

### 1. Check Health Endpoint

Visit: `https://[your-railway-url].up.railway.app/health`

**Expected Response**:
```json
{
  "status": "healthy",
  "service": "clinic-consent-webapp",
  "timestamp": "2025-01-28T...",
  "environment": "production"
}
```

### 2. Test Web App

Visit: `https://[your-railway-url].up.railway.app`

**Verify**:
- ✅ App loads correctly
- ✅ No console errors
- ✅ Forms are functional
- ✅ Signature pad works
- ✅ Can submit forms (if API is connected)

### 3. Test API Connection

1. Fill out a consent form
2. Submit it
3. Check if email is sent successfully
4. Verify API logs show the request

## 🐛 Troubleshooting

### Build Fails

**Issue**: `npm run build:web` fails

**Solutions**:
1. Check build logs for specific errors
2. Verify all dependencies are in `package.json`
3. Test build locally first
4. Check Node.js version (should be 20+)

```powershell
# Test locally
npm run build:web
```

### Server Won't Start

**Issue**: Server fails to start or crashes

**Solutions**:
1. Check if `dist/` folder was created during build
2. Verify `web-server.js` is present
3. Check Railway logs for error messages
4. Ensure PORT environment variable is set

### App Loads But Shows Errors

**Issue**: App loads but has runtime errors

**Solutions**:
1. Check browser console for errors
2. Verify environment variables are set correctly
3. Check if API URL is accessible
4. Test API connection separately

### API Connection Fails

**Issue**: Forms submit but emails don't send

**Solutions**:
1. Verify `EXPO_PUBLIC_API_URL` is correct
2. Check if API backend is running
3. Test API health endpoint directly
4. Check CORS settings on API
5. Review API logs for errors

### Static Assets Not Loading

**Issue**: Images or styles missing

**Solutions**:
1. Check if `dist/` folder contains all assets
2. Verify build completed successfully
3. Check browser network tab for 404 errors
4. Ensure `expo export --platform web` ran correctly

## 📋 Railway Configuration Reference

### railway.json
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm ci && npm run build:web"
  },
  "deploy": {
    "startCommand": "node web-server.js",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### nixpacks.toml
```toml
[phases.setup]
nixPkgs = ["nodejs_20"]

[phases.install]
cmds = ["npm ci"]

[phases.build]
cmds = ["npm run build:web"]

[start]
cmd = "node web-server.js"
```

### Key Features
- **Node.js 20**: Latest LTS version
- **npm ci**: Clean install for reproducible builds
- **Auto-restart**: Restarts on failure (max 10 retries)
- **Health checks**: Built-in health endpoint
- **Compression**: Gzip compression enabled
- **Security headers**: XSS protection, frame options, etc.

## 🔄 Continuous Deployment

Once set up, Railway will automatically deploy when you:

1. **Push to connected branch**:
   ```powershell
   git add .
   git commit -m "Update feature"
   git push origin railway-deploy
   ```

2. **Merge to main branch** (if connected to main):
   ```powershell
   git checkout main
   git merge railway-deploy
   git push origin main
   ```

## 📊 Monitoring

### Railway Dashboard
- **Deployments**: View deployment history
- **Metrics**: CPU, memory, network usage
- **Logs**: Real-time application logs
- **Variables**: Manage environment variables

### Health Checks
- Endpoint: `/health`
- Use for monitoring services
- Returns JSON with status information

## 🔐 Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **API Keys**: Store in Railway variables, not in code
3. **HTTPS**: Railway provides automatic HTTPS
4. **Security Headers**: Already configured in web-server.js

## 📚 Additional Resources

- **Railway Docs**: https://docs.railway.app
- **Expo Web Docs**: https://docs.expo.dev/workflow/web/
- **Express.js Docs**: https://expressjs.com/

## 🎉 Success Checklist

After deployment, you should have:

- ✅ Web app accessible at Railway URL
- ✅ Health endpoint responding
- ✅ Forms loading and functional
- ✅ API connection working
- ✅ Emails sending successfully
- ✅ No console errors
- ✅ Automatic deployments on push

## 📞 Support

If you encounter issues:

1. Check Railway logs first
2. Test locally to isolate the problem
3. Verify environment variables
4. Check API backend status
5. Review this guide's troubleshooting section

## 🚀 Quick Deploy Commands

```powershell
# Full deployment workflow
cd C:\Users\Peter\clinic-webapp

# 1. Test build locally
npm run build:web

# 2. Test server locally
npm run serve:web

# 3. Commit and push
git add .
git commit -m "Deploy to Railway"
git push origin railway-deploy

# 4. Railway will auto-deploy!
```

---

**Last Updated**: January 28, 2025
**Status**: Ready for deployment ✅
