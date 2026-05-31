const express = require("express");
const http = require("http");
const next = require("next");
const { Server } = require("socket.io");
const rateLimit = require("express-rate-limit");
const { MongoClient } = require("mongodb");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();
const PORT = process.env.PORT || 3000;

app.prepare().then(() => {
  const server = express();
  const httpServer = http.createServer(server);

  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  // Rate limit only POST /api/users (registration), not PUT (profile edit)
  server.post(
    "/api/users",
    rateLimit({ windowMs: 60_000, max: 10, message: { error: "Too many requests" } })
  );
  server.use(
    "/api/auth",
    rateLimit({ windowMs: 60_000, max: 100, message: { error: "Too many requests" } })
  );

  // Socket.io
  const onlineUsers = new Map();

  io.on("connection", (socket) => {
    const userId = socket.handshake.auth?.token;
    if (userId) {
      onlineUsers.set(userId, socket.id);
      socket.join(`user:${userId}`);
      io.emit("user:online", { userId });
    }

    socket.on("subscribe", ({ userId: uid }) => {
      if (uid) socket.join(`user:${uid}`);
    });

    socket.on("disconnect", () => {
      if (userId) {
        onlineUsers.delete(userId);
        io.emit("user:offline", { userId });
      }
    });
  });

  // Share io with Next.js API routes via global
  global._io = io;

  // Trending score recalculation every 15 min using raw mongodb driver (CJS-safe)
  async function recalculateTrending() {
    const uri = process.env.MONGODB_URI;
    if (!uri) return;
    const client = new MongoClient(uri);
    try {
      await client.connect();
      const db = client.db();
      const cutoff = new Date(Date.now() - 48 * 3_600_000);
      const posts = await db.collection("posts").find({ createdAt: { $gte: cutoff } }).toArray();
      if (!posts.length) return;
      const ops = posts.map((p) => {
        const hoursOld = (Date.now() - new Date(p.createdAt).getTime()) / 3_600_000;
        const score =
          ((p.likesCount || 0) * 3 + (p.commentsCount || 0) * 2 + (p.sharesCount || 0)) /
          Math.pow(hoursOld + 2, 1.5);
        return { updateOne: { filter: { _id: p._id }, update: { $set: { trendingScore: score } } } };
      });
      await db.collection("posts").bulkWrite(ops);
    } finally {
      await client.close();
    }
  }

  setInterval(() => recalculateTrending().catch(console.error), 15 * 60 * 1000);

  server.all("*", (req, res) => handle(req, res));

  httpServer.listen(PORT, () => {
    console.log(`> SocialSpark running on http://localhost:${PORT}`);
  });
});
