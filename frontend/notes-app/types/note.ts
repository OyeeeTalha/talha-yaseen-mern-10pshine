export interface Category {
  _id?: string;
  id: string; // ObjectId as string
  name: string;
  index: number; // Array index for color generation
}

export interface Note {
  _id?: string;
  userId?: string;
  title: string;
  content?: string;
  category?: string | null; // Category ID (ObjectId as string)
  categoryName?: string; // Category name populated from backend
  categoryIndex?: number | null; // Category index for color generation
  tags?: string[];
  isPinned?: boolean;
  isFavorite?: boolean;
  isTrash?: boolean;
  trashedAt?: number | null; // Unix timestamp in seconds
  expireAt?: string | null; // ISO string expiration date
  isDeleted?: boolean;
  // Sharing fields
  shareId?: string; // Unique share identifier
  shareAccessLevel?: "readonly" | "edit" | null;
  shareUrl?: string;
  sharedWith?: Array<{
    userId: string;
    name?: string;
    email?: string;
    image?: string;
    avatarBgColor?: string;
    accessLevel: "readonly" | "edit";
  }>;
  // Editors (users who have edited the note)
  editors?: Array<{
    userId: string;
    name?: string;
    email?: string;
    image?: string;
    avatarBgColor?: string;
    lastEditedAt?: string | Date;
  }>;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// API Response Types
export interface NoteResponse {
  status: string;
  data: {
    note: Note;
  };
}

export interface NotesResponse {
  status: string;
  data: {
    notes: Note[];
  };
}

export interface CategoryResponse {
  status: string;
  data: {
    category: Category;
  };
}

export interface CategoriesResponse {
  status: string;
  data: {
    categories: Category[];
  };
}
