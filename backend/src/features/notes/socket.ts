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

// Check if user has access to a note (owner or collaborator)
async function checkNoteAccess(
  noteId: string,
  userId: string
): Promise<{ note: any; accessLevel: "owner" | "edit" | "readonly" | null }> {
  const note = await NoteModel.findOne({
    _id: noteId,
    isDeleted: { $ne: true },
  });

  if (!note) {
    return { note: null, accessLevel: null };
  }

  // Check if owner
  if (note.userId.toString() === userId) {
    return { note, accessLevel: "owner" };
  }

  // Check if in sharedWith list
  const sharedEntry = note.sharedWith?.find(
    (s) => s.userId?.toString() === userId
  );

  if (sharedEntry) {
    return { note, accessLevel: sharedEntry.accessLevel as "edit" | "readonly" };
  }

  // Check if note is shared via link and user has accessed it
  if (note.shareId && note.shareAccessLevel) {
    return { note, accessLevel: note.shareAccessLevel as "edit" | "readonly" };
  }

  return { note: null, accessLevel: null };
}

// Determine change types for edit history
function getChangeTypes(updates: Partial<AutosavePayload>): string[] {
  const changeTypes: string[] = [];
  if (updates.title !== undefined) changeTypes.push("title");
  if (updates.content !== undefined) changeTypes.push("content");
  if (updates.tags !== undefined) changeTypes.push("tags");
  if (updates.category !== undefined) changeTypes.push("category");
  return changeTypes;
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

    // Join a note room - supports both owner and collaborators
    socket.on("note:join", async (noteId: string) => {
      try {
        const { note, accessLevel } = await checkNoteAccess(noteId, userId);

        if (!note || !accessLevel) {
          socket.emit("note:error", {
            message: "Note not found or access denied",
          });
          return;
        }

        // Store access level in socket data for later use
        socket.data.noteAccess = socket.data.noteAccess || {};
        socket.data.noteAccess[noteId] = accessLevel;

        socket.join(`note:${noteId}`);
        
        // Get count of users in the room
        const room = io.sockets.adapter.rooms.get(`note:${noteId}`);
        const collaboratorCount = room ? room.size : 1;

        logger.info({
          msg: "User joined note room",
          noteId,
          userId,
          accessLevel,
          collaboratorCount,
        });

        socket.emit("note:joined", { 
          noteId, 
          accessLevel,
          collaboratorCount 
        });

        // Notify other users in the room that someone joined
        socket.to(`note:${noteId}`).emit("note:user-joined", {
          userId,
          collaboratorCount,
        });
      } catch (error) {
        logger.error({ msg: "Error joining note room", error, noteId });
        socket.emit("note:error", { message: "Failed to join note" });
      }
    });

    // Autosave - with collaboration support
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

        // Check access - allow owners and editors only
        const { note, accessLevel } = await checkNoteAccess(noteId, userId);

        if (!note) {
          socket.emit("note:autosave-error", { message: "Note not found" });
          return;
        }

        if (accessLevel === "readonly") {
          socket.emit("note:autosave-error", { 
            message: "You have read-only access to this note" 
          });
          return;
        }

        // DATABASE EFFICIENT: Only update fields that were sent
        const updateFields: any = {};

        if (updates.title !== undefined) updateFields.title = updates.title;
        if (updates.content !== undefined) updateFields.content = updates.content;
        if (updates.category !== undefined) updateFields.category = updates.category;
        if (updates.tags !== undefined) updateFields.tags = updates.tags;

        // Only run update if there are fields to update
        if (Object.keys(updateFields).length > 0) {
          // Get change types for edit history
          const changeTypes = getChangeTypes(updates);

          // Update note and add to edit history (only track for non-owners)
          const updateOperation: any = { $set: updateFields };
          
          // Add edit history entry (limit to last 50 entries)
          // Track for everyone including owner
          updateOperation.$push = {
            editHistory: {
              $each: changeTypes.map((changeType) => ({
                userId: new Types.ObjectId(userId),
                editedAt: new Date(),
                changeType,
              })),
              $slice: -50, // Keep only last 50 entries
            },
          };

          await NoteModel.updateOne({ _id: noteId }, updateOperation);

          logger.info({
            msg: "Autosave successful",
            noteId,
            userId,
            accessLevel,
            fields: Object.keys(updateFields),
          });

          const timestamp = new Date().toISOString();

          // Emit success to the sender
          socket.emit("note:autosave-success", {
            noteId,
            timestamp,
          });

          // Broadcast changes to other users in the room
          socket.to(`note:${noteId}`).emit("note:content-updated", {
            noteId,
            updates: updateFields,
            updatedBy: userId,
            timestamp,
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
        const { noteId, ...updates } = payload;

        if (Object.keys(updates).length > 0) {
          const validation = updateNoteSchema.safeParse(updates);

          if (validation.success) {
            const { note, accessLevel } = await checkNoteAccess(noteId, userId);

            // Only save if user has edit access
            if (note && accessLevel && accessLevel !== "readonly") {
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
                  { $set: updateFields }
                );
              }
            }
          }
        }

        // Notify others that user left
        const room = io.sockets.adapter.rooms.get(`note:${noteId}`);
        const collaboratorCount = room ? room.size - 1 : 0;
        
        socket.to(`note:${noteId}`).emit("note:user-left", {
          userId,
          collaboratorCount,
        });

        socket.leave(`note:${noteId}`);
        
        // Clean up socket data
        if (socket.data.noteAccess) {
          delete socket.data.noteAccess[noteId];
        }
        
        logger.info({ msg: "User left note room", noteId, userId });
      } catch (error) {
        logger.error({ msg: "Error leaving note room", error });
      }
    });
  });
};
