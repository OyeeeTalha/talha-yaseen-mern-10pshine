import { Router } from "express";
import { protect } from "../../shared/middlewares/auth.js";
import {
  createNote,
  updateNote,
  deleteNote,
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

const router = Router();

router.use(protect);

router.post("/create-note", createNote);
router.patch("/update-note/:id", updateNote);
router.delete("/delete-note/:id", deleteNote);

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

export default router;
