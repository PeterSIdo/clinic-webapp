# Railway Deployment - Quick Start 🚀

## 1️⃣ Test Locally (5 minutes)

```powershell
cd C:\Users\Peter\clinic-webapp

# Install dependencies
npm install

# Build the web app
npm run build:web

# Test the server
npm run serve:web
```

Open: http://localhost:8080

✅ **Verify**: App loads, forms work, health check responds at `/health`

---

## 2️⃣ Commit & Push (2 minutes)

```powershell
# Check status
git status

# Commit any changes
git add .
git commit -m "Ready for Railway deployment"

# Push to repository
git push origin railway-deploy
```

---

## 3️⃣ Railway Setup (5 minutes)

### Option A: New Project
1. Go to: https://railway.app/dashboard
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose: `clinic-webapp` or `clinic-consent-webapp`
5. Select branch: `railway-deploy` or `main`

### Option B: Existing Project
1. Go to your Railway project
2. **Settings** → **Service Settings**
3. Update repository to: `PeterSIdo/clinic-consent-webapp`
4. Update branch to: `railway-deploy` or `main`

---

## 4️⃣ Set Environment Variables (3 minutes)

In Railway Dashboard → **Variables**, add:

```bash
EXPO_PUBLIC_API_URL=https://clinic-consent-app-production.up.railway.app/api
EXPO_PUBLIC_THERAPIST_EMAIL=clinic@caretrace.uk
EXPO_PUBLIC_ENV_MODE=production
```

**Important**: Replace with your actual API URL and email!

---

## 5️⃣ Deploy! (Automatic)

Railway will automatically:
1. ✅ Install dependencies (`npm ci`)
2. ✅ Build web app (`npm run build:web`)
3. ✅ Start server (`node web-server.js`)

**Watch the logs** in Railway dashboard for progress.

---

## 6️⃣ Verify Deployment (2 minutes)

### Health Check
Visit: `https://[your-app].up.railway.app/health`

Should return:
```json
{
  "status": "healthy",
  "service": "clinic-consent-webapp",
  "timestamp": "...",
  "environment": "production"
}
```

### Web App
Visit: `https://[your-app].up.railway.app`

✅ **Check**: App loads, no errors, forms work

---

## 🎉 Done!

Your web app is now live on Railway!

---

## 🔄 Future Deployments

Just push to your branch:

```powershell
git add .
git commit -m "Update feature"
git push origin railway-deploy
```

Railway will automatically redeploy! 🚀

---

## 🐛 Quick Troubleshooting

### Build Fails?
```powershell
# Test locally first
npm run build:web
```
Check Railway logs for specific error.

### Server Won't Start?
- Check if `dist/` folder was created
- Verify environment variables are set
- Review Railway logs

### App Loads But Has Errors?
- Check browser console (F12)
- Verify API URL is correct
- Test API separately

### Need Help?
See full guide: `RAILWAY_DEPLOYMENT_GUIDE.md`

---

## 📋 Key Files

- `railway.json` - Railway configuration
- `nixpacks.toml` - Build configuration  
- `web-server.js` - Production server
- `package.json` - Build scripts

---

## 🔗 Important URLs

- **Railway Dashboard**: https://railway.app/dashboard
- **Your Web App**: `https://[your-app].up.railway.app`
- **Health Check**: `https://[your-app].up.railway.app/health`
- **API Backend**: `https://clinic-consent-app-production.up.railway.app`

---

**Total Time**: ~15-20 minutes for first deployment
**Future Deployments**: ~2-5 minutes (automatic)

✅ **Status**: Ready to deploy!
