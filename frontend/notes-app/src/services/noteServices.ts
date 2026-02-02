const VITE_API_URL = import.meta.env.VITE_API_URL;
import type {
  Note,
  NoteResponse,
  NotesResponse,
  CategoryResponse,
  CategoriesResponse,
} from "../../types/note";
import { logApiRequest, logApiResponse, logApiError } from "@/lib/logger";

// Helper to wrap fetch with logging
const fetchWithLogging = async (url: string, options: RequestInit) => {
  const method = options.method || "GET";

  logApiRequest(
    method,
    url,
    options.body ? JSON.parse(options.body as string) : undefined,
  );

  try {
    const response = await fetch(url, options);

    logApiResponse(method, url, response.status);

    if (!response.ok) {
      const error = new Error(
        `HTTP ${response.status}: ${response.statusText}`,
      );
      logApiError(method, url, error, response.status);
      throw error;
    }

    return response;
  } catch (error) {
    logApiError(method, url, error as Error);
    throw error;
  }
};

// ============= NOTE SERVICES =============

export const createNote = async (
  noteData: Partial<Note>,
): Promise<NoteResponse> => {
  const response = await fetchWithLogging(`${VITE_API_URL}/notes/create-note`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(noteData),
  });
  return await response.json();
};

export const updateNote = async (
  id: string,
  noteData: Partial<Note>,
): Promise<NoteResponse> => {
  const response = await fetchWithLogging(
    `${VITE_API_URL}/notes/update-note/${id}`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(noteData),
    },
  );
  return await response.json();
};

export const deleteNote = async (id: string): Promise<NoteResponse> => {
  const response = await fetchWithLogging(
    `${VITE_API_URL}/notes/delete-note/${id}`,
    {
      method: "DELETE",
      credentials: "include",
    },
  );
  return await response.json();
};

export const getAllNotes = async (): Promise<NotesResponse> => {
  const response = await fetchWithLogging(`${VITE_API_URL}/notes/get-notes`, {
    credentials: "include",
  });
  return await response.json();
};

export const getNoteById = async (id: string): Promise<NoteResponse> => {
  const response = await fetchWithLogging(
    `${VITE_API_URL}/notes/get-note/${id}`,
    {
      credentials: "include",
    },
  );
  return await response.json();
};

export const getNotesByCategory = async (
  category: string,
): Promise<NotesResponse> => {
  const response = await fetchWithLogging(
    `${VITE_API_URL}/notes/get-notes-by-category/${category}`,
    {
      credentials: "include",
    },
  );
  return await response.json();
};

export const pinNote = async (id: string): Promise<NoteResponse> => {
  const response = await fetchWithLogging(
    `${VITE_API_URL}/notes/pin-note/${id}`,
    {
      method: "PATCH",
      credentials: "include",
    },
  );
  return await response.json();
};

export const unpinNote = async (id: string): Promise<NoteResponse> => {
  const response = await fetchWithLogging(
    `${VITE_API_URL}/notes/unpin-note/${id}`,
    {
      method: "PATCH",
      credentials: "include",
    },
  );
  return await response.json();
};

export const favoriteNote = async (id: string): Promise<NoteResponse> => {
  const response = await fetchWithLogging(
    `${VITE_API_URL}/notes/favorite-note/${id}`,
    {
      method: "PATCH",
      credentials: "include",
    },
  );
  return await response.json();
};

export const unfavoriteNote = async (id: string): Promise<NoteResponse> => {
  const response = await fetchWithLogging(
    `${VITE_API_URL}/notes/unfavorite-note/${id}`,
    {
      method: "PATCH",
      credentials: "include",
    },
  );
  return await response.json();
};

export const trashNote = async (id: string): Promise<NoteResponse> => {
  const response = await fetchWithLogging(
    `${VITE_API_URL}/notes/trash-note/${id}`,
    {
      method: "PATCH",
      credentials: "include",
    },
  );
  return await response.json();
};

export const restoreNote = async (id: string): Promise<NoteResponse> => {
  const response = await fetchWithLogging(
    `${VITE_API_URL}/notes/restore-note/${id}`,
    {
      method: "PATCH",
      credentials: "include",
    },
  );
  return await response.json();
};

export const permanentDeleteNote = async (
  id: string,
): Promise<{ status: string; message: string }> => {
  const response = await fetchWithLogging(
    `${VITE_API_URL}/notes/permanent-delete/${id}`,
    {
      method: "DELETE",
      credentials: "include",
    },
  );
  return await response.json();
};

// ============= CATEGORY SERVICES =============

export const createCategory = async (categoryData: {
  name: string;
}): Promise<CategoryResponse> => {
  const response = await fetchWithLogging(
    `${VITE_API_URL}/notes/create-category`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(categoryData),
    },
  );
  return await response.json();
};

export const getCategories = async (): Promise<CategoriesResponse> => {
  const response = await fetchWithLogging(
    `${VITE_API_URL}/notes/get-categories`,
    {
      credentials: "include",
    },
  );
  return await response.json();
};

export const deleteCategory = async (id: string): Promise<CategoryResponse> => {
  const response = await fetchWithLogging(
    `${VITE_API_URL}/notes/delete-category/${id}`,
    {
      method: "DELETE",
      credentials: "include",
    },
  );
  return await response.json();
};

export const assignNoteCategory = async (
  noteId: string,
  categoryId: string | null,
): Promise<NoteResponse> => {
  const response = await fetchWithLogging(
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
  return await response.json();
};
