// Test script to diagnose email API issue
const https = require('https');

const testData = {
  therapistEmail: 'clinic@caretrace.uk',
  clientEmail: 'test@example.com',
  clientName: 'Test Client',
  consentText: 'This is a test consent form',
  signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  agreedAt: new Date().toISOString(),
  templateName: 'massage',
  clientInfo: {
    name: 'Test Client',
    dateOfBirth: '1990-01-01',
    address: '123 Test St',
    phone: '555-0100'
  }
};

const postData = JSON.stringify(testData);

const options = {
  hostname: 'clinic-consent-app-production.up.railway.app',
  port: 443,
  path: '/api/send-consent-email',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('🧪 Testing Email API Endpoint');
console.log('📡 URL:', `https://${options.hostname}${options.path}`);
console.log('📧 To:', testData.therapistEmail);
console.log('👤 Client:', testData.clientName);
console.log('');

const req = https.request(options, (res) => {
  console.log('📡 Response Status:', res.statusCode, res.statusMessage);
  console.log('📡 Response Headers:', JSON.stringify(res.headers, null, 2));
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
      
      if (jsonData.success) {
        console.log('');
        console.log('✅ Email API is working correctly!');
      } else {
        console.log('');
        console.log('❌ Email API returned error:', jsonData.error || jsonData.message);
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
  console.error('- Network connectivity issue');
  console.error('- API server is down');
  console.error('- DNS resolution failed');
});

req.write(postData);
req.end();
