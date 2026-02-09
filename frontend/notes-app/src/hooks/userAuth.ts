import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { signout, getSession } from "@/services/authService";
import { useNavigate } from "react-router-dom";
import { setUserContext, clearUserContext, logger } from "@/lib/logger";
import { useEffect } from "react";

export const UserAuth = () => {
  const navigate = useNavigate();
  const {
    data: user,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["user-session"],
    queryFn: async () => {
      const session = await getSession();
      // Auth.js returns an empty object {} when not authenticated
      if (!session || (typeof session === "object" && Object.keys(session).length === 0)) {
        return null;
      }
      return session;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });

  const queryClient = useQueryClient();

  // Set user context in logger when user data is available
  useEffect(() => {
    if (user?.user?.id) {
      setUserContext(user.user.id, user.user.email);
      logger.info({ msg: "User authenticated", userId: user.user.id });
    }
  }, [user]);

  const signoutMutation = useMutation({
    mutationFn: signout,
    onSuccess: () => {
      clearUserContext();
      logger.info({ msg: "User logged out" });
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
