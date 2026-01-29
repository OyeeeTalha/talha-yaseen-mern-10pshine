import { Router } from "express";
import { protect } from "../../shared/middlewares/auth.js";
import {
  createNote,
  updateNote,
  deleteNote,
  trashNote,
  restoreNote,
  permanentDeleteNote,
  getAllNotes,
  getNoteById,
  getNotesByCategory,
  pinNote,
  unpinNote,
  favoriteNote,
  unfavoriteNote,
  createCategory,
  getCategories,
  deleteCategory,
  assignNoteCategory,
} from "./controller.js";
import {
  generateShareLink,
  getSharedNote,
  disableSharing,
  getCollaborators,
} from "../shared-notes/controller.js";

const router = Router();

// Public route for shared notes
router.get("/shared/:shareId", getSharedNote);

router.use(protect);

router.post("/create-note", createNote);
router.patch("/update-note/:id", updateNote);
router.delete("/delete-note/:id", deleteNote);

router.patch("/trash-note/:id", trashNote);
router.patch("/restore-note/:id", restoreNote);
router.delete("/permanent-delete/:id", permanentDeleteNote);

router.get("/get-notes", getAllNotes);
router.get("/get-note/:id", getNoteById);

router.get("/get-notes-by-category/:category", getNotesByCategory);

router.patch("/pin-note/:id", pinNote);
router.patch("/unpin-note/:id", unpinNote);

router.patch("/favorite-note/:id", favoriteNote);
router.patch("/unfavorite-note/:id", unfavoriteNote);

// router.get("/pinned-notes", (req: Request, res: Response) => {
//   // Logic to get all pinned notes
//   res.status(200).json({ notes: [] });
// }

router.post("/create-category", createCategory);
router.get("/get-categories", getCategories);
router.delete("/delete-category/:id", deleteCategory);

router.patch("/assign-note-category/:noteId", assignNoteCategory);

// Share Routes
router.post("/share/:noteId", generateShareLink);
router.delete("/share/:noteId", disableSharing);
router.get("/share/:noteId/collaborators", getCollaborators);

export default router;
