import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { getUserProfile } from "@/services/api/v1/user.api";
import { UserProfile } from "@/types/models/user.model";
import { queryKeys } from "@/lib/query/keys";
import { useAuthStore } from "@/store";

export const USER_PROFILE_QUERY_KEY = queryKeys.profile;

export const useCurrentUser = (
  options?: Omit<
    UseQueryOptions<UserProfile | null, Error>,
    "queryKey" | "queryFn"
  >,
) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setUser = useAuthStore((state) => state.setUser);

  return useQuery<UserProfile | null, Error>({
    queryKey: USER_PROFILE_QUERY_KEY,
    queryFn: async () => {
      const profile = await getUserProfile();
      if (profile) {
        setUser(profile);
      }
      return profile;
    },
    enabled: isAuthenticated,
    ...options,
  });
};
