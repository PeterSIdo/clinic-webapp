# Quick Start: Push to GitHub

## Step 1: Create GitHub Repository

1. Go to: **https://github.com/new**
2. Repository name: **`clinic-consent-webapp`**
3. Description: **`Web application for Clinic Consent system`**
4. Choose: **Private** (recommended)
5. **DO NOT** check any boxes (no README, no .gitignore, no license)
6. Click: **"Create repository"**

## Step 2: Push Your Code

Copy and paste these commands in PowerShell:

```powershell
cd C:\Users\Peter\clinic-webapp

git remote add origin https://github.com/PeterSIdo/clinic-consent-webapp.git

git push -u origin master
```

**Note**: Replace `PeterSIdo` with your actual GitHub username if different.

## Step 3: Verify on GitHub

1. Go to: https://github.com/PeterSIdo/clinic-consent-webapp
2. You should see all your files
3. Check that there's NO `api/` folder (✅ correct!)

## Step 4: Update Railway

1. Go to: **https://railway.app/dashboard**
2. Find your **Web App project**
3. Go to: **Settings → Service Settings**
4. Update repository to: **`PeterSIdo/clinic-consent-webapp`**
5. Branch: **`master`**
6. Click: **"Deploy"**

## Done! 🎉

Your web app is now:
- ✅ In its own repository
- ✅ Separated from the API
- ✅ No more config.json conflicts
- ✅ Ready for independent deployment

## Troubleshooting

**If you get authentication error:**
- Use a Personal Access Token instead of password
- Generate at: https://github.com/settings/tokens

**If you need to change the remote URL:**
```powershell
git remote set-url origin https://github.com/YOUR_USERNAME/clinic-consent-webapp.git
```

## What's Next?

After Railway deploys:
1. Check Railway logs for any errors
2. Visit your Railway URL
3. Test the consent form
4. Verify API connection works

## Repository Structure

**Web App** (this repo): `clinic-consent-webapp`
- Contains: React Native/Expo web app
- Deploys: Web frontend
- URL: Will be assigned by Railway

**API** (original repo): `clinic-consent-app`
- Contains: Node.js/Express API
- Deploys: Backend API
- URL: https://clinic-consent-app-production.up.railway.app

---

**For detailed instructions, see**: `GITHUB_SETUP_INSTRUCTIONS.md`
