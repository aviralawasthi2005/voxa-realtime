import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let connectPromise = null;

// Add connection event logging
mongoose.connection.on('connected', () => {
  console.log('[MongoDB] Mongoose event: connected');
});
mongoose.connection.on('disconnected', () => {
  console.log('[MongoDB] Mongoose event: disconnected');
});
mongoose.connection.on('error', (err) => {
  console.error('[MongoDB] Mongoose connection error:', err.message);
});

export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (mongoose.connection.readyState === 2) {
    return new Promise((resolve, reject) => {
      mongoose.connection.once('connected', resolve);
      mongoose.connection.once('error', reject);
    });
  }

  if (connectPromise) {
    return connectPromise;
  }

  connectPromise = (async () => {
    try {
      const mongoUri = process.env.MONGODB_URI;

      if (mongoUri && mongoUri.trim().length > 0) {
        try {
          console.log('[MongoDB] Connecting to external MongoDB URI...');
          const conn = await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 5000,
            dbName: 'voxa',
          });
          console.log(`[MongoDB] Connected to external instance: ${conn.connection.host}`);
          return;
        } catch (externalErr) {
          console.warn(`[MongoDB] Could not connect to external URI (${externalErr.message}). Falling back to embedded engine...`);
        }
      }

      // Check if global instance exists and is responsive
      let mongod = global.__MONGO_INSTANCE;
      if (mongod) {
        try {
          const uri = mongod.getUri();
          const conn = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 3000,
            dbName: 'voxa',
          });
          console.log(`[MongoDB] Reconnected to existing embedded engine: ${conn.connection.host}`);
          return;
        } catch (err) {
          console.log('[MongoDB] Existing embedded engine was stale. Recreating...');
          try {
            await mongod.stop();
          } catch (e) {}
          global.__MONGO_INSTANCE = null;
          mongod = null;
        }
      }

      console.log('[MongoDB] Initializing embedded MongoDB engine...');
      mongod = await MongoMemoryServer.create({
        instance: {
          dbName: 'voxa',
          args: ['--quiet'],
        },
      });
      global.__MONGO_INSTANCE = mongod;

      const uri = mongod.getUri();
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000,
        dbName: 'voxa',
      });
      console.log(`[MongoDB] Embedded engine connected: ${conn.connection.host}`);
    } catch (error) {
      console.error(`[MongoDB] Connection error: ${error.message}`);
      throw error;
    } finally {
      connectPromise = null;
    }
  })();

  return connectPromise;
};

export const closeDB = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    if (global.__MONGO_INSTANCE) {
      await global.__MONGO_INSTANCE.stop();
      global.__MONGO_INSTANCE = null;
    }
  } catch (err) {
    console.error('Error closing DB:', err);
  }
};
