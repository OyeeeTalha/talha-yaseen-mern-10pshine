import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import {
  useGetAllNotes,
  useCreateNote,
  useUpdateNote,
  useDeleteNote,
  usePinNote,
  useUnpinNote,
  useFavoriteNote,
  useUnfavoriteNote,
  useTrashNote,
  useRestoreNote,
  usePermanentDeleteNote,
} from "@/hooks/useNotes";
import * as noteService from "@/services/noteServices";
import type { ReactNode } from "react";

// Mock the note service
vi.mock("@/services/noteServices");

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </BrowserRouter>
  );
};

describe("useNotes Hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("useGetAllNotes", () => {
    it("fetches all notes successfully", async () => {
      const mockNotes = [
        {
          _id: "1",
          title: "Note 1",
          content: "Content 1",
          isPinned: false,
          isDeleted: false,
          createdAt: "",
          updatedAt: "",
        },
        {
          _id: "2",
          title: "Note 2",
          content: "Content 2",
          isPinned: false,
          isDeleted: false,
          createdAt: "",
          updatedAt: "",
        },
      ];

      vi.mocked(noteService.getAllNotes).mockResolvedValue({
        status: "success",
        data: { notes: mockNotes },
      } as any);

      const { result } = renderHook(() => useGetAllNotes(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockNotes);
    });

    it("handles error when fetching notes fails", async () => {
      vi.mocked(noteService.getAllNotes).mockRejectedValue(
        new Error("Failed to fetch notes"),
      );

      const { result } = renderHook(() => useGetAllNotes(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toBeTruthy();
    });
  });

  describe("useCreateNote", () => {
    it("creates a new note successfully", async () => {
      const newNote = { title: "New Note", content: "New Content" };
      const createdNote = {
        _id: "3",
        ...newNote,
        isPinned: false,
        isDeleted: false,
        createdAt: "",
        updatedAt: "",
      };

      vi.mocked(noteService.createNote).mockResolvedValue({
        status: "success",
        data: { note: createdNote },
      } as any);

      const { result } = renderHook(() => useCreateNote(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(newNote);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(noteService.createNote).toHaveBeenCalled();
      expect(vi.mocked(noteService.createNote).mock.calls[0][0]).toEqual(
        newNote,
      );
    });
  });

  describe("useUpdateNote", () => {
    it("updates an existing note successfully", async () => {
      const noteId = "1";
      const updates = { title: "Updated Title" };
      const updatedNote = {
        _id: noteId,
        ...updates,
        content: "",
        isPinned: false,
        isDeleted: false,
        createdAt: "",
        updatedAt: "",
      };

      vi.mocked(noteService.updateNote).mockResolvedValue({
        status: "success",
        data: { note: updatedNote },
      } as any);

      const { result } = renderHook(() => useUpdateNote(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ id: noteId, data: updates });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(noteService.updateNote).toHaveBeenCalledWith(noteId, updates);
    });
  });

  describe("useDeleteNote", () => {
    it("deletes a note successfully", async () => {
      const noteId = "1";

      vi.mocked(noteService.deleteNote).mockResolvedValue({
        status: "success",
        data: {
          note: {
            _id: noteId,
            title: "",
            content: "",
            isPinned: false,
            isDeleted: true,
            createdAt: "",
            updatedAt: "",
          },
        },
      } as any);

      const { result } = renderHook(() => useDeleteNote(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(noteId);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(vi.mocked(noteService.deleteNote).mock.calls[0][0]).toBe(noteId);
    });
  });

  describe("usePinNote", () => {
    it("pins a note successfully", async () => {
      const noteId = "1";

      vi.mocked(noteService.pinNote).mockResolvedValue({
        status: "success",
        data: { note: { _id: noteId, isPinned: true } },
      } as any);

      const { result } = renderHook(() => usePinNote(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(noteId);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      // Check first argument only (TanStack Query passes additional context)
      expect(vi.mocked(noteService.pinNote).mock.calls[0][0]).toBe(noteId);
    });
  });

  describe("useUnpinNote", () => {
    it("unpins a note successfully", async () => {
      const noteId = "1";

      vi.mocked(noteService.unpinNote).mockResolvedValue({
        status: "success",
        data: { note: { _id: noteId, isPinned: false } },
      } as any);

      const { result } = renderHook(() => useUnpinNote(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(noteId);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(vi.mocked(noteService.unpinNote).mock.calls[0][0]).toBe(noteId);
    });
  });

  describe("useFavoriteNote", () => {
    it("favorites a note successfully", async () => {
      const noteId = "1";

      vi.mocked(noteService.favoriteNote).mockResolvedValue({
        status: "success",
        data: { note: { _id: noteId, isFavorite: true } },
      } as any);

      const { result } = renderHook(() => useFavoriteNote(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(noteId);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(vi.mocked(noteService.favoriteNote).mock.calls[0][0]).toBe(noteId);
    });
  });

  describe("useUnfavoriteNote", () => {
    it("unfavorites a note successfully", async () => {
      const noteId = "1";

      vi.mocked(noteService.unfavoriteNote).mockResolvedValue({
        status: "success",
        data: { note: { _id: noteId, isFavorite: false } },
      } as any);

      const { result } = renderHook(() => useUnfavoriteNote(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(noteId);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(vi.mocked(noteService.unfavoriteNote).mock.calls[0][0]).toBe(noteId);
    });
  });

  describe("useTrashNote", () => {
    it("trashes a note successfully", async () => {
      const noteId = "1";

      vi.mocked(noteService.trashNote).mockResolvedValue({
        status: "success",
        data: { note: { _id: noteId, isTrash: true } },
      } as any);

      const { result } = renderHook(() => useTrashNote(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(noteId);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(vi.mocked(noteService.trashNote).mock.calls[0][0]).toBe(noteId);
    });
  });

  describe("useRestoreNote", () => {
    it("restores a note from trash successfully", async () => {
      const noteId = "1";

      vi.mocked(noteService.restoreNote).mockResolvedValue({
        status: "success",
        data: { note: { _id: noteId, isTrash: false } },
      } as any);

      const { result } = renderHook(() => useRestoreNote(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(noteId);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(vi.mocked(noteService.restoreNote).mock.calls[0][0]).toBe(noteId);
    });
  });

  describe("usePermanentDeleteNote", () => {
    it("permanently deletes a note successfully", async () => {
      const noteId = "1";

      vi.mocked(noteService.permanentDeleteNote).mockResolvedValue({
        status: "success",
        message: "Note permanently deleted",
      } as any);

      const { result } = renderHook(() => usePermanentDeleteNote(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(noteId);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(vi.mocked(noteService.permanentDeleteNote).mock.calls[0][0]).toBe(noteId);
    });
  });
});
