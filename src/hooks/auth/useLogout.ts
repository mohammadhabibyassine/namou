import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logoutUser } from "@/services/api/v1/auth.api";
import { useAuthStore } from "@/store";
import { logger } from "@/utils/logger";
import { useRouter } from "next/navigation";
import { useSession } from "@/providers/session-provider";

export const useLogout = () => {
  const queryClient = useQueryClient();
  const logout = useAuthStore((state) => state.logout);
  const { setUser } = useSession();
  const router = useRouter();

  return useMutation({
    mutationFn: logoutUser,
    onSettled: async () => {
      logout();
      setUser(null);
      await queryClient.clear();
      logger.info("User logged out and query cache cleared");
      router.push("/");
      router.refresh();
    },
  });
};
