export interface Category {
  _id?: string;
  id: number;
  name: string;
  isDeleted?: boolean;
}

export interface Note {
  _id?: string;
  userId?: string;
  title: string;
  content?: string;
  category?: number | null; // Category ID
  categoryName?: string; // Category name populated from backend
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
