import { Request, Response } from "express";
import { catchAsync } from "../../shared/utils/catchAsync.js";
import { AppError } from "../../shared/errors/AppError.js";
import { NoteModel } from "../../models/Notes.js";
import { SharedNoteModel } from "../../models/SharedNote.js";
import { UserModel } from "../../models/User.js";
import { nanoid } from "nanoid";
import { generateShareLinkSchema } from "./schema.js";

export const generateShareLink = catchAsync(async (req: Request, res: Response) => {
  const { noteId } = req.params;
  const { accessLevel } = req.body;
  const userId = res.locals.session?.user?.id;

  if (!userId) {
    throw new AppError("You must be logged in to share a note", 401);
  }

  const validation = generateShareLinkSchema.safeParse(req.body);
  if (!validation.success) {
    throw new AppError("Invalid access level", 400);
  }

  // Check if note exists and user owns it
  const note = await NoteModel.findOne({ _id: noteId, userId });
  if (!note) {
    throw new AppError("Note not found or access denied", 404);
  }

  // Check if already shared
  let sharedNote = await SharedNoteModel.findOne({ noteId });
  
  if (sharedNote) {
    // Update existing share settings
    sharedNote.generalAccessLevel = accessLevel;
    await sharedNote.save();
  } else {
    // Create new share
    const shareId = nanoid(10); // Generate short unique ID
    sharedNote = await SharedNoteModel.create({
      noteId,
      shareId,
      ownerId: userId,
      generalAccessLevel: accessLevel,
      collaborators: [],
    });
  }

  res.status(200).json({
    status: "success",
    data: {
      shareId: sharedNote.shareId,
      accessLevel: sharedNote.generalAccessLevel,
      shareUrl: `${process.env.FRONTEND_URL}/s/${sharedNote.shareId}`,
    },
  });
});

export const getSharedNote = catchAsync(async (req: Request, res: Response) => {
  const { shareId } = req.params;
  const userId = res.locals.session?.user?.id;

  const sharedNote = await SharedNoteModel.findOne({ shareId })
    .populate("ownerId", "name avatar avatarBgColor")
    .populate("noteId");

  if (!sharedNote || !sharedNote.noteId) {
    throw new AppError("Shared note not found", 404);
  }

  // Determine access level
  let accessLevel = "readonly";
  
  if (userId) {
    if (sharedNote.ownerId._id.toString() === userId) {
      accessLevel = "owner";
    } else {
      // Check if explicit collaborator
      const collaborator = sharedNote.collaborators.find(
        c => c.userId.toString() === userId
      );
      if (collaborator) {
        accessLevel = collaborator.accessLevel;
      } else {
        // Fallback to general access level
        accessLevel = sharedNote.generalAccessLevel;
      }
    }
  } else {
    // Public access
    accessLevel = sharedNote.generalAccessLevel;
  }

  const note = sharedNote.noteId as any;

  res.status(200).json({
    status: "success",
    data: {
      note: {
        _id: note._id,
        title: note.title,
        content: note.content,
        updatedAt: note.updatedAt,
      },
      accessLevel,
      owner: sharedNote.ownerId,
    },
  });
});

export const disableSharing = catchAsync(async (req: Request, res: Response) => {
  const { noteId } = req.params;
  const userId = res.locals.session?.user?.id;

  if (!userId) {
    throw new AppError("You must be logged in to manage sharing", 401);
  }

  const sharedNote = await SharedNoteModel.findOne({ noteId });
  if (!sharedNote) {
    throw new AppError("Sharing is not enabled for this note", 404);
  }

  if (sharedNote.ownerId.toString() !== userId) {
    throw new AppError("Only the owner can disable sharing", 403);
  }

  await SharedNoteModel.deleteOne({ _id: sharedNote._id });

  res.status(200).json({
    status: "success",
    message: "Sharing disabled for this note",
  });
});

export const getCollaborators = catchAsync(async (req: Request, res: Response) => {
  const { noteId } = req.params;
  const userId = res.locals.session?.user?.id;

  if (!userId) {
    throw new AppError("You must be logged in", 401);
  }

  // Check valid sharing entry
  const sharedNote = await SharedNoteModel.findOne({ noteId })
    .populate("collaborators.userId", "name email avatar avatarBgColor");

  if (!sharedNote) {
    return res.status(200).json({
      status: "success",
      data: {
        shareId: null,
        accessLevel: null,
        collaborators: [],
      },
    });
  }

  // Map collaborators
  const collaborators = sharedNote.collaborators.map(c => ({
    userId: c.userId._id, // Extract ID from populated object
    accessLevel: c.accessLevel,
    addedAt: c.addedAt,
    user: c.userId, // Full user object
  }));

  res.status(200).json({
    status: "success",
    data: {
      shareId: sharedNote.shareId,
      accessLevel: sharedNote.generalAccessLevel,
      collaborators,
    },
  });
});
