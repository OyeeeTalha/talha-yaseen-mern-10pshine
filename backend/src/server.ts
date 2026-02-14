import "dotenv/config";
import mongoose from "mongoose";
import { createServer } from "http";
import { Server } from "socket.io";
import { WebSocketServer } from "ws";
import app from "./app.js";
import { connectDB } from "./config/database.js";
import { setupSocketHandlers } from "./features/notes/socket.js";
import { createHocuspocusServer } from "./features/collaboration/hocuspocus.js";

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  await connectDB();

  const httpServer = createServer(app);

  // Initialize Socket.io (for metadata autosave, room management)
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
    // Don't destroy non-matching WebSocket upgrades (needed for Hocuspocus)
    destroyUpgrade: false,
  });

  // Setup socket event handlers
  setupSocketHandlers(io);

  // Initialize Hocuspocus (for real-time Yjs collaboration)
  const hocuspocus = createHocuspocusServer();
  const collabWss = new WebSocketServer({ noServer: true });

  // Route WebSocket upgrades: Socket.IO handles /socket.io/, Hocuspocus handles /collaboration/
  httpServer.on("upgrade", (request, socket, head) => {
    const url = request.url || "";
    if (url.startsWith("/collaboration")) {
      collabWss.handleUpgrade(request, socket, head, (ws) => {
        hocuspocus.handleConnection(ws, request);
      });
    }
    // Socket.IO handles /socket.io/ internally via its own upgrade listener
  });

  httpServer.listen(PORT, () => {
    const host = process.env.HOST || "localhost";
    const protocol = process.env.PROTOCOL || "http";
    console.log(`🚀 Server running at ${protocol}://${host}:${PORT}`);
    console.log(`🔌 WebSocket server ready`);
    console.log(`🤝 Collaboration server ready at /collaboration`);
  });
};

startServer();

process.on("SIGINT", async () => {
  await mongoose.connection.close();
  process.exit(0);
});
