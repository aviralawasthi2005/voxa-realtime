const BASE_URL = 'http://127.0.0.1:5000/api';

const runOtpAnd2FATests = async () => {
  console.log('\n--- Starting VOXA Email OTP & 2FA Verification Suite ---');

  const timestamp = Date.now();
  const testEmail = `user_${timestamp}@voxa.local`;
  const testUsername = `user_${timestamp}`;
  const testPassword = 'Password123!';
  const testName = 'Test User OTP';

  try {
    // 1. REGISTER NEW USER
    console.log('\n[1] Testing Registration with Email OTP...');
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: testName,
        username: testUsername,
        email: testEmail,
        password: testPassword,
        confirmPassword: testPassword,
      }),
    });
    const regData = await regRes.json();
    console.log('Registration response:', regData.message);

    if (!regData.success || !regData.data?.requiresVerification) {
      throw new Error('Registration did not require email OTP verification!');
    }
    const receivedOtp = regData.data.previewOtp;
    console.log(`✔ [Register OTP Issued]: Generated code is: ${receivedOtp}`);

    // 2. TEST INVALID OTP
    console.log('\n[2] Testing Verification with invalid code (999999)...');
    const invalidVerifyRes = await fetch(`${BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, otp: '999999' }),
    });
    const invalidData = await invalidVerifyRes.json();
    if (invalidVerifyRes.status === 400 && !invalidData.success) {
      console.log('✔ [Invalid OTP Handled]: Rejected properly:', invalidData.message);
    } else {
      throw new Error('Invalid OTP was unexpectedly accepted!');
    }

    // 3. TEST VALID OTP VERIFICATION
    console.log('\n[3] Testing Verification with correct code...');
    const validVerifyRes = await fetch(`${BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, otp: receivedOtp }),
    });
    const validData = await validVerifyRes.json();
    if (validData.success && validData.data?.token && validData.data?.user?.isVerified) {
      console.log('✔ [OTP Verification Succeeded]: User verified and session token issued!');
    } else {
      throw new Error(`OTP verification failed: ${JSON.stringify(validData)}`);
    }

    let authToken = validData.data.token;

    // 4. TEST 2FA ACTIVATION FLOW
    console.log('\n[4] Requesting 2FA Activation Confirmation Code...');
    const req2FARes = await fetch(`${BASE_URL}/auth/2fa/request-activation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
    });
    const req2FAData = await req2FARes.json();
    if (!req2FAData.success || !req2FAData.data?.previewOtp) {
      throw new Error('Failed to request 2FA activation code!');
    }
    const activationOtp = req2FAData.data.previewOtp;
    console.log(`✔ [2FA Activation Code]: Received: ${activationOtp}`);

    // Confirm activation
    console.log('\n[5] Activating 2FA with confirmation code...');
    const enable2FARes = await fetch(`${BASE_URL}/auth/2fa/toggle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ enable: true, otp: activationOtp }),
    });
    const enable2FAData = await enable2FARes.json();
    if (!enable2FAData.success || !enable2FAData.data?.twoFactorEnabled) {
      throw new Error('Failed to enable 2FA!');
    }
    console.log('✔ [2FA Enabled]: Status is now enabled!');

    // 5. TEST LOGIN WITH 2FA CHALLENGE
    console.log('\n[6] Testing Login with 2FA Challenge...');
    const login2FARes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ loginOrEmail: testEmail, password: testPassword }),
    });
    const login2FAData = await login2FARes.json();

    if (!login2FAData.requires2FA || !login2FAData.data?.tempToken) {
      throw new Error('Login did not challenge for 2FA code!');
    }
    console.log('✔ [2FA Challenge Triggered]: Prompted for 2FA code with tempToken');
    const twoFactorCode = login2FAData.data.previewOtp;
    const tempToken = login2FAData.data.tempToken;

    // 6. VERIFY 2FA CODE
    console.log('\n[7] Verifying 2FA Security Code...');
    const verify2FARes = await fetch(`${BASE_URL}/auth/verify-2fa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tempToken, otp: twoFactorCode }),
    });
    const verify2FAData = await verify2FARes.json();
    if (verify2FAData.success && verify2FAData.data?.token) {
      console.log('✔ [2FA Login Completed]: Full session JWT token issued!');
      authToken = verify2FAData.data.token;
    } else {
      throw new Error('2FA verification failed!');
    }

    // 7. DISABLE 2FA
    console.log('\n[8] Testing Disabling 2FA with current password...');
    const disable2FARes = await fetch(`${BASE_URL}/auth/2fa/toggle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ enable: false, password: testPassword }),
    });
    const disable2FAData = await disable2FARes.json();
    if (disable2FAData.success && disable2FAData.data?.twoFactorEnabled === false) {
      console.log('✔ [2FA Disabled]: Status is now disabled.');
    } else {
      throw new Error('Failed to disable 2FA!');
    }

    console.log('\n==================================================');
    console.log('🎉 ALL EMAIL OTP & 2FA BACKEND TESTS PASSED 100%!');
    console.log('==================================================\n');
  } catch (err) {
    console.error('❌ Test failed:', err.message);
    process.exit(1);
  }
};

runOtpAnd2FATests();
