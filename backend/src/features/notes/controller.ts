import { Request, Response } from "express";
import { catchAsync } from "../../shared/utils/catchAsync.js";
import { AppError } from "../../shared/errors/AppError.js";
import { NoteModel } from "../../models/Notes.js";
import { UserModel } from "../../models/User.js";
import { Types } from "mongoose";
import {
  createNoteSchema,
  updateNoteSchema,
  createCategorySchema,
} from "./schema.js";
import { TRASH_PERIOD_SECONDS } from "../../config/trash.config.js";

// Helper function to convert category IDs to names and indices in notes
const populateCategoryNames = async (notes: any[], userId: string) => {
  const user = await UserModel.findById(userId);
  if (!user) return notes;

  // Create map of category ID to {name, index}
  const categoryMap = new Map(
    user.catagories.map((c, index) => [
      c.id.toString(),
      { name: c.name, index },
    ]),
  );

  return notes.map((note) => {
    const noteObj = note.toObject();
    const categoryId = noteObj.category?.toString();
    const categoryInfo = categoryId ? categoryMap.get(categoryId) : null;

    return {
      ...noteObj,
      category: categoryId || null, // Keep as ObjectId string or null
      categoryName: categoryInfo?.name || "Void",
      categoryIndex: categoryInfo?.index ?? null, // For color generation
    };
  });
};

// Helper function to capitalize first letter of each word
const capitalizeFirstLetter = (str: string): string => {
  return str
    .trim()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
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

export const trashNote = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = res.locals.session?.user?.id;

  if (!userId) {
    throw new AppError("You must be logged in to trash a note", 401);
  }

  const trashedAt = Math.floor(Date.now() / 1000); // Current time in Unix seconds

  const trashedNote = await NoteModel.findOneAndUpdate(
    { _id: id, userId: userId },
    {
      isTrash: true,
      trashedAt: trashedAt,
      isPinned: false, // Unpin when trashing
      isFavorite: false, // Remove from favorites when trashing
    },
    { new: true },
  );

  if (!trashedNote) {
    throw new AppError("Note not found", 404);
  }

  res.status(200).json({
    status: "success",
    message: "Note moved to trash",
    data: { note: trashedNote },
  });
});

export const restoreNote = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = res.locals.session?.user?.id;

  if (!userId) {
    throw new AppError("You must be logged in to restore a note", 401);
  }

  const restoredNote = await NoteModel.findOneAndUpdate(
    { _id: id, userId: userId },
    {
      isTrash: false,
      trashedAt: null,
    },
    { new: true },
  );

  if (!restoredNote) {
    throw new AppError("Note not found", 404);
  }

  res.status(200).json({
    status: "success",
    message: "Note restored successfully",
    data: { note: restoredNote },
  });
});

export const permanentDeleteNote = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = res.locals.session?.user?.id;

    if (!userId) {
      throw new AppError("You must be logged in to delete a note", 401);
    }

    // Soft delete: mark as deleted instead of removing from database
    const deletedNote = await NoteModel.findOneAndUpdate(
      { _id: id, userId: userId },
      { isDeleted: true },
      { new: true },
    );

    if (!deletedNote) {
      throw new AppError("Note not found", 404);
    }

    res.status(200).json({
      status: "success",
      message: "Note permanently deleted",
      data: { note: deletedNote },
    });
  },
);

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

    // Validate category ObjectId if provided
    const categoryObjectId = category
      ? Types.ObjectId.isValid(category)
        ? new Types.ObjectId(category)
        : null
      : null;

    const notes = await NoteModel.find({
      userId: userId,
      category: categoryObjectId,
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

export const favoriteNote = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = res.locals.session?.user?.id;

  if (!userId) {
    throw new AppError("You must be logged in to update a note", 401);
  }

  const note = await NoteModel.findOneAndUpdate(
    { _id: id, userId: userId },
    { isFavorite: true },
    { new: true },
  );

  if (!note) {
    throw new AppError("Note not found", 404);
  }

  res.status(200).json({
    status: "success",
    message: "Note added to favorites successfully",
    data: { note },
  });
});

export const unfavoriteNote = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = res.locals.session?.user?.id;

    if (!userId) {
      throw new AppError("You must be logged in to update a note", 401);
    }

    const note = await NoteModel.findOneAndUpdate(
      { _id: id, userId: userId },
      { isFavorite: false },
      { new: true },
    );

    if (!note) {
      throw new AppError("Note not found", 404);
    }

    res.status(200).json({
      status: "success",
      message: "Note removed from favorites successfully",
      data: { note },
    });
  },
);

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

    // Capitalize first letter of category name
    const categoryName = capitalizeFirstLetter(validation.data.name);

    // Get user to find the next available category ID
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Check if category with the same name already exists (case-insensitive)
    const categoryExists = user.catagories.find(
      (cat) => cat.name.toLowerCase() === categoryName.toLowerCase(),
    );
    if (categoryExists) {
      throw new AppError(
        `Category "${categoryName}" already exists. Please use a different name.`,
        400,
      );
    }

    // Create new category with ObjectId
    const newCategory = {
      id: new Types.ObjectId(),
      name: categoryName,
    };

    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: userId },
      { $push: { catagories: newCategory } },
      { new: true },
    );

    if (!updatedUser) {
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

  // Map categories to include their array index for color generation
  const categories =
    user?.catagories?.map((cat, index) => ({
      id: cat.id.toString(),
      name: cat.name,
      index, // Add index for consistent color generation
    })) || [];

  res.status(200).json({
    status: "success",
    results: categories.length,
    data: { categories },
  });
});

export const deleteCategory = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params; // ObjectId as string

    const userId = res.locals.session?.user?.id;

    if (!userId) {
      throw new AppError("You must be logged in to delete a category", 401);
    }

    // Validate ObjectId format
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError("Invalid category ID", 400);
    }

    // Find user to get the category before deleting
    const user = await UserModel.findOne({ _id: userId });
    if (!user) throw new AppError("User not found", 404);

    const category = user.catagories.find((c) => c.id.toString() === id);
    if (!category) throw new AppError("Category not found", 404);

    // Prevent deletion of "Void" category (by name, case-insensitive)
    if (category.name.toLowerCase() === "void") {
      throw new AppError("Cannot delete the Void category", 400);
    }

    // Hard delete category from User model (remove from array)
    await UserModel.updateOne(
      { _id: userId },
      { $pull: { catagories: { id: new Types.ObjectId(id) } } },
    );

    // Move all notes from this category to Void (null)
    await NoteModel.updateMany(
      { category: new Types.ObjectId(id), userId: userId },
      { $set: { category: null } },
    );

    res.status(200).json({
      status: "success",
      message: "Category deleted successfully. All notes moved to Void.",
    });
  },
);

export const assignNoteCategory = catchAsync(
  async (req: Request, res: Response) => {
    const { noteId } = req.params;
    const { category } = req.body; // Expecting category ID (ObjectId string) or null
    const userId = res.locals.session?.user?.id;

    if (!userId) {
      throw new AppError("You must be logged in to update a note", 401);
    }

    if (category !== null && category !== undefined) {
      // Validate ObjectId format
      if (!Types.ObjectId.isValid(category)) {
        throw new AppError("Invalid category ID", 400);
      }

      // Validate category ownership and existence
      const user = await UserModel.findById(userId);
      const categoryExists = user?.catagories.find(
        (c) => c.id.toString() === category,
      );

      if (!categoryExists) {
        throw new AppError("Category not found", 404);
      }
    }

    const note = await NoteModel.findOneAndUpdate(
      { _id: noteId, userId: userId },
      { category: category ? new Types.ObjectId(category) : null },
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
