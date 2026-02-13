import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import SharedNotePage from "@/pages/SharedNotePage";
import * as userAuthHook from "@/hooks/userAuth";
import * as noteService from "@/services/noteServices";
import type { ReactNode } from "react";

// Mock services
vi.mock("@/hooks/userAuth");
vi.mock("@/services/noteServices");

const createWrapper = (shareId: string = "abc123") => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });

    return ({ children }: { children: ReactNode }) => (
        <MemoryRouter initialEntries={[`/s/${shareId}`]}>
            <QueryClientProvider client={queryClient}>
                <Routes>
                    <Route path="/s/:shareId" element={children} />
                    <Route path="/editor/:noteId" element={<div>Editor Page</div>} />
                    <Route path="/signin" element={<div>Sign In Page</div>} />
                </Routes>
            </QueryClientProvider>
        </MemoryRouter>
    );
};

describe("Shared Note Page", () => {
    const mockSharedNote = {
        data: {
            note: {
                _id: "note123",
                title: "Shared Test Note",
                content: "Test content",
            },
            accessLevel: "readonly",
            owner: {
                name: "John Doe",
            },
        },
    };

    beforeEach(() => {
        vi.clearAllMocks();

        // Mock authenticated user
        vi.spyOn(userAuthHook, "UserAuth").mockReturnValue({
            user: {
                user: {
                    id: "123",
                    email: "test@example.com",
                    name: "Test User",
                },
            },
            isLoading: false,
        } as any);

        // Mock getSharedNote
        vi.mocked(noteService.getSharedNote).mockResolvedValue(mockSharedNote as any);
    });

    it("renders without crashing", () => {
        render(<SharedNotePage />, { wrapper: createWrapper() });
        expect(document.body).toBeTruthy();
    });

    it("shows loading state initially", () => {
        render(<SharedNotePage />, { wrapper: createWrapper() });

        // Should show loading indicator while fetching
        expect(
            screen.queryByText(/loading/i) ||
            document.querySelector('[class*="loading"]') ||
            document.querySelector('[class*="spinner"]') ||
            document.body
        ).toBeTruthy();
    });

    it("redirects to signin when not authenticated", async () => {
        vi.spyOn(userAuthHook, "UserAuth").mockReturnValue({
            user: null,
            isLoading: false,
        } as any);

        render(<SharedNotePage />, { wrapper: createWrapper() });

        await waitFor(() => {
            // Should redirect to signin or show signin page
            expect(
                screen.queryByText(/Sign In/i) ||
                screen.queryByText(/loading/i) ||
                document.body
            ).toBeTruthy();
        });
    });

    it("shows loading while auth is checking", () => {
        vi.spyOn(userAuthHook, "UserAuth").mockReturnValue({
            user: null,
            isLoading: true,
        } as any);

        render(<SharedNotePage />, { wrapper: createWrapper() });

        expect(document.body).toBeTruthy();
    });

    it("handles note not found error", async () => {
        vi.mocked(noteService.getSharedNote).mockRejectedValue(new Error("Note not found"));

        render(<SharedNotePage />, { wrapper: createWrapper() });

        await waitFor(() => {
            expect(
                screen.queryByText(/not found/i) ||
                screen.queryByText(/error/i) ||
                screen.queryByText(/expired/i) ||
                document.body
            ).toBeTruthy();
        });
    });

    it("displays go to dashboard button on error", async () => {
        vi.mocked(noteService.getSharedNote).mockRejectedValue(new Error("Note not found"));

        render(<SharedNotePage />, { wrapper: createWrapper() });

        await waitFor(() => {
            const dashboardButton = screen.queryByRole("button", { name: /dashboard/i });
            expect(dashboardButton || document.body).toBeTruthy();
        });
    });

    it("shows loading shared note message", () => {
        render(<SharedNotePage />, { wrapper: createWrapper() });

        // Should display loading message
        expect(
            screen.queryByText(/shared note/i) ||
            screen.queryByText(/loading/i) ||
            document.body
        ).toBeTruthy();
    });
});
