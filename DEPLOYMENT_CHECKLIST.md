# Railway Deployment Checklist ✅

Use this checklist to ensure everything is ready for deployment.

## 🔍 Pre-Deployment Checks

### 1. Local Build Test
```powershell
cd C:\Users\Peter\clinic-webapp
npm install
npm run build:web
```

- [ ] Build completes without errors
- [ ] `dist/` folder is created
- [ ] `dist/index.html` exists
- [ ] `dist/_expo/` folder contains assets

### 2. Local Server Test
```powershell
npm run serve:web
```

- [ ] Server starts on port 8080
- [ ] Can access http://localhost:8080
- [ ] Health endpoint works: http://localhost:8080/health
- [ ] App loads without errors
- [ ] Forms render correctly
- [ ] Navigation works

### 3. Git Repository Status
```powershell
git status
git log --oneline -5
```

- [ ] All changes committed
- [ ] On correct branch (`railway-deploy` or `main`)
- [ ] No uncommitted changes
- [ ] Repository pushed to GitHub/remote

### 4. Deployment Files Present

- [ ] `railway.json` exists and configured
- [ ] `nixpacks.toml` exists and configured
- [ ] `Procfile` exists
- [ ] `web-server.js` exists
- [ ] `package.json` has `build:web` script
- [ ] `.gitignore` includes `dist/` and `node_modules/`

## 🚂 Railway Configuration

### 1. Railway Project Setup

- [ ] Railway account created
- [ ] Project created or existing project identified
- [ ] Repository connected to Railway
- [ ] Correct branch selected (`railway-deploy` or `main`)

### 2. Environment Variables Set

In Railway Dashboard → Variables:

- [ ] `EXPO_PUBLIC_API_URL` = `https://clinic-consent-app-production.up.railway.app/api`
- [ ] `EXPO_PUBLIC_THERAPIST_EMAIL` = `clinic@caretrace.uk`
- [ ] `EXPO_PUBLIC_ENV_MODE` = `production`
- [ ] `NODE_ENV` = `production` (optional, Railway sets this)
- [ ] `PORT` = `8080` (optional, Railway sets this)

### 3. Build Configuration

- [ ] Builder set to NIXPACKS (or auto-detected)
- [ ] Build command: `npm ci && npm run build:web`
- [ ] Start command: `node web-server.js`
- [ ] Node.js version: 20+

## 🚀 Deployment

### 1. Trigger Deployment

Choose one:
- [ ] Push to connected branch: `git push origin railway-deploy`
- [ ] Click "Deploy" in Railway dashboard
- [ ] Merge to main and push

### 2. Monitor Build

Watch Railway logs for:
- [ ] Dependencies installing (`npm ci`)
- [ ] Build running (`npm run build:web`)
- [ ] Build completes successfully
- [ ] Server starts (`node web-server.js`)
- [ ] No error messages

### 3. Expected Log Output

Look for these messages:
```
🌐 Clinic Consent Web App Server
📱 Server running on port 8080
🌍 Environment: production
🔗 API URL: https://...
📧 Therapist Email: clinic@caretrace.uk
✅ Web app ready to serve requests
```

## ✅ Post-Deployment Verification

### 1. Health Check

Visit: `https://[your-app].up.railway.app/health`

- [ ] Returns 200 OK status
- [ ] JSON response with:
  - [ ] `"status": "healthy"`
  - [ ] `"service": "clinic-consent-webapp"`
  - [ ] `timestamp` field
  - [ ] `environment` field

### 2. Web App Access

Visit: `https://[your-app].up.railway.app`

- [ ] App loads successfully
- [ ] No 404 errors
- [ ] No console errors (check browser DevTools)
- [ ] Styles load correctly
- [ ] Images display properly

### 3. Functionality Tests

- [ ] Home page loads
- [ ] Can navigate between pages
- [ ] Forms render correctly
- [ ] Client info form works
- [ ] Health check form works
- [ ] Signature pad works
- [ ] Can draw signature
- [ ] Can clear signature

### 4. API Connection Test

- [ ] Fill out a complete consent form
- [ ] Submit the form
- [ ] Check for success message
- [ ] Verify email is sent (check inbox)
- [ ] Check API logs for request

### 5. Browser Compatibility

Test in multiple browsers:
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari (if available)
- [ ] Mobile browsers (responsive design)

## 🐛 Troubleshooting Checklist

If deployment fails, check:

### Build Failures
- [ ] Review Railway build logs
- [ ] Test `npm run build:web` locally
- [ ] Check for missing dependencies
- [ ] Verify Node.js version compatibility
- [ ] Check for TypeScript errors

### Server Failures
- [ ] Check if `dist/` folder was created
- [ ] Verify `web-server.js` exists
- [ ] Check Railway runtime logs
- [ ] Verify PORT is set correctly
- [ ] Check for Express.js errors

### Runtime Errors
- [ ] Check browser console for errors
- [ ] Verify environment variables are set
- [ ] Test API URL accessibility
- [ ] Check CORS configuration
- [ ] Review network requests in DevTools

### API Connection Issues
- [ ] Verify API backend is running
- [ ] Test API health endpoint directly
- [ ] Check API URL in environment variables
- [ ] Review API logs for errors
- [ ] Verify CORS headers

## 📊 Performance Checks

After deployment:
- [ ] Page load time < 3 seconds
- [ ] No memory leaks (check Railway metrics)
- [ ] CPU usage normal (check Railway metrics)
- [ ] No excessive network requests
- [ ] Gzip compression working (check response headers)

## 🔐 Security Checks

- [ ] HTTPS enabled (Railway provides this)
- [ ] Security headers present (check response headers):
  - [ ] `X-Content-Type-Options: nosniff`
  - [ ] `X-Frame-Options: DENY`
  - [ ] `X-XSS-Protection: 1; mode=block`
- [ ] No sensitive data in logs
- [ ] Environment variables not exposed
- [ ] `.env` files not committed

## 📝 Documentation Updates

After successful deployment:
- [ ] Update README with Railway URL
- [ ] Document environment variables
- [ ] Update API documentation if needed
- [ ] Note any deployment-specific configurations
- [ ] Update team on new deployment

## 🎉 Final Verification

- [ ] Web app is live and accessible
- [ ] All features working as expected
- [ ] API integration functional
- [ ] Emails sending successfully
- [ ] No critical errors in logs
- [ ] Performance is acceptable
- [ ] Team notified of deployment

## 📞 Emergency Rollback

If critical issues occur:

1. **Railway Dashboard**:
   - [ ] Go to Deployments
   - [ ] Find last working deployment
   - [ ] Click "Redeploy"

2. **Git Rollback**:
   ```powershell
   git revert HEAD
   git push origin railway-deploy
   ```

3. **Notify Team**:
   - [ ] Alert team of rollback
   - [ ] Document the issue
   - [ ] Plan fix and redeployment

## 📋 Deployment Log

Record each deployment:

**Deployment Date**: _____________
**Deployed By**: _____________
**Branch**: _____________
**Commit Hash**: _____________
**Railway URL**: _____________
**Status**: ☐ Success ☐ Failed ☐ Rolled Back
**Notes**: _____________________________________________

---

## Quick Command Reference

```powershell
# Test locally
npm run build:web && npm run serve:web

# Deploy
git add .
git commit -m "Deploy to Railway"
git push origin railway-deploy

# Check status
git status
git log --oneline -5

# View Railway logs (in dashboard)
# https://railway.app/dashboard
```

---

**Status**: Ready for deployment ✅
**Last Updated**: January 28, 2025
