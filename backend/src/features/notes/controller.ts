import { Request, Response } from "express";
import { catchAsync } from "../../shared/utils/catchAsync.js";
import { AppError } from "../../shared/errors/AppError.js";
import { NoteModel } from "../../models/Notes.js";
import { UserModel } from "../../models/User.js";
import {
  createNoteSchema,
  updateNoteSchema,
  createCategorySchema,
} from "./schema.js";

// Helper function to convert category IDs to names in notes
const populateCategoryNames = async (notes: any[], userId: string) => {
  const user = await UserModel.findById(userId);
  if (!user) return notes;

  const categoryMap = new Map(
    user.catagories.filter((c) => !c.isDeleted).map((c) => [c.id, c.name]),
  );

  return notes.map((note) => {
    const noteObj = note.toObject();
    return {
      ...noteObj,
      categoryName: noteObj.category
        ? categoryMap.get(noteObj.category) || "Uncategorized"
        : "Uncategorized",
    };
  });
};

export const createNote = catchAsync(async (req: Request, res: Response) => {
  const validation = createNoteSchema.safeParse(req.body);

  if (!validation.success) {
    const errorMessage = validation.error.issues
      .map((e) => e.message)
      .join(", ");
    throw new AppError(`Validation Error: ${errorMessage}`, 400);
  }
  const userId = res.locals.session?.user?.id;

  if (!userId) {
    throw new AppError("You must be logged in to create a note", 401);
  }

  const newNote = await NoteModel.create({
    ...validation.data,
    userId: userId,
  });

  res.status(201).json({
    status: "success",
    data: {
      note: newNote,
    },
  });
});

export const updateNote = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const validation = updateNoteSchema.safeParse(req.body);

  if (!validation.success) {
    const errorMessage = validation.error.issues
      .map((e) => e.message)
      .join(", ");
    throw new AppError(`Validation Error: ${errorMessage}`, 400);
  }

  const userId = res.locals.session?.user?.id;
  if (!userId) {
    throw new AppError("You must be logged in to update a note", 401);
  }

  const updatedNote = await NoteModel.findOneAndUpdate(
    { _id: id },
    { $set: validation.data },
    { new: true, runValidators: true },
  );

  if (!updatedNote) {
    throw new AppError(
      "Note not found or you do not have permission to edit it",
      404,
    );
  }

  res.status(200).json({
    status: "success",
    data: {
      note: updatedNote,
    },
  });
});

export const deleteNote = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = res.locals.session?.user?.id;

  if (!userId) {
    throw new AppError("You must be logged in to delete a note", 401);
  }

  const deletedNote = await NoteModel.findOneAndUpdate(
    {
      _id: id,
    },
    { isDeleted: true },
    { new: true },
  );

  if (!deletedNote) {
    throw new AppError(
      "Note not found or you do not have permission to delete it",
      404,
    );
  }

  res.status(200).json({
    status: "success",
    message: "Note moved to deleted successfully",
    data: {
      note: deletedNote,
    },
  });
});

export const getAllNotes = catchAsync(async (req: Request, res: Response) => {
  const userId = res.locals.session?.user?.id;
  if (!userId) {
    throw new AppError("You must be logged in to view notes", 401);
  }

  // Parse limit and page (skip) from query params, set default values
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  // Find notes for this user that are NOT soft-deleted
  const notes = await NoteModel.find({ userId: userId, isDeleted: false })
    .sort({ isPinned: -1, updatedAt: -1 }) // Pinned first, then newest
    .skip(skip)
    .limit(limit);

  // Populate category names
  const notesWithCategories = await populateCategoryNames(notes, userId);

  // Count total documents for pagination metadata
  const totalNotes = await NoteModel.countDocuments({
    userId: userId,
    isDeleted: false,
  });

  res.status(200).json({
    status: "success",
    results: notesWithCategories.length,
    total: totalNotes,
    page,
    totalPages: Math.ceil(totalNotes / limit),
    data: {
      notes: notesWithCategories,
    },
  });
});

export const getNoteById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = res.locals.session?.user?.id;

  if (!userId) {
    throw new AppError("You must be logged in to view this note", 401);
  }

  const note = await NoteModel.findOne({
    _id: id,
    userId: userId,
    isDeleted: false,
  });

  if (!note) {
    throw new AppError("Note not found", 404);
  }

  // Populate category name for single note
  const notesWithCategories = await populateCategoryNames([note], userId);

  res.status(200).json({
    status: "success",
    data: {
      note: notesWithCategories[0],
    },
  });
});

export const getNotesByCategory = catchAsync(
  async (req: Request, res: Response) => {
    const { category } = req.params;
    const userId = res.locals.session?.user?.id;

    if (!userId) {
      throw new AppError("You must be logged in to view notes", 401);
    }

    // Parse category as number since it's now stored as ID
    const categoryId = parseInt(category);

    const notes = await NoteModel.find({
      userId: userId,
      category: categoryId,
      isDeleted: false,
    }).sort({ isPinned: -1, updatedAt: -1 });

    // Populate category names
    const notesWithCategories = await populateCategoryNames(notes, userId);

    res.status(200).json({
      status: "success",
      results: notesWithCategories.length,
      data: {
        notes: notesWithCategories,
      },
    });
  },
);

export const pinNote = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = res.locals.session?.user?.id;

  if (!userId) {
    throw new AppError("You must be logged in to update a note", 401);
  }

  const note = await NoteModel.findOneAndUpdate(
    { _id: id, userId: userId },
    { isPinned: true },
    { new: true },
  );

  if (!note) {
    throw new AppError("Note not found", 404);
  }

  res.status(200).json({
    status: "success",
    message: "Note pinned successfully",
    data: { note },
  });
});

export const unpinNote = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = res.locals.session?.user?.id;

  if (!userId) {
    throw new AppError("You must be logged in to update a note", 401);
  }

  const note = await NoteModel.findOneAndUpdate(
    { _id: id, userId: userId },
    { isPinned: false },
    { new: true },
  );

  if (!note) {
    throw new AppError("Note not found", 404);
  }

  res.status(200).json({
    status: "success",
    message: "Note unpinned successfully",
    data: { note },
  });
});

export const createCategory = catchAsync(
  async (req: Request, res: Response) => {
    const validation = createCategorySchema.safeParse(req.body);

    if (!validation.success) {
      const errorMessage = validation.error.issues
        .map((e) => e.message)
        .join(", ");
      throw new AppError(`Validation Error: ${errorMessage}`, 400);
    }

    const userId = res.locals.session?.user?.id;
    if (!userId) {
      throw new AppError("You must be logged in to create a category", 401);
    }

    const newCategory = {
      id: Date.now(),
      name: validation.data.name,
      isDeleted: false,
    };

    const user = await UserModel.findOneAndUpdate(
      { _id: userId },
      { $push: { catagories: newCategory } },
      { new: true },
    );

    if (!user) {
      throw new AppError("User not found", 404);
    }

    res.status(201).json({
      status: "success",
      data: { category: newCategory },
    });
  },
);

export const getCategories = catchAsync(async (req: Request, res: Response) => {
  const userId = res.locals.session?.user?.id;
  if (!userId) {
    throw new AppError("You must be logged in to view categories", 401);
  }

  const user = await UserModel.findById(userId);
  const categories =
    user?.catagories
      ?.filter((c) => !c.isDeleted)
      .sort((a, b) => a.name.localeCompare(b.name)) || [];

  res.status(200).json({
    status: "success",
    results: categories.length,
    data: { categories },
  });
});

export const deleteCategory = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    // Parse ID as number since User model uses Number for category id
    const categoryId = parseInt(id);

    const userId = res.locals.session?.user?.id;

    if (!userId) {
      throw new AppError("You must be logged in to delete a category", 401);
    }

    // Find user to get the category before deleting (soft deleting)
    const user = await UserModel.findOne({ _id: userId });
    if (!user) throw new AppError("User not found", 404);

    const category = user.catagories.find((c) => c.id === categoryId);
    if (!category) throw new AppError("Category not found", 404);

    // Soft delete category in User model
    await UserModel.updateOne(
      { _id: userId, "catagories.id": categoryId },
      { $set: { "catagories.$.isDeleted": true } },
    );

    // Set category to null for all notes that had this category ID
    await NoteModel.updateMany(
      { category: categoryId, userId: userId },
      { category: null },
    );

    res.status(200).json({
      status: "success",
      message: "Category deleted successfully",
    });
  },
);

export const assignNoteCategory = catchAsync(
  async (req: Request, res: Response) => {
    const { noteId } = req.params;
    const { category } = req.body; // Expecting category ID (number) or null
    const userId = res.locals.session?.user?.id;

    if (!userId) {
      throw new AppError("You must be logged in to update a note", 401);
    }

    if (category !== null && category !== undefined) {
      // Validate category ownership and existence
      const user = await UserModel.findById(userId);
      const categoryExists = user?.catagories.find(
        (c) => c.id === category && !c.isDeleted,
      );

      if (!categoryExists) {
        throw new AppError("Category not found", 404);
      }
    }

    const note = await NoteModel.findOneAndUpdate(
      { _id: noteId, userId: userId },
      { category: category || null }, // Store category ID (number) or null
      { new: true },
    );

    if (!note) {
      throw new AppError("Note not found", 404);
    }

    res.status(200).json({
      status: "success",
      message: "Category assigned to note successfully",
      data: { note },
    });
  },
);
