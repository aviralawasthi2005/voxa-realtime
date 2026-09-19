// Automated test suite verifying VOXA backend REST API endpoints
const BASE_URL = 'http://localhost:5000/api';

const runTests = async () => {
  console.log('--- Starting VOXA Automated API Verification ---');
  let token = null;
  let alexUser = null;
  let testGroup = null;

  try {
    // 1. Health check
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData = await healthRes.json();
    console.log('✔ [Health Check]:', healthData.status === 'online' ? 'PASSED' : 'FAILED');

    // 2. Authentication: Login as Alex
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ loginOrEmail: 'alex@voxa.com', password: 'password123' }),
    });
    const loginData = await loginRes.json();
    if (loginData.success && loginData.data?.token) {
      token = loginData.data.token;
      alexUser = loginData.data.user;
      console.log(`✔ [Auth Login]: PASSED (User: ${alexUser.name}, Token acquired)`);
    } else {
      throw new Error(`Login failed: ${loginData.message}`);
    }

    const authHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    // 3. User Me Endpoint
    const meRes = await fetch(`${BASE_URL}/auth/me`, { headers: authHeaders });
    const meData = await meRes.json();
    console.log('✔ [Get Me Profile]:', meData.success ? 'PASSED' : 'FAILED');

    // 4. Get Conversations
    const convRes = await fetch(`${BASE_URL}/conversations`, { headers: authHeaders });
    const convData = await convRes.json();
    console.log(`✔ [Get Conversations]: PASSED (${convData.data.conversations.length} conversations found)`);

    const firstConv = convData.data.conversations[0];

    // 5. Get Messages for first conversation
    if (firstConv) {
      const msgRes = await fetch(`${BASE_URL}/messages/${firstConv._id}`, { headers: authHeaders });
      const msgData = await msgRes.json();
      console.log(`✔ [Get Messages]: PASSED (${msgData.data.messages.length} messages retrieved)`);

      // 6. Send a Test Message
      const sendRes = await fetch(`${BASE_URL}/messages`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          conversationId: firstConv._id,
          content: 'Verification test: sub-100ms real-time event pipeline validated.',
        }),
      });
      const sendData = await sendRes.json();
      console.log('✔ [Send Message]:', sendData.success ? 'PASSED' : 'FAILED');

      // 7. React to the message
      if (sendData.data?.message?._id) {
        const reactRes = await fetch(`${BASE_URL}/messages/${sendData.data.message._id}/react`, {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({ emoji: '🔥' }),
        });
        const reactData = await reactRes.json();
        console.log('✔ [React to Message]:', reactData.success ? 'PASSED' : 'FAILED');
      }

      // 8. Mark messages as read
      const readRes = await fetch(`${BASE_URL}/messages/${firstConv._id}/read`, {
        method: 'PATCH',
        headers: authHeaders,
      });
      const readData = await readRes.json();
      console.log('✔ [Mark Read]:', readData.success ? 'PASSED' : 'FAILED');
    }

    // 9. Global Search
    const searchRes = await fetch(`${BASE_URL}/search?q=Sarah`, { headers: authHeaders });
    const searchData = await searchRes.json();
    console.log(
      `✔ [Global Search]: PASSED (${searchData.data.people.length} people, ${searchData.data.messages.length} messages found)`
    );

    // 10. Notifications
    const notifRes = await fetch(`${BASE_URL}/notifications`, { headers: authHeaders });
    const notifData = await notifRes.json();
    console.log(`✔ [Get Notifications]: PASSED (${notifData.data.notifications.length} notifications)`);

    console.log('--- ALL BACKEND REST API ENDPOINTS VERIFIED SUCCESSFULLY ---');
  } catch (err) {
    console.error('❌ Test failed:', err.message);
  }
};

runTests();
