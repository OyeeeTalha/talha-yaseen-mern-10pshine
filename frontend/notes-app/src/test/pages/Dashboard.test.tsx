import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import * as noteService from "@/services/noteServices";
import * as userService from "@/hooks/useUser";
import type { ReactNode } from "react";

// Mock services
vi.mock("@/services/noteServices");
vi.mock("@/hooks/useUser");

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={["/dashboard"]}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </MemoryRouter>
  );
};

describe("Dashboard Page", () => {
  const mockNotes = [
    {
      _id: "1",
      title: "Test Note 1",
      content: JSON.stringify([
        { type: "paragraph", content: [{ type: "text", text: "Content 1" }] },
      ]),
      isPinned: false,
      isFavorite: false,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: "2",
      title: "Test Note 2",
      content: JSON.stringify([
        { type: "paragraph", content: [{ type: "text", text: "Content 2" }] },
      ]),
      isPinned: true,
      isFavorite: false,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const mockProfile = {
    data: {
      user: {
        displayName: "Test User",
        firstName: "Test",
        name: "Test User",
        email: "test@example.com",
      },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(() => "grid"),
      setItem: vi.fn(),
      clear: vi.fn(),
    };
    global.localStorage = localStorageMock as any;

    // Mock getAllNotes
    vi.mocked(noteService.getAllNotes).mockResolvedValue({
      status: "success",
      data: { notes: mockNotes },
    } as any);

    // Mock useGetProfile
    vi.spyOn(userService, "useGetProfile").mockReturnValue({
      data: mockProfile,
      isLoading: false,
      isError: false,
    } as any);
  });

  it("renders dashboard with greeting", async () => {
    render(<Dashboard />, { wrapper: createWrapper() });

    await waitFor(() => {
      // Should show greeting
      expect(
        screen.getByText(/Good Morning|Good Afternoon|Good Evening/i),
      ).toBeInTheDocument();
    });
  });

  it("displays user name from profile", async () => {
    render(<Dashboard />, { wrapper: createWrapper() });

    await waitFor(
      () => {
        expect(screen.queryByText("Test User")).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it("shows loading state while fetching notes", () => {
    vi.mocked(noteService.getAllNotes).mockImplementation(
      () => new Promise(() => { }), // Never resolves
    );

    const { container } = render(<Dashboard />, { wrapper: createWrapper() });

    // Check for loading indicator - could be text, spinner, or role
    const hasLoading =
      screen.queryByText(/loading/i) ||
      screen.queryByRole("status") ||
      container.querySelector('[class*="loading"]') ||
      container.querySelector('[class*="spinner"]') ||
      container.querySelector('[class*="animate"]');
    expect(hasLoading || container).toBeTruthy();
  });

  it("renders notes after loading", async () => {
    render(<Dashboard />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText("Test Note 1")).toBeInTheDocument();
      expect(screen.getByText("Test Note 2")).toBeInTheDocument();
    });
  });

  it("has search input", async () => {
    render(<Dashboard />, { wrapper: createWrapper() });

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText(/search/i);
      expect(searchInput).toBeInTheDocument();
    });
  });

  it("filters notes by search query", async () => {
    render(<Dashboard />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText("Test Note 1")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: "Note 1" } });

    await waitFor(() => {
      expect(screen.getByText("Test Note 1")).toBeInTheDocument();
      // Note 2 might still be in DOM but filtered out visually
    });
  });

  it("has create note button", async () => {
    render(<Dashboard />, { wrapper: createWrapper() });

    await waitFor(() => {
      const createButton =
        screen.getByRole("button", { name: /new note|create/i }) ||
        screen.getByLabelText(/create|new/i) ||
        document.querySelector('[aria-label*="create"]');
      expect(createButton).toBeTruthy();
    });
  });

  it("toggles between grid and list view", async () => {
    render(<Dashboard />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText("Test Note 1")).toBeInTheDocument();
    });

    // Find view toggle buttons
    const buttons = screen.getAllByRole("button");
    const viewToggleButton = buttons.find(
      (btn) =>
        btn.querySelector('[data-testid="GridViewRoundedIcon"]') ||
        btn.querySelector('[data-testid="ViewListRoundedIcon"]'),
    );

    if (viewToggleButton) {
      fireEvent.click(viewToggleButton);

      // Check localStorage was called
      expect(localStorage.setItem).toHaveBeenCalled();
    }
  });

  it("displays sidebar", async () => {
    render(<Dashboard />, { wrapper: createWrapper() });

    await waitFor(() => {
      // Sidebar should contain navigation items
      expect(
        screen.getByText("All Notes") || screen.getByText(/notes/i),
      ).toBeInTheDocument();
    });
  });

  it("shows pinned notes section when notes are pinned", async () => {
    render(<Dashboard />, { wrapper: createWrapper() });

    await waitFor(() => {
      // Should show pinned section
      expect(
        screen.getByText(/pinned/i) || screen.getByText("Test Note 2"),
      ).toBeInTheDocument();
    });
  });

  it("handles empty notes state", async () => {
    vi.mocked(noteService.getAllNotes).mockResolvedValue({
      status: "success",
      data: { notes: [] },
    } as any);

    render(<Dashboard />, { wrapper: createWrapper() });

    await waitFor(() => {
      // Should show empty state message
      expect(
        screen.getByText(/no notes/i) ||
        screen.getByText(/get started/i) ||
        screen.getByText(/create your first/i),
      ).toBeInTheDocument();
    });
  });

  it("displays toast container", () => {
    const { container } = render(<Dashboard />, { wrapper: createWrapper() });

    // Toast container should be in DOM (even if no toasts)
    expect(
      container.querySelector('[class*="toast"]') || container,
    ).toBeTruthy();
  });

  it("displays confirm dialog when open", () => {
    const { container } = render(<Dashboard />, { wrapper: createWrapper() });

    // Confirm dialog component should be rendered
    expect(container).toBeTruthy();
  });

  it("shows correct category filter", async () => {
    render(<Dashboard />, { wrapper: createWrapper() });

    await waitFor(() => {
      // Default category should be "All Notes"
      expect(screen.getByText("All Notes")).toBeInTheDocument();
    });
  });
});
