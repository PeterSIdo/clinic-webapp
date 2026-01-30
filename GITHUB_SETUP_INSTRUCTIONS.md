# GitHub Repository Setup Instructions

## Current Status ✅

Your web app has been successfully separated and is ready to push to GitHub!

**Local Repository**: `C:\Users\Peter\clinic-webapp`
**Initial Commit**: Complete (67 files committed)

## Next Steps: Create GitHub Repository

### Option 1: Using GitHub Website (Recommended)

1. **Go to GitHub**: https://github.com/new

2. **Repository Settings**:
   - **Repository name**: `clinic-consent-webapp`
   - **Description**: `Web application for Clinic Consent system (React Native/Expo)`
   - **Visibility**: Choose Private or Public
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)

3. **Click "Create repository"**

4. **Copy the repository URL** (it will look like):
   ```
   https://github.com/PeterSIdo/clinic-consent-webapp.git
   ```

5. **Open PowerShell** and run these commands:
   ```powershell
   cd C:\Users\Peter\clinic-webapp
   
   # Add the remote repository
   git remote add origin https://github.com/PeterSIdo/clinic-consent-webapp.git
   
   # Push to GitHub
   git push -u origin master
   ```

6. **Enter your GitHub credentials** when prompted

### Option 2: Using GitHub CLI (If you want to install it)

1. **Install GitHub CLI**:
   - Download from: https://cli.github.com/
   - Or use winget: `winget install --id GitHub.cli`

2. **After installation, run**:
   ```powershell
   cd C:\Users\Peter\clinic-webapp
   
   # Login to GitHub
   gh auth login
   
   # Create repository and push
   gh repo create clinic-consent-webapp --private --source=. --remote=origin --push
   ```

## After Pushing to GitHub

### Update Railway Deployment

1. **Go to Railway Dashboard**: https://railway.app/dashboard

2. **Find your Web App project** (currently pointing to the old repo)

3. **Update Repository Settings**:
   - Go to Settings → Service Settings
   - Change repository to: `PeterSIdo/clinic-consent-webapp`
   - Branch: `master` (or `main` if you renamed it)

4. **Verify Environment Variables** are still set:
   - `EXPO_PUBLIC_API_URL`
   - `EXPO_PUBLIC_THERAPIST_EMAIL`
   - `EXPO_PUBLIC_ENV_MODE`

5. **Trigger a new deployment** or wait for automatic deployment

## Verify Everything Works

### Test Locally First
```powershell
cd C:\Users\Peter\clinic-webapp

# Install dependencies
npm install

# Build web app
npm run build:web

# Test the web server
npm run serve:web
```

Then open: http://localhost:8080

### After Railway Deployment
- Check Railway logs for any errors
- Visit your Railway URL (e.g., `clinic-consent-webapp-production.up.railway.app`)
- Test the consent form functionality
- Verify API connection works

## Repository Structure

Your new repository contains:
- ✅ Web app code only (no API folder)
- ✅ Clean `railway.json` for web deployment
- ✅ All necessary configuration files
- ✅ README with documentation

## Original Repository (API)

The original repository at `https://github.com/PeterSIdo/clinic-consent-app.git` should now be used only for the API backend.

**Optional cleanup** (can be done later):
- Rename `railway-api.json` to `railway.json`
- Remove `railway-web.json` to avoid confusion
- Update README to indicate it's API-only

## Troubleshooting

### If push fails with authentication error:
```powershell
# Use personal access token instead of password
# Generate token at: https://github.com/settings/tokens
```

### If you need to change remote URL:
```powershell
git remote set-url origin https://github.com/PeterSIdo/clinic-consent-webapp.git
```

### If you accidentally pushed to wrong repo:
```powershell
git remote remove origin
git remote add origin https://github.com/PeterSIdo/clinic-consent-webapp.git
git push -u origin master
```

## Summary

✅ **Completed**:
- Created separate web app directory
- Copied all web app files (excluding API)
- Initialized git repository
- Created initial commit
- Created README and documentation

⏳ **Next (Manual Steps)**:
1. Create GitHub repository: `clinic-consent-webapp`
2. Add remote and push
3. Update Railway to use new repository
4. Test deployment

🎯 **Result**: 
- No more config.json conflicts!
- Clean separation between web app and API
- Independent deployments for each platform
