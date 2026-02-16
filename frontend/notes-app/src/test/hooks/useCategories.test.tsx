import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import {
    useGetCategories,
    useCreateCategory,
    useDeleteCategory,
} from "@/hooks/useCategories";
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

describe("useCategories Hooks", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("useGetCategories", () => {
        it("fetches all categories successfully", async () => {
            const mockCategories = [
                { id: "cat1", name: "Void", index: 0 },
                { id: "cat2", name: "Work", index: 1 },
                { id: "cat3", name: "Personal", index: 2 },
            ];

            vi.mocked(noteService.getCategories).mockResolvedValue({
                status: "success",
                data: { categories: mockCategories },
            } as any);

            const { result } = renderHook(() => useGetCategories(), {
                wrapper: createWrapper(),
            });

            await waitFor(() => expect(result.current.isSuccess).toBe(true));
            expect(result.current.data).toEqual(mockCategories);
        });

        it("handles error when fetching categories fails", async () => {
            vi.mocked(noteService.getCategories).mockRejectedValue(
                new Error("Failed to fetch categories"),
            );

            const { result } = renderHook(() => useGetCategories(), {
                wrapper: createWrapper(),
            });

            await waitFor(() => expect(result.current.isError).toBe(true));
            expect(result.current.error).toBeTruthy();
        });
    });

    describe("useCreateCategory", () => {
        it("creates a new category successfully", async () => {
            const newCategory = { name: "New Category" };
            const createdCategory = {
                id: "new-cat-id",
                name: "New Category",
                index: 3,
            };

            vi.mocked(noteService.createCategory).mockResolvedValue({
                status: "success",
                data: { category: createdCategory },
            } as any);

            const { result } = renderHook(() => useCreateCategory(), {
                wrapper: createWrapper(),
            });

            result.current.mutate(newCategory);

            await waitFor(() => expect(result.current.isSuccess).toBe(true));
            // Check first argument only (TanStack Query passes additional context)
            expect(vi.mocked(noteService.createCategory).mock.calls[0][0]).toEqual(newCategory);
        });

        it("handles error when creating category fails", async () => {
            vi.mocked(noteService.createCategory).mockRejectedValue(
                new Error("Category already exists"),
            );

            const { result } = renderHook(() => useCreateCategory(), {
                wrapper: createWrapper(),
            });

            result.current.mutate({ name: "Duplicate Category" });

            await waitFor(() => expect(result.current.isError).toBe(true));
            expect(result.current.error).toBeTruthy();
        });
    });

    describe("useDeleteCategory", () => {
        it("deletes a category successfully", async () => {
            const categoryId = "cat2";

            vi.mocked(noteService.deleteCategory).mockResolvedValue({
                status: "success",
                message: "Category deleted",
            } as any);

            const { result } = renderHook(() => useDeleteCategory(), {
                wrapper: createWrapper(),
            });

            result.current.mutate(categoryId);

            await waitFor(() => expect(result.current.isSuccess).toBe(true));
            // Check first argument only (TanStack Query passes additional context)
            expect(vi.mocked(noteService.deleteCategory).mock.calls[0][0]).toBe(categoryId);
        });

        it("handles error when deleting category fails", async () => {
            vi.mocked(noteService.deleteCategory).mockRejectedValue(
                new Error("Cannot delete Void category"),
            );

            const { result } = renderHook(() => useDeleteCategory(), {
                wrapper: createWrapper(),
            });

            result.current.mutate("void-category-id");

            await waitFor(() => expect(result.current.isError).toBe(true));
            expect(result.current.error).toBeTruthy();
        });
    });
});
