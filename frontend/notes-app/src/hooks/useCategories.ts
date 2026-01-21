import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNoteStore } from "../store/noteStore";
import * as noteService from "../services/noteServices";

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
    onSuccess: (response) => {
      addCategory(response.data.category);
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
    onError: (error: Error) => {
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
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });
}
