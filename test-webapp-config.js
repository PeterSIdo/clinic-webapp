// Test script to check webapp configuration
const https = require('https');

const options = {
  hostname: 'clinic-webapp-production.up.railway.app',
  port: 443,
  path: '/api/config',
  method: 'GET',
  headers: {
    'Accept': 'application/json'
  }
};

console.log('🧪 Testing Webapp Configuration');
console.log('📡 URL:', `https://${options.hostname}${options.path}`);
console.log('');

const req = https.request(options, (res) => {
  console.log('📡 Response Status:', res.statusCode, res.statusMessage);
  console.log('');

  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('📡 Response Body:');
    try {
      const jsonData = JSON.parse(data);
      console.log(JSON.stringify(jsonData, null, 2));
      console.log('');
      
      // Check if API URL is set correctly
      if (jsonData.apiUrl && jsonData.apiUrl.includes('clinic-consent-app-production.up.railway.app')) {
        console.log('✅ API URL is configured correctly in the webapp!');
        console.log('');
        console.log('🎯 Next Step: Test email sending in the webapp UI');
      } else if (jsonData.apiUrl === 'NOT SET') {
        console.log('❌ API URL is NOT SET in the webapp');
        console.log('');
        console.log('⚠️  The webapp needs to be REBUILT for environment variables to take effect.');
        console.log('');
        console.log('To fix:');
        console.log('1. Trigger a redeploy: railway up --detach');
        console.log('2. Or push a new commit to trigger rebuild');
      } else {
        console.log('⚠️  API URL is set but may be incorrect:');
        console.log('   Current:', jsonData.apiUrl);
        console.log('   Expected: https://clinic-consent-app-production.up.railway.app/api');
      }
    } catch (e) {
      console.log(data);
      console.log('');
      console.log('⚠️ Response is not valid JSON');
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request Error:', error.message);
  console.error('');
  console.error('Possible causes:');
  console.error('- Webapp is not deployed');
  console.error('- Network connectivity issue');
  console.error('- DNS resolution failed');
});

req.end();
