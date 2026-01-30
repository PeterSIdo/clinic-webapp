// Check what API URL is baked into the deployed JavaScript bundle
const https = require('https');

const options = {
  hostname: 'clinic-webapp-production.up.railway.app',
  port: 443,
  path: '/_expo/static/js/web/entry-52ad1815fe45a3c368198da5883e13c7.js',
  method: 'GET'
};

console.log('🔍 Checking JavaScript bundle for API URL...');
console.log('📡 URL:', `https://${options.hostname}${options.path}`);
console.log('');

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('📦 Bundle size:', (data.length / 1024).toFixed(2), 'KB');
    console.log('');
    
    // Search for API URL patterns
    const patterns = [
      'clinic-consent-app-production.up.railway.app',
      'localhost:3001',
      '10.0.2.2:3001',
      '192.168.1.11:3001',
      'EXPO_PUBLIC_API_URL'
    ];
    
    console.log('🔍 Searching for API URL patterns in bundle:');
    console.log('');
    
    let foundAny = false;
    patterns.forEach(pattern => {
      const regex = new RegExp(pattern, 'g');
      const matches = data.match(regex);
      if (matches) {
        console.log(`✅ Found "${pattern}": ${matches.length} occurrence(s)`);
        foundAny = true;
        
        // Try to find context around the match
        const index = data.indexOf(pattern);
        if (index !== -1) {
          const start = Math.max(0, index - 100);
          const end = Math.min(data.length, index + pattern.length + 100);
          const context = data.substring(start, end);
          console.log(`   Context: ...${context}...`);
          console.log('');
        }
      } else {
        console.log(`❌ Not found: "${pattern}"`);
      }
    });
    
    if (!foundAny) {
      console.log('');
      console.log('⚠️  No API URL patterns found in bundle!');
      console.log('');
      console.log('This means the webapp was built WITHOUT environment variables.');
      console.log('The app is likely using a fallback/default URL or undefined.');
    }
    
    console.log('');
    console.log('💡 Solution: Trigger a REBUILD in Railway to bake in the environment variables.');
  });
});

req.on('error', (error) => {
  console.error('❌ Request Error:', error.message);
});

req.end();
