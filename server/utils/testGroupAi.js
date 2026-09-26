async function testGroup() {
  try {
    const loginRes = await fetch('http://127.0.0.1:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'alex@voxa.com', password: 'password123' })
    });
    const { data: { token } } = await loginRes.json();

    // Get group conversation
    const convsRes = await fetch('http://127.0.0.1:5000/api/conversations', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const { data: { conversations } } = await convsRes.json();
    const groupConv = conversations.find(c => c.isGroup);
    console.log('Group Conversation:', groupConv?.name, groupConv?._id);

    // Send @ai message in the group
    const sendRes = await fetch('http://127.0.0.1:5000/api/messages', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversationId: groupConv._id,
        content: '@ai can you write a quick debounce function in JavaScript for us?'
      })
    });
    console.log('User group message status:', sendRes.status);

    console.log('Waiting for AI response in group...');
    await new Promise(r => setTimeout(r, 1600));

    const listRes = await fetch('http://127.0.0.1:5000/api/messages/' + groupConv._id, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const { data: { messages } } = await listRes.json();
    const lastMsg = messages[messages.length - 1];
    console.log('Last message in group is from:', lastMsg.sender?.name, `(isBot: ${lastMsg.sender?.isBot})`);
    console.log('Last message preview:\n', lastMsg.content.slice(0, 150), '...');
  } catch (err) {
    console.error('Group test error:', err);
  }
}
testGroup();
