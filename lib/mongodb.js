import { setDefaultResultOrder } from "dns";
setDefaultResultOrder("ipv4first");
import mongoose from "mongoose";

console.log("🔍 MONGODB_URI:", process.env.MONGODB_URI);

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!process.env.MONGODB_URI) {
    throw new Error("❌ MONGODB_URI is not defined in .env.local");
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI, {
      bufferCommands: false,
      dbName: "ai-hub",
      serverSelectionTimeoutMS: 10000,
      family: 4,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectDB;