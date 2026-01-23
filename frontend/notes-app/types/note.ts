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
  isTrash?: boolean;
  isDeleted?: boolean;
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
