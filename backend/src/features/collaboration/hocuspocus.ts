import { Hocuspocus, onAuthenticatePayload, onLoadDocumentPayload, onStoreDocumentPayload } from "@hocuspocus/server";
import { IncomingMessage } from "http";
import { parse as parseCookie } from "cookie";
import { getSession } from "@auth/express";
import { authConfig } from "../auth/config.js";
import { NoteModel } from "../../models/Notes.js";
import { SharedNoteModel } from "../../models/SharedNote.js";
import { Doc, applyUpdate, encodeStateAsUpdate } from "yjs";
import logger from "../../shared/utils/logger.js";

async function authenticateRequest(request: IncomingMessage): Promise<{ userId: string; userName: string } | null> {
  try {
    const cookies = request.headers.cookie ? parseCookie(request.headers.cookie) : {};

    const expressReq = Object.assign(request, {
      protocol: (request.headers["x-forwarded-proto"] as string) || "http",
      get: (name: string) => request.headers[name.toLowerCase()],
      cookies,
    }) as any;

    const session = await getSession(expressReq, authConfig);

    if (!session?.user?.id) {
      logger.warn({ msg: "[authenticateRequest] No session or user ID found" });
      return null;
    }

    const result = {
      userId: session.user.id,
      userName: (session.user as any).displayName || session.user.name || "Anonymous",
    };
    
    logger.info({ msg: "[authenticateRequest] Session found", userId: result.userId, userName: result.userName });
    return result;
  } catch (error) {
    logger.error({ msg: "Hocuspocus auth error", error });
    return null;
  }
}

async function checkNoteAccess(noteId: string, userId: string): Promise<"owner" | "edit" | "readonly" | null> {
  try {
    logger.info({ msg: "[checkNoteAccess] Checking access", noteId, userId });
    
    const note = await NoteModel.findOne({ _id: noteId, isDeleted: { $ne: true } });
    if (!note) {
      logger.warn({ msg: "[checkNoteAccess] Note not found", noteId });
      return null;
    }

    if (note.userId.toString() === userId) {
      logger.info({ msg: "[checkNoteAccess] User is owner", noteId, userId });
      return "owner";
    }

    const sharedNote = await SharedNoteModel.findOne({ noteId });
    if (sharedNote) {
      const collaborator = sharedNote.collaborators.find(
        (c) => c.userId.toString() === userId,
      );
      if (collaborator) {
        logger.info({ msg: "[checkNoteAccess] User is collaborator", noteId, userId, accessLevel: collaborator.accessLevel });
        return collaborator.accessLevel as "edit" | "readonly";
      }
      if (sharedNote.generalAccessLevel) {
        logger.info({ msg: "[checkNoteAccess] User has general access", noteId, userId, accessLevel: sharedNote.generalAccessLevel });
        return sharedNote.generalAccessLevel as "edit" | "readonly";
      }
    }

    logger.warn({ msg: "[checkNoteAccess] No access found", noteId, userId, noteOwnerId: note.userId.toString() });
    return null;
  } catch (error) {
    logger.error({ msg: "Error checking note access for collaboration", error, noteId, userId });
    return null;
  }
}

export const createHocuspocusServer = () => {
  return new Hocuspocus({
    debounce: 5000,
    maxDebounce: 30000,
    quiet: true,

    async onAuthenticate(data: onAuthenticatePayload) {
      const { documentName } = data;

      const authResult = await authenticateRequest(data.request);
      if (!authResult) {
        logger.warn({ msg: "[onAuthenticate] Authentication failed - no session", documentName });
        throw new Error("Authentication required");
      }

      const noteId = documentName;
      const accessLevel = await checkNoteAccess(noteId, authResult.userId);

      if (!accessLevel) {
        logger.warn({ 
          msg: "[onAuthenticate] Access denied - no permission", 
          userId: authResult.userId,
          noteId,
        });
        throw new Error("Access denied");
      }

      if (accessLevel === "readonly") {
        data.connectionConfig.readOnly = true;
      }

      logger.info({
        msg: "Hocuspocus authenticated",
        userId: authResult.userId,
        noteId,
        accessLevel,
      });

      return {
        userId: authResult.userId,
        userName: authResult.userName,
        accessLevel,
      };
    },

    async onLoadDocument(data: onLoadDocumentPayload) {
      const noteId = data.documentName;

      try {
        const note = await NoteModel.findById(noteId).select("yjsState").lean();

        if (note?.yjsState) {
          const update = new Uint8Array(note.yjsState as any);
          applyUpdate(data.document, update);
          logger.info({ msg: "Loaded Yjs state from DB", noteId, stateSize: update.length });
        } else {
          logger.info({ msg: "No stored Yjs state, client will initialize", noteId });
        }
      } catch (error) {
        logger.error({ msg: "Error loading Yjs document", error, noteId });
      }

      return data.document;
    },

    async onStoreDocument(data: onStoreDocumentPayload) {
      const noteId = data.documentName;

      try {
        const state = encodeStateAsUpdate(data.document);

        await NoteModel.updateOne(
          { _id: noteId },
          { $set: { yjsState: Buffer.from(state) } },
        );

        logger.info({ msg: "Stored Yjs state to DB", noteId, stateSize: state.length });
      } catch (error) {
        logger.error({ msg: "Error storing Yjs document", error, noteId });
      }
    },
  });
};
