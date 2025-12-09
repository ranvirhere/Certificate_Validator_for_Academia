import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth/login';

const maliciousPayloads = [
  { email: 'test@example.com', password: 'password123<script>alert(1)</script>' }, // XSS
  { email: 'test@example.com', password: 'password123" OR "1"="1' }, // SQL/NoSQL Injection
  { email: 'test@example.com', password: 'password123; DROP TABLE users' }, // Command Injection
];

const cleanPayload = { email: 'valid@example.com', password: 'validPassword123' };

const testSecurity = async () => {
  console.log('🛡️ Starting Security Tests...');

  // 1. Test Clean Input (Should NOT return 400 Sanitization Error)
  try {
    console.log(`\nTesting Clean Payload: ${JSON.stringify(cleanPayload)}`);
    await axios.post(API_URL, cleanPayload);
    console.log('✅ PASSED: Clean payload accepted (or failed auth normally).');
  } catch (error) {
    if (error.response && error.response.status === 400 && error.response.data.error === "Invalid or unsafe input detected.") {
      console.error('❌ FAILED: Clean payload was falsely rejected as unsafe!');
    } else {
      console.log(`✅ PASSED: Clean payload failed with expected error: ${error.response?.status} (likely 401/404)`);
    }
  }

  // 2. Test Malicious Payloads
  for (const payload of maliciousPayloads) {
    try {
      console.log(`\nTesting payload: ${JSON.stringify(payload)}`);
      await axios.post(API_URL, payload);
      console.error('❌ FAILED: Request should have been rejected but was accepted.');
    } catch (error) {
      if (error.response && error.response.status === 400 && error.response.data.error === "Invalid or unsafe input detected.") {
        console.log('✅ PASSED: Request rejected with 400 and correct error message.');
      } else {
        console.error(`❌ FAILED: Unexpected response. Status: ${error.response?.status}, Data: ${JSON.stringify(error.response?.data)}`);
      }
    }
  }

  console.log('\n🛡️ Security Tests Completed.');
};

testSecurity();
