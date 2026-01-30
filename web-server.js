const express = require('express');
const path = require('path');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 8080;

// Enable gzip compression
app.use(compression());

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// API routes MUST come before static file serving
// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'clinic-consent-webapp',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Config check endpoint (for debugging)
app.get('/api/config', (req, res) => {
  res.json({
    apiUrl: process.env.EXPO_PUBLIC_API_URL || 'NOT SET',
    therapistEmail: process.env.EXPO_PUBLIC_THERAPIST_EMAIL || 'NOT SET',
    nodeEnv: process.env.NODE_ENV || 'development',
    railwayUrl: process.env.RAILWAY_STATIC_URL || 'NOT SET',
    note: 'These are runtime environment variables. The webapp may have different values baked in during build time.'
  });
});

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, 'dist'), {
  maxAge: '1d', // Cache static assets for 1 day
  etag: true,
}));

// Handle client-side routing - serve index.html for all routes
// This MUST be last
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('🌐 Clinic Consent Web App Server');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📱 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API URL: ${process.env.EXPO_PUBLIC_API_URL || 'Not set'}`);
  console.log(`📧 Therapist Email: ${process.env.EXPO_PUBLIC_THERAPIST_EMAIL || 'Not set'}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  if (process.env.RAILWAY_STATIC_URL) {
    console.log(`🚂 Railway URL: https://${process.env.RAILWAY_STATIC_URL}`);
  }
  
  console.log('✅ Web app ready to serve requests');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  process.exit(0);
});
