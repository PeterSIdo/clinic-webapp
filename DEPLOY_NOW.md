# Deploy Web App to Railway - Step by Step 🚀

## ✅ Pre-Deployment Verification Complete

- ✅ Local build successful (`npm run build:web`)
- ✅ `dist/` folder created with all files
- ✅ Local server tested and working
- ✅ All deployment files configured

---

## 🚂 Railway Deployment Steps

### Step 1: Create New Service in Railway

You already have a Railway project: **honest-stillness**

**Option A: Using Railway Dashboard (Recommended)**

1. Go to: https://railway.app/dashboard
2. Open your project: **honest-stillness**
3. Click **"+ New"** button
4. Select **"GitHub Repo"**
5. Choose your repository (you'll need to push to GitHub first - see below)
6. Railway will detect the configuration automatically

**Option B: Using Railway CLI**

```powershell
# Make sure you're in the web app directory
cd C:\Users\Peter\clinic-webapp

# Link to your existing project
railway link

# Create a new service
railway service create clinic-consent-webapp

# Deploy
railway up
```

---

### Step 2: Push to GitHub First (Required)

Railway needs your code on GitHub. Let's push the railway-deploy branch:

```powershell
# Check current status
git status

# Make sure all changes are committed
git add .
git commit -m "Ready for Railway deployment"

# Push to GitHub
git push origin railway-deploy
```

**If you don't have a GitHub remote yet:**

1. Create a new repository on GitHub: https://github.com/new
   - Name: `clinic-consent-webapp`
   - Don't initialize with README

2. Add the remote and push:
```powershell
git remote add origin https://github.com/PeterSIdo/clinic-consent-webapp.git
git push -u origin railway-deploy
```

---

### Step 3: Set Environment Variables in Railway

Once the service is created, add these variables:

**Go to**: Railway Dashboard → Your Project → New Service → Variables

```bash
EXPO_PUBLIC_API_URL=https://clinic-consent-app-production.up.railway.app/api
EXPO_PUBLIC_THERAPIST_EMAIL=clinic@caretrace.uk
EXPO_PUBLIC_ENV_MODE=production
NODE_ENV=production
```

**Important**: These variables connect your web app to your existing API service!

---

### Step 4: Deploy!

**If using Dashboard:**
- Railway will automatically deploy after connecting the repo
- Watch the build logs

**If using CLI:**
```powershell
railway up
```

---

### Step 5: Verify Deployment

1. **Get your URL** from Railway dashboard or:
   ```powershell
   railway domain
   ```

2. **Test Health Endpoint**:
   ```powershell
   curl https://[your-webapp-url].railway.app/health
   ```

3. **Open in Browser**:
   ```powershell
   start https://[your-webapp-url].railway.app
   ```

---

## 🔧 Quick Railway CLI Commands

```powershell
# Check current status
railway status

# View logs
railway logs

# Open in browser
railway open

# View environment variables
railway variables

# Add a variable
railway variables set KEY=VALUE

# Deploy
railway up
```

---

## 📊 Expected Build Output

Railway will:
1. ✅ Install Node.js 20
2. ✅ Run `npm ci` (install dependencies)
3. ✅ Run `npm run build:web` (build the app)
4. ✅ Start `node web-server.js` (start server)

**Build time**: ~2-5 minutes

---

## 🎯 Your Current Setup

**Project**: honest-stillness
**Existing Service**: clinic-consent-api
**New Service**: clinic-consent-webapp (to be created)

**API URL**: https://clinic-consent-app-production.up.railway.app/api
**Web App URL**: Will be assigned by Railway (e.g., `clinic-consent-webapp-production.up.railway.app`)

---

## ✅ Post-Deployment Checklist

After deployment:

- [ ] Health endpoint responds: `/health`
- [ ] Web app loads in browser
- [ ] No console errors (F12)
- [ ] Forms render correctly
- [ ] Can submit a test form
- [ ] Email is sent successfully
- [ ] API connection works

---

## 🐛 If Something Goes Wrong

1. **Check Railway Logs**:
   ```powershell
   railway logs
   ```

2. **Verify Environment Variables**:
   ```powershell
   railway variables
   ```

3. **Check Build Logs** in Railway Dashboard

4. **Refer to**: `RAILWAY_TROUBLESHOOTING.md`

---

## 🚀 Ready to Deploy?

**Quick Deploy (if GitHub is set up):**

```powershell
# 1. Commit any changes
git add .
git commit -m "Deploy to Railway"

# 2. Push to GitHub
git push origin railway-deploy

# 3. Create service in Railway Dashboard
# Go to: https://railway.app/dashboard
# Click: + New → GitHub Repo → Select your repo

# 4. Set environment variables (see Step 3 above)

# 5. Deploy automatically happens!
```

---

**Need help?** Check the comprehensive guides:
- `RAILWAY_QUICK_START.md` - Quick reference
- `RAILWAY_DEPLOYMENT_GUIDE.md` - Detailed guide
- `RAILWAY_TROUBLESHOOTING.md` - Fix issues

**Good luck! 🎉**
