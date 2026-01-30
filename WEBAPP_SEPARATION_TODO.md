# Web App Separation - Implementation Checklist

## Goal
Separate web app from API to eliminate config.json conflicts by creating a new repository.

## Progress Tracker

### Phase 1: Create New Local Web App Directory ✅
- [x] Create folder `C:\Users\Peter\clinic-webapp`
- [x] Initialize new git repository
- [x] Set up basic structure

### Phase 2: Copy Web App Files ✅
- [x] Copy app folders (app/, assets/, components/, config/, constants/, contexts/, hooks/, services/, types/, utils/, scripts/)
- [x] Copy configuration files (package.json, app.json, eas.json, tsconfig.json, etc.)
- [x] Copy web-server.js
- [x] Copy environment files (.env.example, .gitignore)
- [x] Copy deployment files (nixpacks.toml, Procfile)
- [x] Rename railway-web.json to railway.json
- [x] Create README.md for web app
- [x] Git add and commit all files

### Phase 3: Create GitHub Repository
- [ ] Create new GitHub repository: clinic-consent-webapp (MANUAL STEP REQUIRED)
- [ ] Add remote to local repository
- [ ] Push to GitHub

### Phase 4: Clean Up Original Repository (Optional)
- [ ] Rename railway-api.json to railway.json
- [ ] Remove railway-web.json
- [ ] Update README

### Phase 5: Verification
- [ ] Test web app builds locally
- [ ] Test web server locally
- [ ] Update Railway deployment
- [ ] Verify both deployments work independently

## Notes
- Original repo: https://github.com/PeterSIdo/clinic-consent-app.git (API)
- New repo: clinic-consent-webapp (Web App)
- Local path: C:\Users\Peter\clinic-webapp
