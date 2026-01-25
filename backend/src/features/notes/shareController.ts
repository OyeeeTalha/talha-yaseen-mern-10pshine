import { Request, Response } from "express";
import { catchAsync } from "../../shared/utils/catchAsync.js";
import { AppError } from "../../shared/errors/AppError.js";
import { NoteModel } from "../../models/Notes.js";
import { UserModel } from "../../models/User.js";
import { generateShareLinkSchema } from "./shareSchema.js";
import { randomBytes } from "crypto";

// Generate a unique share ID
const generateShareId = (): string => {
  return randomBytes(8).toString("base64url");
};

// Generate or update share link for a note
export const generateShareLink = catchAsync(
  async (req: Request, res: Response) => {
    const { noteId } = req.params;
    const userId = res.locals.session?.user?.id;

    if (!userId) {
      throw new AppError("You must be logged in to share a note", 401);
    }

    const validation = generateShareLinkSchema.safeParse(req.body);

    if (!validation.success) {
      const errorMessage = validation.error.issues
        .map((e) => e.message)
        .join(", ");
      throw new AppError(errorMessage, 400);
    }

    const { accessLevel } = validation.data;

    // Find the note and verify ownership
    const note = await NoteModel.findOne({ _id: noteId, userId });

    if (!note) {
      throw new AppError(
        "Note not found or you do not have permission to share it",
        404
      );
    }

    // Generate new share ID if one doesn't exist
    const shareId = note.shareId || generateShareId();

    // Update the note with sharing info
    // Update the note with sharing info and propagate access level to all collaborators
    const updatedNote = await NoteModel.findByIdAndUpdate(
      noteId,
      {
        $set: {
          shareId,
          shareAccessLevel: accessLevel,
          "sharedWith.$[].accessLevel": accessLevel,
        },
      },
      { new: true }
    );

    res.status(200).json({
      status: "success",
      data: {
        shareId: updatedNote?.shareId,
        accessLevel: updatedNote?.shareAccessLevel,
        shareUrl: `/s/${updatedNote?.shareId}`,
      },
    });
  }
);

// Get a shared note by share ID
export const getSharedNote = catchAsync(async (req: Request, res: Response) => {
  const { shareId } = req.params;
  const userId = res.locals.session?.user?.id;

  if (!userId) {
    throw new AppError("You must be logged in to view shared notes", 401);
  }

  // Find the note by share ID
  const note = await NoteModel.findOne({ shareId, isDeleted: false });

  if (!note) {
    throw new AppError("Shared note not found or link has expired", 404);
  }

  // Determine user's access level
  let accessLevel: "readonly" | "edit" | "owner" = "readonly";

  if (note.userId.toString() === userId) {
    accessLevel = "owner";
  } else {
    // Check if user is in sharedWith list
    const sharedEntry = note.sharedWith?.find(
      (s) => s.userId?.toString() === userId
    );

    if (sharedEntry) {
      accessLevel = sharedEntry.accessLevel as "readonly" | "edit";
    } else {
      // Use the note's default share access level
      accessLevel = (note.shareAccessLevel as "readonly" | "edit") || "readonly";

      // Add user to sharedWith list (first-time access)
      await NoteModel.findByIdAndUpdate(note._id, {
        $push: {
          sharedWith: {
            userId,
            accessLevel: note.shareAccessLevel || "readonly",
            addedAt: new Date(),
          },
        },
      });
    }
  }

  // Get owner info for display
  const owner = await UserModel.findById(note.userId).select(
    "name email avatar avatarBgColor"
  );

  res.status(200).json({
    status: "success",
    data: {
      note: {
        _id: note._id,
        title: note.title,
        content: note.content,
        category: note.category,
        tags: note.tags,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
      },
      accessLevel,
      owner: owner
        ? {
            name: owner.name,
            avatar: owner.avatar,
            avatarBgColor: owner.avatarBgColor,
          }
        : null,
    },
  });
});

// Disable sharing for a note
export const disableSharing = catchAsync(
  async (req: Request, res: Response) => {
    const { noteId } = req.params;
    const userId = res.locals.session?.user?.id;

    if (!userId) {
      throw new AppError("You must be logged in to manage sharing", 401);
    }

    // Find and update the note
    const note = await NoteModel.findOneAndUpdate(
      { _id: noteId, userId },
      {
        $unset: { shareId: 1 },
        shareAccessLevel: null,
        sharedWith: [],
      },
      { new: true }
    );

    if (!note) {
      throw new AppError(
        "Note not found or you do not have permission to manage it",
        404
      );
    }

    res.status(200).json({
      status: "success",
      message: "Sharing disabled successfully",
    });
  }
);

// Get collaborators for a note
export const getCollaborators = catchAsync(
  async (req: Request, res: Response) => {
    const { noteId } = req.params;
    const userId = res.locals.session?.user?.id;

    if (!userId) {
      throw new AppError("You must be logged in to view collaborators", 401);
    }

    // Find the note and verify ownership
    const note = await NoteModel.findOne({ _id: noteId, userId });

    if (!note) {
      throw new AppError(
        "Note not found or you do not have permission to view it",
        404
      );
    }

    // Get user details for each collaborator
    const collaboratorIds = note.sharedWith?.map((s) => s.userId) || [];
    const users = await UserModel.find({ _id: { $in: collaboratorIds } }).select(
      "name email avatar avatarBgColor"
    );

    const collaborators = note.sharedWith?.map((shared) => {
      const user = users.find(
        (u) => u._id.toString() === shared.userId?.toString()
      );
      return {
        userId: shared.userId,
        accessLevel: shared.accessLevel,
        addedAt: shared.addedAt,
        user: user
          ? {
              name: user.name,
              email: user.email,
              avatar: user.avatar,
              avatarBgColor: user.avatarBgColor,
            }
          : null,
      };
    });

    res.status(200).json({
      status: "success",
      data: {
        shareId: note.shareId,
        accessLevel: note.shareAccessLevel,
        collaborators: collaborators || [],
      },
    });
  }
);

// Get edit history for a note
export const getEditHistory = catchAsync(
  async (req: Request, res: Response) => {
    const { noteId } = req.params;
    const userId = res.locals.session?.user?.id;

    if (!userId) {
      throw new AppError("You must be logged in to view edit history", 401);
    }

    // Find the note - allow owner or collaborators with access
    const note = await NoteModel.findById(noteId);

    if (!note) {
      throw new AppError("Note not found", 404);
    }

    // Check access
    const isOwner = note.userId.toString() === userId;
    const hasAccess = note.sharedWith?.some(
      (s) => s.userId?.toString() === userId
    );

    if (!isOwner && !hasAccess) {
      throw new AppError("You do not have permission to view this note", 403);
    }

    // Get user details for edit history
    const editorIds = note.editHistory?.map((e) => e.userId) || [];
    const users = await UserModel.find({ _id: { $in: editorIds } }).select(
      "name avatar avatarBgColor"
    );

    const history = note.editHistory?.map((edit) => {
      const user = users.find(
        (u) => u._id.toString() === edit.userId?.toString()
      );
      return {
        editedAt: edit.editedAt,
        changeType: edit.changeType,
        user: user
          ? {
              name: user.name,
              avatar: user.avatar,
              avatarBgColor: user.avatarBgColor,
            }
          : null,
      };
    });

    res.status(200).json({
      status: "success",
      data: {
        editHistory: history || [],
      },
    });
  }
);
