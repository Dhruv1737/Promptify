import mongoose from "mongoose";

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null, server: null };
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = (async () => {
      // 1. PRODUCTION MODE: If a real cloud URI exists, use it immediately
      if (process.env.MONGODB_URI) {
        console.log("☁️ Production Mode: Connecting straight to MongoDB Atlas Cloud...");
        return mongoose.connect(process.env.MONGODB_URI, { bufferCommands: false });
      }

      // 2. LOCAL DEVELOPMENT MODE: Fall back to memory server if offline/blocked
      const { MongoMemoryServer } = await import("mongodb-memory-server");
      if (!cached.server) {
        cached.server = await MongoMemoryServer.create();
      }
      
      const localUri = cached.server.getUri();
      console.log("🚀 Development Mode: Firewalls bypassed via Local Memory Engine!");
      return mongoose.connect(localUri, { bufferCommands: false });
    })();
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectDB;