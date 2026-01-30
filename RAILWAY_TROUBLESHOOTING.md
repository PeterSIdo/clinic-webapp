# Railway Deployment Troubleshooting Guide 🔧

Quick solutions to common Railway deployment issues.

---

## 🚨 Build Failures

### Error: "npm ci failed"

**Symptoms**: Build fails during dependency installation

**Solutions**:
```powershell
# 1. Test locally
npm ci

# 2. Check package-lock.json exists
dir package-lock.json

# 3. If missing, regenerate it
npm install

# 4. Commit and push
git add package-lock.json
git commit -m "Update package-lock.json"
git push origin railway-deploy
```

**Common Causes**:
- Missing or corrupted `package-lock.json`
- Incompatible Node.js version
- Network issues during install

---

### Error: "npm run build:web failed"

**Symptoms**: Build command fails

**Solutions**:
```powershell
# 1. Test build locally
npm run build:web

# 2. Check for TypeScript errors
npm run lint

# 3. Verify Expo is installed
npm list expo

# 4. Check build output
dir dist
```

**Common Causes**:
- TypeScript compilation errors
- Missing dependencies
- Expo configuration issues
- Out of memory (increase Railway plan)

**Check Railway Logs For**:
```
Error: Cannot find module 'expo'
Error: TypeScript compilation failed
Error: Out of memory
```

---

### Error: "dist folder not created"

**Symptoms**: Build completes but dist/ folder is missing

**Solutions**:
```powershell
# 1. Verify build script in package.json
# Should be: "build:web": "expo export --platform web"

# 2. Check app.json web configuration
# Should have: "web": { "output": "static" }

# 3. Test locally
npm run build:web
dir dist

# 4. Check .gitignore doesn't exclude dist during build
```

**Verify in app.json**:
```json
{
  "expo": {
    "web": {
      "output": "static",
      "favicon": "./assets/images/favicon.png"
    }
  }
}
```

---

## 🖥️ Server Startup Failures

### Error: "Cannot find module 'express'"

**Symptoms**: Server fails to start, missing dependencies

**Solutions**:
```powershell
# 1. Verify express is in dependencies (not devDependencies)
# In package.json:
"dependencies": {
  "express": "^4.21.2",
  "compression": "^1.7.4"
}

# 2. Reinstall dependencies
npm install

# 3. Commit and push
git add package.json package-lock.json
git commit -m "Fix dependencies"
git push origin railway-deploy
```

---

### Error: "ENOENT: no such file or directory, stat 'dist'"

**Symptoms**: Server can't find dist folder

**Solutions**:
1. **Verify build completed successfully**
   - Check Railway build logs
   - Look for "npm run build:web" success message

2. **Check railway.json build command**:
   ```json
   {
     "build": {
       "buildCommand": "npm ci && npm run build:web"
     }
   }
   ```

3. **Verify web-server.js path**:
   ```javascript
   app.use(express.static(path.join(__dirname, 'dist')));
   ```

---

### Error: "Port already in use"

**Symptoms**: Server fails to bind to port

**Solutions**:
```javascript
// In web-server.js, ensure PORT is from environment
const PORT = process.env.PORT || 8080;

// Railway sets PORT automatically
// Don't hardcode the port!
```

**Check Railway Variables**:
- PORT should be set by Railway (don't override)
- If you set it manually, remove it

---

## 🌐 Runtime Errors

### Error: "Failed to fetch" or API connection errors

**Symptoms**: App loads but can't connect to API

**Solutions**:

1. **Verify Environment Variables in Railway**:
   ```bash
   EXPO_PUBLIC_API_URL=https://clinic-consent-app-production.up.railway.app/api
   ```

2. **Test API separately**:
   ```powershell
   # Test API health endpoint
   curl https://clinic-consent-app-production.up.railway.app/api/health
   ```

3. **Check CORS on API**:
   - API must allow requests from your web app domain
   - Check API CORS configuration

4. **Verify API is running**:
   - Check API Railway service status
   - Review API logs for errors

5. **Check browser console**:
   - Open DevTools (F12)
   - Look for network errors
   - Check if API URL is correct

---

### Error: "404 Not Found" for routes

**Symptoms**: Direct URLs return 404, but navigation works

**Solutions**:

**Verify web-server.js has catch-all route**:
```javascript
// This should be LAST route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});
```

**Check route order**:
1. Static files middleware first
2. Health check endpoint
3. Catch-all route LAST

---

### Error: Static assets not loading (images, CSS)

**Symptoms**: App loads but styles/images missing

**Solutions**:

1. **Check browser network tab**:
   - Look for 404 errors
   - Check asset paths

2. **Verify dist folder contents**:
   ```powershell
   # Locally
   npm run build:web
   dir dist
   dir dist\_expo
   ```

3. **Check static middleware in web-server.js**:
   ```javascript
   app.use(express.static(path.join(__dirname, 'dist'), {
     maxAge: '1d',
     etag: true,
   }));
   ```

4. **Verify build completed**:
   - Check Railway build logs
   - Look for "expo export" success

---

## 🔐 Environment Variable Issues

### Error: "API URL not set" or undefined

**Symptoms**: App can't find API URL

**Solutions**:

1. **Check Railway Variables**:
   - Go to Railway Dashboard → Variables
   - Verify all variables are set:
     ```
     EXPO_PUBLIC_API_URL
     EXPO_PUBLIC_THERAPIST_EMAIL
     EXPO_PUBLIC_ENV_MODE
     ```

2. **Verify variable names**:
   - Must start with `EXPO_PUBLIC_`
   - Case-sensitive!
   - No typos

3. **Redeploy after setting variables**:
   - Variables only apply to new deployments
   - Click "Redeploy" in Railway

4. **Check config/api.ts**:
   ```typescript
   const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL || 'fallback-url';
   ```

---

### Error: Environment variables not updating

**Symptoms**: Changed variables but app still uses old values

**Solutions**:

1. **Redeploy the service**:
   - Railway Dashboard → Deployments
   - Click "Redeploy"

2. **Clear browser cache**:
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Or clear cache in DevTools

3. **Verify in Railway logs**:
   - Check startup logs for environment values
   - Look for "API URL: ..." in logs

---

## 🐌 Performance Issues

### Issue: Slow build times

**Solutions**:

1. **Use npm ci instead of npm install**:
   ```json
   {
     "build": {
       "buildCommand": "npm ci && npm run build:web"
     }
   }
   ```

2. **Check Railway plan**:
   - Free tier has limited resources
   - Consider upgrading for faster builds

3. **Optimize dependencies**:
   - Remove unused packages
   - Use production dependencies only

---

### Issue: Slow page loads

**Solutions**:

1. **Verify compression is enabled**:
   ```javascript
   // In web-server.js
   const compression = require('compression');
   app.use(compression());
   ```

2. **Check asset caching**:
   ```javascript
   app.use(express.static(path.join(__dirname, 'dist'), {
     maxAge: '1d', // Cache for 1 day
     etag: true,
   }));
   ```

3. **Optimize build**:
   - Expo automatically optimizes for production
   - Check bundle sizes in dist/_expo/

4. **Use Railway CDN**:
   - Railway provides CDN automatically
   - No additional configuration needed

---

## 🔄 Deployment Issues

### Issue: Deployment stuck or hanging

**Solutions**:

1. **Check Railway status**:
   - Visit: https://railway.app/status
   - Check for platform issues

2. **Cancel and retry**:
   - Railway Dashboard → Cancel deployment
   - Click "Redeploy"

3. **Check build logs**:
   - Look for where it's stuck
   - May be waiting for input (shouldn't happen)

---

### Issue: Automatic deployments not working

**Solutions**:

1. **Verify GitHub connection**:
   - Railway Dashboard → Settings
   - Check repository is connected
   - Verify branch is correct

2. **Check webhook**:
   - GitHub repo → Settings → Webhooks
   - Should have Railway webhook
   - Check recent deliveries

3. **Manual trigger**:
   - Push a commit to trigger deployment
   - Or click "Deploy" in Railway

---

## 🔍 Debugging Tips

### View Railway Logs

1. **Build Logs**:
   - Railway Dashboard → Deployments
   - Click on deployment
   - View "Build" tab

2. **Runtime Logs**:
   - Railway Dashboard → Deployments
   - Click on deployment
   - View "Deploy" tab

3. **Filter Logs**:
   - Use search to find specific errors
   - Look for "Error", "Failed", "Warning"

---

### Test Locally First

**Always test locally before deploying**:

```powershell
# Full local test
cd C:\Users\Peter\clinic-webapp

# Clean install
rm -r node_modules
npm ci

# Build
npm run build:web

# Verify dist folder
dir dist

# Test server
npm run serve:web

# Open in browser
start http://localhost:8080
```

---

### Check Health Endpoint

**Test health endpoint**:
```powershell
# Local
curl http://localhost:8080/health

# Production
curl https://[your-app].railway.app/health
```

**Expected Response**:
```json
{
  "status": "healthy",
  "service": "clinic-consent-webapp",
  "timestamp": "2025-01-28T...",
  "environment": "production"
}
```

---

### Browser DevTools

**Check browser console** (F12):

1. **Console Tab**:
   - Look for JavaScript errors
   - Check for API errors
   - Verify environment variables

2. **Network Tab**:
   - Check failed requests
   - Verify API calls
   - Check response codes

3. **Application Tab**:
   - Check local storage
   - Verify service worker (if any)

---

## 📞 Getting Help

### Railway Support

1. **Railway Discord**: https://discord.gg/railway
2. **Railway Docs**: https://docs.railway.app
3. **Railway Status**: https://railway.app/status

### Expo Support

1. **Expo Docs**: https://docs.expo.dev
2. **Expo Forums**: https://forums.expo.dev
3. **Expo Discord**: https://chat.expo.dev

### Project-Specific

1. **Check documentation**:
   - `RAILWAY_DEPLOYMENT_GUIDE.md`
   - `DEPLOYMENT_CHECKLIST.md`
   - `README.md`

2. **Review configuration**:
   - `railway.json`
   - `nixpacks.toml`
   - `web-server.js`
   - `package.json`

---

## 🔧 Emergency Rollback

**If deployment fails critically**:

### Option 1: Rollback in Railway

1. Railway Dashboard → Deployments
2. Find last working deployment
3. Click "Redeploy"

### Option 2: Git Revert

```powershell
# Revert last commit
git revert HEAD

# Push to trigger new deployment
git push origin railway-deploy
```

### Option 3: Deploy Previous Commit

```powershell
# Find working commit
git log --oneline

# Reset to that commit
git reset --hard <commit-hash>

# Force push (be careful!)
git push -f origin railway-deploy
```

---

## ✅ Prevention Checklist

**Before each deployment**:

- [ ] Test build locally: `npm run build:web`
- [ ] Test server locally: `npm run serve:web`
- [ ] Check for TypeScript errors: `npm run lint`
- [ ] Verify environment variables are set
- [ ] Review recent changes
- [ ] Check Railway status page
- [ ] Have rollback plan ready

---

## 📊 Common Error Messages

| Error | Likely Cause | Solution |
|-------|--------------|----------|
| `ENOENT: no such file or directory` | Missing dist folder | Check build completed |
| `Cannot find module 'express'` | Missing dependency | Add to dependencies |
| `Port already in use` | Hardcoded port | Use process.env.PORT |
| `Failed to fetch` | API connection issue | Check API URL and CORS |
| `404 Not Found` | Missing catch-all route | Add `app.get('*', ...)` |
| `Out of memory` | Build too large | Upgrade Railway plan |
| `npm ci failed` | Lock file issue | Regenerate package-lock.json |

---

**Remember**: Most issues can be caught by testing locally first! 🧪

**Last Updated**: January 28, 2025
