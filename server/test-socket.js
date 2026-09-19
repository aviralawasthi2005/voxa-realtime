import { io } from 'socket.io-client';

const runSocketVerification = async () => {
  console.log('--- Starting Real-Time Socket.io Verification ---');

  // 1. Get token by logging in as Alex
  const res = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ loginOrEmail: 'alex@voxa.com', password: 'password123' }),
  });
  const data = await res.json();
  const token = data.data.token;

  // 2. Connect client socket
  const socket = io('http://localhost:5000', {
    auth: { token },
    transports: ['websocket'],
  });

  socket.on('connect', () => {
    console.log('✔ [Socket Connect]: Connected with socket ID:', socket.id);
  });

  socket.on('onlineUsersList', (users) => {
    console.log(`✔ [Socket Presence]: Received online users list (${users.length} active)`);
  });

  socket.on('userOnline', (info) => {
    console.log('✔ [Socket User Online Event]:', info);
  });

  // Get conversations to test joining and sending
  const convRes = await fetch('http://localhost:5000/api/conversations', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const convData = await convRes.json();
  const testConv = convData.data.conversations[0];

  if (testConv) {
    socket.emit('joinConversation', testConv._id);
    console.log(`✔ [Socket Room Join]: Joined conversation room: ${testConv.name || testConv._id}`);

    // Listen for typing broadcast
    socket.on('typing', (typingData) => {
      console.log('✔ [Socket Typing Received]:', typingData);
    });

    // Listen for message
    socket.on('receiveMessage', (msgData) => {
      console.log('✔ [Socket Receive Message Received]:', msgData.message?.content);
      setTimeout(() => {
        socket.disconnect();
        console.log('--- REAL-TIME SOCKET VERIFICATION COMPLETED SUCCESSFULLY ---');
        process.exit(0);
      }, 500);
    });

    // Trigger typing
    socket.emit('typing', { conversationId: testConv._id });

    // Send a message via API which emits via socket
    setTimeout(async () => {
      await fetch('http://localhost:5000/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          conversationId: testConv._id,
          content: 'Socket pipeline automated test payload.',
        }),
      });
    }, 300);
  }
};

runSocketVerification();
