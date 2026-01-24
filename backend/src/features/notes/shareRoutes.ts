import { Router } from "express";
import { protect } from "../../shared/middlewares/auth.js";
import {
  generateShareLink,
  getSharedNote,
  disableSharing,
  getCollaborators,
  getEditHistory,
} from "./shareController.js";

const router = Router();

// All share routes require authentication
router.use(protect);

// Generate or update share link for a note
router.post("/share/:noteId", generateShareLink);

// Get a shared note by share ID
router.get("/shared/:shareId", getSharedNote);

// Disable sharing for a note
router.delete("/share/:noteId", disableSharing);

// Get collaborators for a note
router.get("/share/:noteId/collaborators", getCollaborators);

// Get edit history for a note
router.get("/share/:noteId/history", getEditHistory);

export default router;
