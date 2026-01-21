import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNoteStore } from "../store/noteStore";
import * as noteService from "../services/noteServices";
import type { Category } from "../../types/note";

// Query Keys
export const categoryKeys = {
  all: ["categories"] as const,
  lists: () => [...categoryKeys.all, "list"] as const,
};

// Get All Categories
export function useGetCategories() {
  const setCategories = useNoteStore((state) => state.setCategories);
  const setLoading = useNoteStore((state) => state.setLoading);
  const setError = useNoteStore((state) => state.setError);

  return useQuery({
    queryKey: categoryKeys.lists(),
    queryFn: async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await noteService.getCategories();
        setCategories(response.data.categories);
        return response.data.categories;
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to fetch categories",
        );
        throw error;
      } finally {
        setLoading(false);
      }
    },
  });
}

// Create Category
export function useCreateCategory() {
  const queryClient = useQueryClient();
  const addCategory = useNoteStore((state) => state.addCategory);
  const setError = useNoteStore((state) => state.setError);

  return useMutation({
    mutationFn: noteService.createCategory,
    onMutate: async (newCategory) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: categoryKeys.lists() });

      // Snapshot previous value
      const previousCategories = queryClient.getQueryData(categoryKeys.lists());

      // Optimistically update to the new value
      queryClient.setQueryData(
        categoryKeys.lists(),
        (old: Category[] | undefined) => {
          if (!old) return old;

          // Create temporary optimistic category with next index
          const optimisticCategory: Category = {
            id: `temp-${Date.now()}`, // Temporary ID
            name: newCategory.name,
            index: old.length, // Next index in array
          };

          return [...old, optimisticCategory];
        },
      );

      // Return context with the snapshot and optimistic category
      return { previousCategories, optimisticId: `temp-${Date.now()}` };
    },
    onSuccess: (response) => {
      addCategory(response.data.category);
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
    onError: (error: Error, _variables, context) => {
      // Rollback on error
      if (context?.previousCategories) {
        queryClient.setQueryData(
          categoryKeys.lists(),
          context.previousCategories,
        );
      }
      setError(error.message);
    },
  });
}

// Delete Category
export function useDeleteCategory() {
  const queryClient = useQueryClient();
  const setError = useNoteStore((state) => state.setError);

  return useMutation({
    mutationFn: noteService.deleteCategory,
    onSuccess: () => {
      // Invalidate both categories and notes queries
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ["notes"] }); // Refresh notes since they moved to Void
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });
}
