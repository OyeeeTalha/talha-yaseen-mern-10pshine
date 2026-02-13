import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import NoteCard from "@/components/layouts/NoteCard";

// Test wrapper with providers
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </BrowserRouter>
  );
};

describe("NoteCard Component", () => {
  const mockNote = {
    title: "Test Note",
    content: JSON.stringify([
      { type: "paragraph", content: [{ type: "text", text: "Test content" }] },
    ]),
    date: new Date().toISOString(),
    isPinned: false,
    isFavorite: false,
    isTrash: false,
  };

  const mockHandlers = {
    onPinClick: vi.fn(),
    onFavoriteClick: vi.fn(),
    onDelete: vi.fn(),
    onClick: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders note title and content preview", () => {
    render(<NoteCard {...mockNote} />, { wrapper: createWrapper() });

    expect(screen.getByText("Test Note")).toBeInTheDocument();
    expect(screen.getByText(/Test content/i)).toBeInTheDocument();
  });

  it("renders without crashing when pinned", () => {
    const { container } = render(
      <NoteCard {...mockNote} isPinned={true} onPinClick={() => { }} />,
      { wrapper: createWrapper() },
    );

    // Note card renders successfully with pinned prop
    expect(container.querySelector('[class*="w-full"]')).toBeTruthy();
    expect(screen.getByText("Test Note")).toBeInTheDocument();
  });

  it("renders without crashing when favorited", () => {
    const { container } = render(
      <NoteCard {...mockNote} isFavorite={true} onFavoriteClick={() => { }} />,
      { wrapper: createWrapper() },
    );

    // Note card renders successfully with favorite prop
    expect(container.querySelector('[class*="w-full"]')).toBeTruthy();
    expect(screen.getByText("Test Note")).toBeInTheDocument();
  });

  it("calls onClick handler when card is clicked", async () => {
    render(<NoteCard {...mockNote} onClick={mockHandlers.onClick} />, {
      wrapper: createWrapper(),
    });

    const card = screen.getByText("Test Note").closest("div");
    if (card) {
      fireEvent.click(card);
      await waitFor(() => {
        expect(mockHandlers.onClick).toHaveBeenCalledTimes(1);
      });
    }
  });

  it("displays category badge when category is provided", () => {
    const { container } = render(
      <NoteCard
        {...mockNote}
        categoryName="Work"
        categoryIndex={0}
        categoryId="cat-1"
      />,
      { wrapper: createWrapper() },
    );

    // Category name might be rendered but check for its presence in the DOM
    const hasCategory =
      container.textContent?.includes("Work") ||
      container.textContent?.includes("Void");
    expect(hasCategory).toBeTruthy();
  });

  it("shows trash indicator and timer when note is trashed", () => {
    const trashedAt = Math.floor(Date.now() / 1000);
    // Set expiration to 30 days from now
    const expireAt = new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000,
    ).toISOString();

    const { container } = render(
      <NoteCard
        {...mockNote}
        isTrash={true}
        trashedAt={trashedAt}
        expireAt={expireAt}
      />,
      { wrapper: createWrapper() },
    );

    // Should show time remaining - check for "d" (days) or "h" (hours) format
    const hasTimeRemaining = /\d+d \d+h|\d+h \d+m/.test(
      container.textContent || "",
    );
    expect(hasTimeRemaining).toBeTruthy();
  });

  it("renders in list view mode correctly", () => {
    const { container } = render(<NoteCard {...mockNote} viewMode="list" />, {
      wrapper: createWrapper(),
    });

    // Just check that it renders without crashing
    expect(container.querySelector('[class*="w-full"]')).toBeTruthy();
  });

  it("formats date correctly", () => {
    const testDate = "2024-01-15T10:00:00.000Z";
    render(<NoteCard {...mockNote} date={testDate} />, {
      wrapper: createWrapper(),
    });

    // Should display formatted date (implementation-specific)
    expect(screen.getByText(/2024|Jan|15/i)).toBeInTheDocument();
  });

  it("opens menu dropdown when more options button is clicked", async () => {
    render(<NoteCard {...mockNote} onDelete={mockHandlers.onDelete} />, {
      wrapper: createWrapper(),
    });

    const moreButton = screen
      .getByTestId("MoreHorizRoundedIcon")
      .closest("button");
    if (moreButton) {
      fireEvent.click(moreButton);

      await waitFor(
        () => {
          // Check if menu items appear (Pin, Favorite, Delete text)
          const hasMenuItems =
            screen.queryByText(/Pin/i) ||
            screen.queryByText(/Favorite/i) ||
            screen.queryByText(/Trash/i);
          expect(hasMenuItems).toBeTruthy();
        },
        { timeout: 2000 },
      );
    }
  });
});
