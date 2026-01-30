# Clinic Consent Web App

This is the web application for the Clinic Consent system. It's a React Native/Expo application that can be deployed as a web app.

## Overview

This repository contains only the web application frontend. The API backend is maintained in a separate repository: [clinic-consent-app](https://github.com/PeterSIdo/clinic-consent-app)

## Project Structure

```
clinic-webapp/
├── app/              # App screens and routing
├── assets/           # Images and static assets
├── components/       # Reusable React components
├── config/           # Configuration files
├── constants/        # App constants and templates
├── contexts/         # React contexts
├── hooks/            # Custom React hooks
├── services/         # Service layer (API calls, storage)
├── types/            # TypeScript type definitions
├── utils/            # Utility functions
├── web-server.js     # Production web server
└── railway.json      # Railway deployment config
```

## Development

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
npm install
```

### Running Locally

```bash
# Development mode
npm start

# Web development
npm run web

# Network mode (for testing on devices)
npm run start:network
```

### Building for Production

```bash
# Build web app
npm run build:web

# Serve locally
npm run serve:web
```

## Deployment

This app is configured for deployment on Railway.

### Environment Variables

Required environment variables:
- `EXPO_PUBLIC_API_URL` - API endpoint URL
- `EXPO_PUBLIC_THERAPIST_EMAIL` - Therapist email address
- `EXPO_PUBLIC_ENV_MODE` - Environment mode (development/network/production)

### Railway Deployment

The app automatically deploys to Railway when changes are pushed to the main branch.

**Production URL**: Will be assigned by Railway (e.g., `clinic-consent-webapp-production.up.railway.app`)

## API Integration

This web app connects to the backend API for:
- Sending consent forms via email
- PDF generation
- Email service integration

**API Repository**: https://github.com/PeterSIdo/clinic-consent-app

## Scripts

- `npm start` - Start Expo development server
- `npm run web` - Start web development server
- `npm run build:web` - Build for web production
- `npm run serve:web` - Serve built web app
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS

## Technology Stack

- **Framework**: React Native with Expo
- **Routing**: Expo Router
- **Language**: TypeScript
- **Styling**: React Native StyleSheet
- **Web Server**: Express.js (for production)

## License

MIT
