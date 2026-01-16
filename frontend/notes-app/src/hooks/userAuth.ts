import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { signout, getSession } from "@/services/authService";
import { useNavigate } from "react-router-dom";

export const UserAuth = () => {
  const navigate = useNavigate();
  const {
    data: user,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["user-session"],
    queryFn: getSession,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });

  const queryClient = useQueryClient();

  const signoutMutation = useMutation({
    mutationFn: signout,
    onSuccess: () => {
      queryClient.setQueryData(["user-session"], null);
      navigate("/");
    },
  });
  return {
    user,
    isLoading,
    isError,
    signout: signoutMutation.mutate,
  };
};
