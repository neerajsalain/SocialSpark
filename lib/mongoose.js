import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error("MONGODB_URI is not defined");

async function ensureSparseUsernameIndex() {
  try {
    const indexes = await mongoose.connection.collection("users").listIndexes().toArray();
    const bad = indexes.find((i) => i.key?.username === 1 && !i.sparse);
    if (bad) await mongoose.connection.collection("users").dropIndex("username_1");
  } catch (_) {}
}

export async function connectMongoose() {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(MONGODB_URI);
  await ensureSparseUsernameIndex();
}
