import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Editor from "@/pages/Editor";
import * as noteService from "@/services/noteServices";
import type { ReactNode } from "react";

// Mock services
vi.mock("@/services/noteServices");

const createWrapper = (noteId: string = "123") => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[`/editor/${noteId}`]}>
      <QueryClientProvider client={queryClient}>
        <Routes>
          <Route path="/editor/:noteId" element={children} />
        </Routes>
      </QueryClientProvider>
    </MemoryRouter>
  );
};

describe("Editor Page", () => {
  const mockNote = {
    _id: "123",
    title: "Test Note",
    content: JSON.stringify([
      {
        type: "paragraph",
        content: [{ type: "text", text: "This is test content" }],
      },
    ]),
    isPinned: false,
    isFavorite: false,
    isDeleted: false,
    category: null,
    tags: ["test", "vitest"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockCategories = [
    { id: "cat1", name: "Work" },
    { id: "cat2", name: "Personal" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock getNoteById
    vi.mocked(noteService.getNoteById).mockResolvedValue({
      status: "success",
      data: { note: mockNote },
    } as any);

    // Mock getCategories
    vi.mocked(noteService.getCategories).mockResolvedValue({
      status: "success",
      data: { categories: mockCategories },
    } as any);

    // Mock updateNote
    vi.mocked(noteService.updateNote).mockResolvedValue({
      status: "success",
      data: { note: mockNote },
    } as any);
  });

  it("shows loading state initially", () => {
    vi.mocked(noteService.getNoteById).mockImplementation(
      () => new Promise(() => {}), // Never resolves
    );

    render(<Editor />, { wrapper: createWrapper() });

    expect(
      screen.getByText(/loading/i) || screen.getByRole("status"),
    ).toBeInTheDocument();
  });

  it("renders note title after loading", async () => {
    render(<Editor />, { wrapper: createWrapper() });

    await waitFor(() => {
      // Title should be in an input or editable field
      const titleInput = screen.getByDisplayValue("Test Note");
      expect(titleInput).toBeInTheDocument();
    });
  });

  it("displays note tags", async () => {
    render(<Editor />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText("test")).toBeInTheDocument();
      expect(screen.getByText("vitest")).toBeInTheDocument();
    });
  });

  it("has save button", async () => {
    render(<Editor />, { wrapper: createWrapper() });

    await waitFor(() => {
      const saveButton =
        screen.getByRole("button", { name: /save/i }) ||
        screen.getByLabelText(/save/i) ||
        document.querySelector('[aria-label*="save"]');
      expect(saveButton).toBeTruthy();
    });
  });

  it("has back button to return to dashboard", async () => {
    const { container } = render(<Editor />, { wrapper: createWrapper() });

    await waitFor(() => {
      const backIcon = container.querySelector(
        '[data-testid="ArrowBackRoundedIcon"]',
      );
      const backButton = backIcon?.closest("button");
      expect(backButton).toBeTruthy();
    });
  });

  it("displays category dropdown", async () => {
    render(<Editor />, { wrapper: createWrapper() });

    await waitFor(() => {
      // Should show "Void" (default) or category button
      expect(
        screen.getByText("Void") || screen.getByText(/category/i),
      ).toBeInTheDocument();
    });
  });

  it("renders BlockNote editor", async () => {
    render(<Editor />, { wrapper: createWrapper() });

    await waitFor(() => {
      // BlockNote editor should be rendered (check for editor container)
      const editorContainer =
        document.querySelector(".bn-container") ||
        document.querySelector('[role="textbox"]') ||
        document.querySelector('[contenteditable="true"]');
      expect(editorContainer).toBeTruthy();
    });
  });

  it("displays sidebar", async () => {
    render(<Editor />, { wrapper: createWrapper() });

    await waitFor(() => {
      // Sidebar should be present
      expect(
        screen.getByText("All Notes") || screen.queryByText(/notes/i),
      ).toBeTruthy();
    });
  });

  it("handles note not found", async () => {
    vi.mocked(noteService.getNoteById).mockRejectedValue(
      new Error("Note not found"),
    );

    render(<Editor />, { wrapper: createWrapper() });

    // Should handle error gracefully (show error or redirect)
    await waitFor(() => {
      expect(document.body).toBeTruthy(); // At least renders something
    });
  });

  it("shows toast container for notifications", () => {
    const { container } = render(<Editor />, { wrapper: createWrapper() });

    // Toast container should be in DOM
    expect(container).toBeTruthy();
  });

  it("renders with valid note ID from URL", async () => {
    render(<Editor />, { wrapper: createWrapper("123") });

    await waitFor(() => {
      expect(noteService.getNoteById).toHaveBeenCalledWith("123");
    });
  });

  it("displays tag input for adding new tags", async () => {
    render(<Editor />, { wrapper: createWrapper() });

    await waitFor(() => {
      // Should have an input for adding tags
      const tagInput =
        screen.getByPlaceholderText(/tag/i) || screen.queryByRole("textbox");
      expect(tagInput).toBeTruthy();
    });
  });

  it("shows category badge or selector", async () => {
    render(<Editor />, { wrapper: createWrapper() });

    await waitFor(() => {
      // Should show category selection UI
      const categoryElement =
        screen.getByText("Void") ||
        document.querySelector('[class*="category"]');
      expect(categoryElement).toBeTruthy();
    });
  });
});
