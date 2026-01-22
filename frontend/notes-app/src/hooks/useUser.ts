import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as userService from "../services/userService";

export const userKeys = {
  all: ["user"] as const,
  profile: () => [...userKeys.all, "profile"] as const,
};

export function useGetProfile() {
  return useQuery({
    queryKey: userKeys.profile(),
    queryFn: userService.getProfile,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userService.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.profile() });
    },
  });
}

export function useDeactivateAccount() {
  return useMutation({
    mutationFn: userService.deactivateAccount,
  });
}
