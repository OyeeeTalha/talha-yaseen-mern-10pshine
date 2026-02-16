import { io, Socket } from "socket.io-client";
import { logger } from "@/lib/logger";

// Extract base URL and convert to WebSocket URL if needed
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const SOCKET_URL = API_URL; // Socket.io handles the protocol automatically

interface AutosavePayload {
  noteId: string;
  title?: string;
  content?: string;
  category?: string | null;
  tags?: string[];
}

interface AutosaveQueueItem extends AutosavePayload {
  timestamp: number;
}

class SocketService {
  private socket: Socket | null = null;
  private saveQueue: AutosaveQueueItem[] = [];
  private isProcessingQueue = false;
  private readonly MAX_QUEUE_SIZE = 50; // Prevent memory leak
  private currentNoteData: AutosavePayload | null = null; // Track current note for emergency save

  connect() {
    if (this.socket?.connected) {
      logger.info({ msg: "Socket already connected" });
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ["polling", "websocket"], // Try polling first, then upgrade
      path: "/socket.io/",
    });

    this.setupEventHandlers();
    return this.socket;
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      logger.info({ msg: "Socket connected", socketId: this.socket?.id });
      // Process any queued saves after reconnection
      this.processQueue();
    });

    this.socket.on("disconnect", (reason) => {
      logger.warn({ msg: "Socket disconnected", reason });

      // If disconnection is unexpected (browser crash, network loss), save current note
      if (reason === "transport close" || reason === "transport error") {
        this.emergencySave();
      }
    });

    this.socket.on("connect_error", (error) => {
      logger.error({ msg: "Socket connection error", error: error.message });
    });

    this.socket.on("note:error", (data) => {
      logger.error({ msg: "Note operation error", data });
    });
  }

  joinNote(
    noteId: string,
    onJoined?: () => void,
    onError?: (message: string) => void,
  ) {
    if (!this.socket?.connected) {
      logger.warn({ msg: "Socket not connected, cannot join note" });
      return;
    }

    this.socket.emit("note:join", noteId);

    // Listen for join confirmation
    this.socket.once("note:joined", () => {
      logger.info({ msg: "Joined note room", noteId });
      onJoined?.();
    });

    this.socket.once("note:error", (data) => {
      logger.error({ msg: "Failed to join note", data });
      onError?.(data.message);
    });
  }

  autosave(
    payload: AutosavePayload,
    onSuccess?: (data: {
      noteId: string;
      timestamp: string;
      noChanges?: boolean;
    }) => void,
    onError?: (message: string) => void,
  ) {
    // Track current note for emergency saves
    this.currentNoteData = payload;

    if (!this.socket?.connected) {
      // Queue the save for when connection is restored
      logger.warn({
        msg: "Socket not connected, queueing autosave",
        noteId: payload.noteId,
      });
      this.queueSave(payload);
      return;
    }

    this.socket.emit("note:autosave", payload);

    // Setup one-time listeners for this specific save
    const successHandler = (data: {
      noteId: string;
      timestamp: string;
      noChanges?: boolean;
    }) => {
      if (data.noteId === payload.noteId) {
        logger.info({ msg: "Autosave successful", noteId: payload.noteId });
        onSuccess?.(data);
        cleanup();
      }
    };

    const errorHandler = (data: { message: string }) => {
      logger.error({ msg: "Autosave failed", data });
      onError?.(data.message);
      cleanup();
    };

    const cleanup = () => {
      this.socket?.off("note:autosave-success", successHandler);
      this.socket?.off("note:autosave-error", errorHandler);
    };

    this.socket.on("note:autosave-success", successHandler);
    this.socket.on("note:autosave-error", errorHandler);

    // Cleanup after timeout
    setTimeout(cleanup, 10000);
  }

  leaveNote(payload: AutosavePayload) {
    if (!this.socket?.connected) {
      logger.warn({ msg: "Socket not connected, cannot leave note" });
      return;
    }

    this.socket.emit("note:leave", payload);
    logger.info({ msg: "Left note room", noteId: payload.noteId });
  }

  // Synchronous save using Beacon API for page unload scenarios
  saveSync(payload: AutosavePayload) {
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
    const url = `${API_URL}/notes/update-note/${payload.noteId}`;

    const data = {
      title: payload.title,
      content: payload.content,
      category: payload.category,
      tags: payload.tags,
    };

    // Remove undefined fields
    Object.keys(data).forEach((key) => {
      if (data[key as keyof typeof data] === undefined) {
        delete data[key as keyof typeof data];
      }
    });

    // Use fetch with keepalive (better than Beacon for auth)
    // keepalive ensures request completes even after page unload
    try {
      fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include", // Send cookies for auth
        keepalive: true, // CRITICAL: Keeps request alive after page closes
      })
        .then(() => {
          logger.info({ msg: "Sync save completed", noteId: payload.noteId });
        })
        .catch((error) => {
          logger.warn({
            msg: "Sync save failed",
            noteId: payload.noteId,
            error,
          });
        });
      return true;
    } catch (error) {
      logger.error({ msg: "Sync save error", error });
      return false;
    }
  }

  private queueSave(payload: AutosavePayload) {
    // Remove any existing queued save for this note
    this.saveQueue = this.saveQueue.filter(
      (item) => item.noteId !== payload.noteId,
    );

    // Check queue size limit
    if (this.saveQueue.length >= this.MAX_QUEUE_SIZE) {
      logger.warn({
        msg: "Queue size limit reached, dropping oldest save",
        queueSize: this.saveQueue.length,
      });
      this.saveQueue.shift(); // Remove oldest
    }

    // Add new save to queue
    this.saveQueue.push({
      ...payload,
      timestamp: Date.now(),
    });

    logger.info({ msg: "Save queued", queueSize: this.saveQueue.length });
  }

  private async processQueue() {
    if (
      this.isProcessingQueue ||
      this.saveQueue.length === 0 ||
      !this.socket?.connected
    ) {
      return;
    }

    this.isProcessingQueue = true;
    logger.info({
      msg: "Processing save queue",
      queueSize: this.saveQueue.length,
    });

    while (this.saveQueue.length > 0 && this.socket?.connected) {
      const item = this.saveQueue.shift();
      if (item) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { timestamp, ...payload } = item;
        this.socket.emit("note:autosave", payload);
        // Small delay between queued saves
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    this.isProcessingQueue = false;
    logger.info({ msg: "Queue processing complete" });
  }

  // Emergency save for unexpected disconnections (crash, network loss)
  private emergencySave() {
    if (!this.currentNoteData) return;

    logger.info({
      msg: "Emergency save triggered",
      noteId: this.currentNoteData.noteId,
    });

    // Queue the save - it will be processed on reconnect
    this.queueSave(this.currentNoteData);
  }

  // Update current note data for emergency saves
  setCurrentNote(data: AutosavePayload) {
    this.currentNoteData = data;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.currentNoteData = null;
      logger.info({ msg: "Socket disconnected" });
    }
  }

  getSocket() {
    return this.socket;
  }

  isConnected() {
    return this.socket?.connected || false;
  }
}

// Export singleton instance
export const socketService = new SocketService();
