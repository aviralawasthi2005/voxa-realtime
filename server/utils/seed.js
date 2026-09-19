import mongoose from 'mongoose';
import User from '../models/User.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import Notification from '../models/Notification.js';

export const seedDatabase = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('[Seed] Database already contains records. Skipping initial seeding.');
      return;
    }

    console.log('[Seed] Seeding initial users and conversations...');

    // 1. Create Users
    const usersData = [
      {
        name: 'Alex Johnson',
        username: 'alexj',
        email: 'alex@voxa.com',
        password: 'password123',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        bio: 'Staff Product Designer exploring editorial typography & spatial communication.',
        status: 'online',
        preferences: { theme: 'dark', notifications: true, sound: true },
      },
      {
        name: 'Sarah Miller',
        username: 'sarahm',
        email: 'sarah@voxa.com',
        password: 'password123',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
        bio: 'Distributed Systems & Real-time protocol engineer.',
        status: 'online',
        preferences: { theme: 'dark', notifications: true, sound: true },
      },
      {
        name: 'Marcus Chen',
        username: 'marcusc',
        email: 'marcus@voxa.com',
        password: 'password123',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
        bio: 'Frontend Architect. Dedicated to eliminating web latency.',
        status: 'away',
        preferences: { theme: 'dark', notifications: true, sound: false },
      },
      {
        name: 'Elena Rostova',
        username: 'elenar',
        email: 'elena@voxa.com',
        password: 'password123',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
        bio: 'Creative Technologist & Interface Craftsman.',
        status: 'offline',
        preferences: { theme: 'light', notifications: true, sound: true },
      },
    ];

    const createdUsers = [];
    for (const u of usersData) {
      const user = await User.create(u);
      createdUsers.push(user);
    }

    const [alex, sarah, marcus, elena] = createdUsers;

    // 2. Create 1-on-1 Conversation: Alex & Sarah
    const conv1 = await Conversation.create({
      isGroup: false,
      participants: [alex._id, sarah._id],
      unreadCounts: {
        [alex._id.toString()]: 0,
        [sarah._id.toString()]: 0,
      },
    });

    const m1_1 = await Message.create({
      conversation: conv1._id,
      sender: sarah._id,
      content: 'Hey Alex! Have you reviewed the socket reconnection pipeline yet?',
      status: 'read',
      createdAt: new Date(Date.now() - 1000 * 60 * 35),
      readBy: [{ user: alex._id, readAt: new Date(Date.now() - 1000 * 60 * 30) }],
    });

    const m1_2 = await Message.create({
      conversation: conv1._id,
      sender: alex._id,
      content: 'Yes! The exponential backoff with jitter looks flawless. Tested 3G network drops and reconnect took under 180ms.',
      status: 'read',
      createdAt: new Date(Date.now() - 1000 * 60 * 20),
      readBy: [{ user: sarah._id, readAt: new Date(Date.now() - 1000 * 60 * 18) }],
      reactions: [{ user: sarah._id, emoji: '⚡' }],
    });

    const m1_3 = await Message.create({
      conversation: conv1._id,
      sender: sarah._id,
      content: 'Incredible. Let us make sure the typing indicator debounces smoothly before shipping.',
      status: 'read',
      createdAt: new Date(Date.now() - 1000 * 60 * 5),
      readBy: [{ user: alex._id, readAt: new Date(Date.now() - 1000 * 60 * 4) }],
    });

    conv1.lastMessage = m1_3._id;
    await conv1.save();

    // 3. Create 1-on-1 Conversation: Alex & Marcus
    const conv2 = await Conversation.create({
      isGroup: false,
      participants: [alex._id, marcus._id],
      unreadCounts: {
        [alex._id.toString()]: 0,
        [marcus._id.toString()]: 0,
      },
    });

    const m2_1 = await Message.create({
      conversation: conv2._id,
      sender: marcus._id,
      content: 'Did you see the new editorial font pairing? Space Grotesk on the titles adds serious character.',
      status: 'read',
      createdAt: new Date(Date.now() - 1000 * 60 * 120),
      readBy: [{ user: alex._id, readAt: new Date(Date.now() - 1000 * 60 * 100) }],
    });

    const m2_2 = await Message.create({
      conversation: conv2._id,
      sender: alex._id,
      content: 'Completely agree. It gives VOXA an intentional human presence rather than another cookie-cutter SaaS template.',
      status: 'delivered',
      createdAt: new Date(Date.now() - 1000 * 60 * 40),
    });

    conv2.lastMessage = m2_2._id;
    await conv2.save();

    // 4. Create Group Conversation: "Design & Architecture Core"
    const group1 = await Conversation.create({
      isGroup: true,
      name: 'Design & Architecture Core',
      description: 'Foundations of VOXA spatial layout, typography hierarchy, and message timeline ergonomics.',
      avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
      admin: alex._id,
      participants: [alex._id, sarah._id, marcus._id, elena._id],
      unreadCounts: {
        [alex._id.toString()]: 0,
        [sarah._id.toString()]: 0,
        [marcus._id.toString()]: 0,
        [elena._id.toString()]: 0,
      },
    });

    await Message.create({
      conversation: group1._id,
      sender: alex._id,
      content: 'Alex Johnson created the group "Design & Architecture Core".',
      messageType: 'system',
      status: 'sent',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
    });

    await Message.create({
      conversation: group1._id,
      sender: elena._id,
      content: 'Notice how comfortable the compact message spacing is for long discussions. No oversized bubble padding.',
      status: 'read',
      createdAt: new Date(Date.now() - 1000 * 60 * 55),
    });

    await Message.create({
      conversation: group1._id,
      sender: marcus._id,
      content: 'And the dark theme obsidian palette is gentle on the eyes late at night.',
      status: 'read',
      createdAt: new Date(Date.now() - 1000 * 60 * 50),
      reactions: [{ user: alex._id, emoji: '🖤' }, { user: sarah._id, emoji: '🔥' }],
    });

    const gmLast = await Message.create({
      conversation: group1._id,
      sender: sarah._id,
      content: 'Live presence updates are syncing instantly across active rooms. All set for deployment.',
      status: 'read',
      createdAt: new Date(Date.now() - 1000 * 60 * 10),
    });

    group1.lastMessage = gmLast._id;
    await group1.save();

    // 5. Create notifications for Alex
    await Notification.create({
      recipient: alex._id,
      sender: sarah._id,
      type: 'message',
      conversation: conv1._id,
      title: 'Sarah Miller',
      body: 'Incredible. Let us make sure the typing indicator debounces smoothly before shipping.',
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 5),
    });

    await Notification.create({
      recipient: alex._id,
      sender: elena._id,
      type: 'group_invite',
      conversation: group1._id,
      title: 'Design & Architecture Core',
      body: 'Elena Rostova reacted to recent design updates.',
      read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 50),
    });

    console.log('[Seed] Initial data successfully seeded! Ready for instant testing.');
  } catch (err) {
    console.error('[Seed] Error seeding database:', err);
  }
};
