import { create } from "zustand";
import type { Note, Category } from "../../types/note";

interface NoteState {
  // Notes
  notes: Note[];
  selectedNote: Note | null;
  pinnedNotes: Note[];

  // Categories
  categories: Category[];
  selectedCategory: string | null;

  // UI State
  isLoading: boolean;
  error: string | null;

  // Actions
  setNotes: (notes: Note[]) => void;
  addNote: (note: Note) => void;
  updateNote: (id: string, note: Partial<Note>) => void;
  removeNote: (id: string) => void;
  setSelectedNote: (note: Note | null) => void;

  setCategories: (categories: Category[]) => void;
  addCategory: (category: Category) => void;
  removeCategory: (id: string) => void;
  setSelectedCategory: (category: string | null) => void;

  setPinnedNotes: (notes: Note[]) => void;
  togglePinNote: (id: string) => void;

  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;

  // Reset
  reset: () => void;
}

const initialState = {
  notes: [],
  selectedNote: null,
  pinnedNotes: [],
  categories: [],
  selectedCategory: null,
  isLoading: false,
  error: null,
};

export const useNoteStore = create<NoteState>((set) => ({
  ...initialState,

  // Notes Actions
  setNotes: (notes) => set({ notes }),

  addNote: (note) =>
    set((state) => ({
      notes: [note, ...state.notes],
    })),

  updateNote: (id, updatedNote) =>
    set((state) => ({
      notes: state.notes.map((note) =>
        note._id === id ? { ...note, ...updatedNote } : note,
      ),
      selectedNote:
        state.selectedNote?._id === id
          ? { ...state.selectedNote, ...updatedNote }
          : state.selectedNote,
    })),

  removeNote: (id) =>
    set((state) => ({
      notes: state.notes.filter((note) => note._id !== id),
      selectedNote: state.selectedNote?._id === id ? null : state.selectedNote,
    })),

  setSelectedNote: (note) => set({ selectedNote: note }),

  // Categories Actions
  setCategories: (categories) => set({ categories }),

  addCategory: (category) =>
    set((state) => ({
      categories: [...state.categories, category],
    })),

  removeCategory: (id) =>
    set((state) => ({
      categories: state.categories.filter((cat) => cat._id !== id),
    })),

  setSelectedCategory: (category) => set({ selectedCategory: category }),

  // Pinned Notes Actions
  setPinnedNotes: (notes) => set({ pinnedNotes: notes }),

  togglePinNote: (id) =>
    set((state) => {
      const note = state.notes.find((n) => n._id === id);
      if (!note) return state;

      const isPinned = !note.isPinned;
      const updatedNotes = state.notes.map((n) =>
        n._id === id ? { ...n, isPinned } : n,
      );

      const pinnedNotes = updatedNotes.filter((n) => n.isPinned);

      return {
        notes: updatedNotes,
        pinnedNotes,
        selectedNote:
          state.selectedNote?._id === id
            ? { ...state.selectedNote, isPinned }
            : state.selectedNote,
      };
    }),

  // UI State Actions
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // Reset
  reset: () => set(initialState),
}));
