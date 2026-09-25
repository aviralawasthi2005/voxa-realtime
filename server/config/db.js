import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod = null;

export const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      return;
    }

    const mongoUri = process.env.MONGODB_URI;

    if (mongoUri && mongoUri.trim().length > 0) {
      try {
        console.log('Connecting to provided MongoDB URI...');
        const conn = await mongoose.connect(mongoUri, {
          serverSelectionTimeoutMS: 4000,
        });
        console.log(`[MongoDB] Connected to external instance: ${conn.connection.host}`);
        return;
      } catch (externalErr) {
        console.warn(`[MongoDB] Could not connect to external URI (${externalErr.message}). Falling back to in-memory instance...`);
      }
    }

    if (!mongod) {
      console.log('[MongoDB] Initializing embedded MongoDB engine...');
      mongod = await MongoMemoryServer.create({
        instance: {
          args: ['--quiet'],
        },
        spawn: {
          stdio: 'ignore',
          timeout: 60000,
        },
      });
      global.__MONGO_INSTANCE = mongod;
    }

    const uri = mongod.getUri();
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[MongoDB] Embedded engine connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
    mongod = null;
    global.__MONGO_INSTANCE = null;
    throw error;
  }
};

export const closeDB = async () => {
  try {
    await mongoose.connection.close();
    if (mongod) {
      await mongod.stop();
    }
  } catch (err) {
    console.error('Error closing DB:', err);
  }
};
