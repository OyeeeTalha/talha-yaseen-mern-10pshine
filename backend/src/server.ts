import "dotenv/config";
import mongoose from "mongoose";
import { createServer } from "http";
import { Server } from "socket.io";
import app from "./app.js";
import { connectDB } from "./config/database.js";
import { setupSocketHandlers } from "./features/notes/socket.js";

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  await connectDB();

  const httpServer = createServer(app);

  // Initialize Socket.io
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      credentials: true,
      methods: ["GET", "POST"],
    },
    allowEIO3: true,
    transports: ["websocket", "polling"],
    // Security: Connection limits
    maxHttpBufferSize: 10e6, // 10MB max message size
    pingTimeout: 60000, // 60s before disconnect if no pong
    pingInterval: 25000, // Send ping every 25s
  });

  // Setup socket event handlers
  setupSocketHandlers(io);

  httpServer.listen(PORT, () => {
    const host = process.env.HOST || "localhost";
    const protocol = process.env.PROTOCOL || "http";
    console.log(`🚀 Server running at ${protocol}://${host}:${PORT}`);
    console.log(`🔌 WebSocket server ready`);
  });
};

startServer();

process.on("SIGINT", async () => {
  await mongoose.connection.close();
  process.exit(0);
});
