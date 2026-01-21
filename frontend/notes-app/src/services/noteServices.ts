const VITE_API_URL = import.meta.env.VITE_API_URL;
import type {
  Note,
  NoteResponse,
  NotesResponse,
  CategoryResponse,
  CategoriesResponse,
} from "../../types/note";

// ============= NOTE SERVICES =============

export const createNote = async (
  noteData: Partial<Note>,
): Promise<NoteResponse> => {
  const response = await fetch(`${VITE_API_URL}/notes/create-note`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(noteData),
  });
  if (!response.ok) throw new Error("Failed to create note");
  return await response.json();
};

export const updateNote = async (
  id: string,
  noteData: Partial<Note>,
): Promise<NoteResponse> => {
  const response = await fetch(`${VITE_API_URL}/notes/update-note/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(noteData),
  });
  if (!response.ok) throw new Error("Failed to update note");
  return await response.json();
};

export const deleteNote = async (id: string): Promise<NoteResponse> => {
  const response = await fetch(`${VITE_API_URL}/notes/delete-note/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to delete note");
  return await response.json();
};

export const getAllNotes = async (): Promise<NotesResponse> => {
  const response = await fetch(`${VITE_API_URL}/notes/get-notes`, {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to fetch notes");
  return await response.json();
};

export const getNoteById = async (id: string): Promise<NoteResponse> => {
  const response = await fetch(`${VITE_API_URL}/notes/get-note/${id}`, {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to fetch note");
  return await response.json();
};

export const getNotesByCategory = async (
  category: string,
): Promise<NotesResponse> => {
  const response = await fetch(
    `${VITE_API_URL}/notes/get-notes-by-category/${category}`,
    {
      credentials: "include",
    },
  );
  if (!response.ok) throw new Error("Failed to fetch notes by category");
  return await response.json();
};

export const pinNote = async (id: string): Promise<NoteResponse> => {
  const response = await fetch(`${VITE_API_URL}/notes/pin-note/${id}`, {
    method: "PATCH",
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to pin note");
  return await response.json();
};

export const unpinNote = async (id: string): Promise<NoteResponse> => {
  const response = await fetch(`${VITE_API_URL}/notes/unpin-note/${id}`, {
    method: "PATCH",
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to unpin note");
  return await response.json();
};

// ============= CATEGORY SERVICES =============

export const createCategory = async (categoryData: {
  name: string;
}): Promise<CategoryResponse> => {
  const response = await fetch(`${VITE_API_URL}/notes/create-category`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(categoryData),
  });
  if (!response.ok) throw new Error("Failed to create category");
  return await response.json();
};

export const getCategories = async (): Promise<CategoriesResponse> => {
  const response = await fetch(`${VITE_API_URL}/notes/get-categories`, {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to fetch categories");
  return await response.json();
};

export const deleteCategory = async (id: string): Promise<CategoryResponse> => {
  const response = await fetch(`${VITE_API_URL}/notes/delete-category/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to delete category");
  return await response.json();
};

export const assignNoteCategory = async (
  noteId: string,
  categoryId: number | null,
): Promise<NoteResponse> => {
  const response = await fetch(
    `${VITE_API_URL}/notes/assign-note-category/${noteId}`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ category: categoryId }),
    },
  );
  if (!response.ok) throw new Error("Failed to assign category");
  return await response.json();
};
