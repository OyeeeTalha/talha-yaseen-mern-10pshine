import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useNoteStore } from "../store/noteStore";
import * as noteService from "../services/noteServices";
import type { Note } from "../../types/note";

// Query Keys
export const noteKeys = {
  all: ["notes"] as const,
  lists: () => [...noteKeys.all, "list"] as const,
  details: () => [...noteKeys.all, "detail"] as const,
  detail: (id: string) => [...noteKeys.details(), id] as const,
};

// Get All Notes
export function useGetAllNotes() {
  const setNotes = useNoteStore((state) => state.setNotes);
  const setLoading = useNoteStore((state) => state.setLoading);
  const setError = useNoteStore((state) => state.setError);

  return useQuery({
    queryKey: noteKeys.lists(),
    queryFn: async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await noteService.getAllNotes();
        setNotes(response.data.notes);
        return response.data.notes;
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to fetch notes",
        );
        throw error;
      } finally {
        setLoading(false);
      }
    },
  });
}

// Get Note by ID
export function useGetNoteById(id: string) {
  const setSelectedNote = useNoteStore((state) => state.setSelectedNote);
  const setLoading = useNoteStore((state) => state.setLoading);
  const setError = useNoteStore((state) => state.setError);

  return useQuery({
    queryKey: noteKeys.detail(id),
    queryFn: async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await noteService.getNoteById(id);
        setSelectedNote(response.data.note);
        return response.data.note;
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to fetch note",
        );
        throw error;
      } finally {
        setLoading(false);
      }
    },
    enabled: !!id,
  });
}

// Create Note
export function useCreateNote() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const setError = useNoteStore((state) => state.setError);

  return useMutation({
    mutationFn: noteService.createNote,
    onMutate: async (noteData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: noteKeys.lists() });

      // Snapshot previous value
      const previousNotes = queryClient.getQueryData(noteKeys.lists());

      // Create temporary note with optimistic data
      const tempNote: Partial<Note> = {
        _id: `temp-${Date.now()}`, // Temporary ID
        title: noteData.title || "Untitled",
        content: noteData.content || "",
        tags: noteData.tags || [],
        isPinned: false,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Optimistically add note to list
      queryClient.setQueryData(noteKeys.lists(), (old: Note[] | undefined) => {
        if (!old) return [tempNote as Note];
        return [tempNote as Note, ...old];
      });

      return { previousNotes, tempNote };
    },
    onSuccess: (response, _, context) => {
      // Remove temp note and add real note
      queryClient.setQueryData(noteKeys.lists(), (old: Note[] | undefined) => {
        if (!old) return [response.data.note];
        return old.map((note) =>
          note._id === context?.tempNote._id ? response.data.note : note,
        );
      });
      navigate(`/editor/${response.data.note._id}`);
    },
    onError: (error: Error, _, context) => {
      // Rollback on error
      if (context?.previousNotes) {
        queryClient.setQueryData(noteKeys.lists(), context.previousNotes);
      }
      setError(error.message);
      alert(`Failed to create note: ${error.message}`);
    },
    onSettled: () => {
      // Refetch to ensure server state
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
    },
  });
}

// Update Note
export function useUpdateNote() {
  const queryClient = useQueryClient();
  const setError = useNoteStore((state) => state.setError);

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Note> }) =>
      noteService.updateNote(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: noteKeys.lists() });
      await queryClient.cancelQueries({ queryKey: noteKeys.detail(id) });

      // Snapshot previous values
      const previousNotes = queryClient.getQueryData(noteKeys.lists());
      const previousNote = queryClient.getQueryData(noteKeys.detail(id));

      // Optimistically update note in list
      queryClient.setQueryData(noteKeys.lists(), (old: Note[] | undefined) => {
        if (!old) return old;
        return old.map((note) =>
          note._id === id ? { ...note, ...data } : note,
        );
      });

      // Optimistically update individual note
      queryClient.setQueryData(noteKeys.detail(id), (old: Note | undefined) => {
        if (!old) return old;
        return { ...old, ...data };
      });

      return { previousNotes, previousNote, id };
    },
    onError: (error: Error, _, context) => {
      // Rollback on error
      if (context?.previousNotes) {
        queryClient.setQueryData(noteKeys.lists(), context.previousNotes);
      }
      if (context?.previousNote && context?.id) {
        queryClient.setQueryData(
          noteKeys.detail(context.id),
          context.previousNote,
        );
      }
      setError(error.message);
      // Show user-friendly error message
      alert(`Failed to update note: ${error.message}`);
    },
    onSettled: (_, __, variables) => {
      // Refetch to ensure server state
      queryClient.invalidateQueries({
        queryKey: noteKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
    },
  });
}

// Delete Note
export function useDeleteNote() {
  const queryClient = useQueryClient();
  const setError = useNoteStore((state) => state.setError);

  return useMutation({
    mutationFn: noteService.deleteNote,
    onMutate: async (noteId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: noteKeys.lists() });

      // Snapshot previous value
      const previousNotes = queryClient.getQueryData(noteKeys.lists());

      // Optimistically remove note from UI
      queryClient.setQueryData(noteKeys.lists(), (old: Note[] | undefined) => {
        if (!old) return old;
        return old.filter((note) => note._id !== noteId);
      });

      return { previousNotes };
    },
    onError: (error: Error, _, context) => {
      // Rollback on error
      if (context?.previousNotes) {
        queryClient.setQueryData(noteKeys.lists(), context.previousNotes);
      }
      setError(error.message);
      // Show user-friendly error message
      alert(`Failed to delete note: ${error.message}`);
    },
    onSettled: () => {
      // Refetch to ensure server state
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
    },
  });
}

// Pin Note
export function usePinNote() {
  const queryClient = useQueryClient();
  const setError = useNoteStore((state) => state.setError);

  return useMutation({
    mutationFn: noteService.pinNote,
    onMutate: async (noteId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: noteKeys.lists() });

      // Snapshot previous value
      const previousNotes = queryClient.getQueryData(noteKeys.lists());

      // Optimistically update
      queryClient.setQueryData(noteKeys.lists(), (old: Note[] | undefined) => {
        if (!old) return old;
        return old.map((note) =>
          note._id === noteId ? { ...note, isPinned: true } : note,
        );
      });

      return { previousNotes };
    },
    onError: (error: Error, _, context) => {
      // Rollback on error
      if (context?.previousNotes) {
        queryClient.setQueryData(noteKeys.lists(), context.previousNotes);
      }
      setError(error.message);
      // Show user-friendly error message
      alert(`Failed to pin note: ${error.message}`);
    },
    onSettled: () => {
      // Refetch to ensure server state
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
    },
  });
}

// Unpin Note
export function useUnpinNote() {
  const queryClient = useQueryClient();
  const setError = useNoteStore((state) => state.setError);

  return useMutation({
    mutationFn: noteService.unpinNote,
    onMutate: async (noteId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: noteKeys.lists() });

      // Snapshot previous value
      const previousNotes = queryClient.getQueryData(noteKeys.lists());

      // Optimistically update
      queryClient.setQueryData(noteKeys.lists(), (old: Note[] | undefined) => {
        if (!old) return old;
        return old.map((note) =>
          note._id === noteId ? { ...note, isPinned: false } : note,
        );
      });

      return { previousNotes };
    },
    onError: (error: Error, _, context) => {
      // Rollback on error
      if (context?.previousNotes) {
        queryClient.setQueryData(noteKeys.lists(), context.previousNotes);
      }
      setError(error.message);
      // Show user-friendly error message
      alert(`Failed to unpin note: ${error.message}`);
    },
    onSettled: () => {
      // Refetch to ensure server state
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
    },
  });
}

// Assign Category to Note
// Assign Category to Note
export function useAssignNoteCategory() {
  const queryClient = useQueryClient();
  const setError = useNoteStore((state) => state.setError);

  return useMutation({
    mutationFn: ({
      noteId,
      categoryId,
    }: {
      noteId: string;
      categoryId: number | null;
    }) => noteService.assignNoteCategory(noteId, categoryId),
    onMutate: async ({ noteId, categoryId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: noteKeys.lists() });
      await queryClient.cancelQueries({ queryKey: noteKeys.detail(noteId) });

      // Snapshot previous values
      const previousNotes = queryClient.getQueryData(noteKeys.lists());
      const previousNote = queryClient.getQueryData(noteKeys.detail(noteId));

      // Optimistically update note in list
      queryClient.setQueryData(noteKeys.lists(), (old: Note[] | undefined) => {
        if (!old) return old;
        return old.map((note) =>
          note._id === noteId ? { ...note, category: categoryId } : note,
        );
      });

      // Optimistically update individual note
      queryClient.setQueryData(
        noteKeys.detail(noteId),
        (old: Note | undefined) => {
          if (!old) return old;
          return { ...old, category: categoryId };
        },
      );

      return { previousNotes, previousNote, noteId };
    },
    onError: (error: Error, _, context) => {
      // Rollback on error
      if (context?.previousNotes) {
        queryClient.setQueryData(noteKeys.lists(), context.previousNotes);
      }
      if (context?.previousNote && context?.noteId) {
        queryClient.setQueryData(
          noteKeys.detail(context.noteId),
          context.previousNote,
        );
      }
      setError(error.message);
      alert(`Failed to assign category: ${error.message}`);
    },
    onSettled: (_, __, variables) => {
      // Refetch to ensure server state
      queryClient.invalidateQueries({
        queryKey: noteKeys.detail(variables.noteId),
      });
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
    },
  });
}
