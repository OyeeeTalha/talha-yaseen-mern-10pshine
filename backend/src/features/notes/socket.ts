import { Server, Socket } from "socket.io";
import { socketAuthMiddleware } from "../../shared/middlewares/socketAuth.js";
import { NoteModel } from "../../models/Notes.js";
import { updateNoteSchema } from "./schema.js";
import logger from "../../shared/utils/logger.js";
import { Types } from "mongoose";

interface AutosavePayload {
  noteId: string;
  title?: string;
  content?: string;
  category?: string | null;
  tags?: string[];
}

// Rate limiting: max saves per user per time window
const RATE_LIMIT_WINDOW = 10000; // 10 seconds
const MAX_SAVES_PER_WINDOW = 10; // 10 saves per 10 seconds
const userSaveCounts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = userSaveCounts.get(userId);

  if (!userLimit || now > userLimit.resetAt) {
    // Reset or initialize
    userSaveCounts.set(userId, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW,
    });
    return true;
  }

  if (userLimit.count >= MAX_SAVES_PER_WINDOW) {
    return false; // Rate limit exceeded
  }

  userLimit.count++;
  return true;
}

export const setupSocketHandlers = (io: Server) => {
  // Apply authentication middleware
  io.use(socketAuthMiddleware);

  io.on("connection", (socket: Socket) => {
    const userId = socket.data.userId;

    logger.info({
      msg: "Client connected",
      socketId: socket.id,
      userId,
    });

    // Join a note room
    socket.on("note:join", async (noteId: string) => {
      try {
        // Verify user owns this note
        const note = await NoteModel.findOne({ _id: noteId, userId });

        if (!note) {
          socket.emit("note:error", {
            message: "Note not found or access denied",
          });
          return;
        }

        socket.join(`note:${noteId}`);
        logger.info({
          msg: "User joined note room",
          noteId,
          userId,
        });

        socket.emit("note:joined", { noteId });
      } catch (error) {
        logger.error({ msg: "Error joining note room", error, noteId });
        socket.emit("note:error", { message: "Failed to join note" });
      }
    });

    // Autosave - DATABASE EFFICIENT: Only update changed fields
    socket.on("note:autosave", async (payload: AutosavePayload) => {
      try {
        const { noteId, ...updates } = payload;

        // Validate ObjectId format
        if (!Types.ObjectId.isValid(noteId)) {
          socket.emit("note:autosave-error", { message: "Invalid note ID" });
          return;
        }

        // Rate limiting check
        if (!checkRateLimit(userId)) {
          logger.warn({
            msg: "Rate limit exceeded",
            userId,
            noteId,
          });
          socket.emit("note:autosave-error", {
            message: "Too many save requests. Please slow down.",
          });
          return;
        }

        // Validate payload
        const validation = updateNoteSchema.safeParse(updates);

        if (!validation.success) {
          const errorMessage = validation.error.issues
            .map((e) => e.message)
            .join(", ");
          logger.error({
            msg: "Validation failed for autosave",
            userId,
            noteId,
            updates,
            errors: validation.error.issues,
          });
          socket.emit("note:autosave-error", { message: errorMessage });
          return;
        }

        // Find note and verify ownership
        const note = await NoteModel.findOne({ _id: noteId, userId });

        if (!note) {
          socket.emit("note:autosave-error", { message: "Note not found" });
          return;
        }

        // DATABASE EFFICIENT: Only update fields that were sent
        // $set only updates provided fields, doesn't touch others
        const updateFields: any = {};

        if (updates.title !== undefined) updateFields.title = updates.title;
        if (updates.content !== undefined)
          updateFields.content = updates.content;
        if (updates.category !== undefined)
          updateFields.category = updates.category;
        if (updates.tags !== undefined) updateFields.tags = updates.tags;

        // Only run update if there are fields to update
        if (Object.keys(updateFields).length > 0) {
          await NoteModel.updateOne({ _id: noteId }, { $set: updateFields });

          logger.info({
            msg: "Autosave successful",
            noteId,
            userId,
            fields: Object.keys(updateFields),
          });

          socket.emit("note:autosave-success", {
            noteId,
            timestamp: new Date().toISOString(),
          });
        } else {
          // No changes to save
          socket.emit("note:autosave-success", {
            noteId,
            timestamp: new Date().toISOString(),
            noChanges: true,
          });
        }
      } catch (error) {
        logger.error({
          msg: "Autosave error",
          error,
          noteId: payload.noteId,
        });
        socket.emit("note:autosave-error", {
          message: "Failed to save note",
        });
      }
    });

    // Handle disconnect - trigger final save if needed
    socket.on("disconnect", () => {
      logger.info({
        msg: "Client disconnected",
        socketId: socket.id,
        userId,
      });
    });

    // Manual disconnect with final save
    socket.on("note:leave", async (payload: AutosavePayload) => {
      try {
        // Same logic as autosave for final save
        const { noteId, ...updates } = payload;

        if (Object.keys(updates).length > 0) {
          const validation = updateNoteSchema.safeParse(updates);

          if (validation.success) {
            const note = await NoteModel.findOne({ _id: noteId, userId });

            if (note) {
              const updateFields: any = {};
              if (updates.title !== undefined)
                updateFields.title = updates.title;
              if (updates.content !== undefined)
                updateFields.content = updates.content;
              if (updates.category !== undefined)
                updateFields.category = updates.category;
              if (updates.tags !== undefined) updateFields.tags = updates.tags;

              if (Object.keys(updateFields).length > 0) {
                await NoteModel.updateOne(
                  { _id: noteId },
                  { $set: updateFields },
                );
              }
            }
          }
        }

        socket.leave(`note:${noteId}`);
        logger.info({ msg: "User left note room", noteId, userId });
      } catch (error) {
        logger.error({ msg: "Error leaving note room", error });
      }
    });
  });
};
