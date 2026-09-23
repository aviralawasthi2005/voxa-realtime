import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod = null;

export const connectDB = async () => {
  try {
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

    console.log('[MongoDB] Initializing embedded MongoDB engine...');
    mongod = await MongoMemoryServer.create({
      instance: {
        args: ['--quiet'],
      },
      spawn: {
        timeout: 60000,
      },
    });
    const uri = mongod.getUri();
    const conn = await mongoose.connect(uri);
    console.log(`[MongoDB] Embedded engine connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
    process.exit(1);
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
