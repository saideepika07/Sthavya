import mongoose from "mongoose";

let isConnected = false;
let gridfsBucket = null;

export const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/sthavya_spaces";

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = true;
    gridfsBucket = new mongoose.mongo.GridFSBucket(conn.connection.db, {
      bucketName: "uploads",
    });
    console.log(`✓ MongoDB Connected: ${conn.connection.host} (${conn.connection.name})`);
    return conn;
  } catch (error) {
    isConnected = false;
    console.warn(`! MongoDB Connection Warning: ${error.message}`);
    return null;
  }
};

export const getGridFSBucket = () => {
  if (!gridfsBucket && mongoose.connection?.db) {
    gridfsBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: "uploads",
    });
  }
  return gridfsBucket;
};

export const isDbConnected = () => isConnected || mongoose.connection.readyState === 1;

export default connectDB;
