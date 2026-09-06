"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/features/auth/api";
import { queryKeys } from "@/lib/query/keys";
import type { Permission, SessionUser } from "@/types/api";
import { useAuthStore } from "@/store";
import { setOnUnauthorized } from "@/utils/errorHandler";

interface SessionContextValue {
  user: SessionUser | null;
  authenticated: boolean;
  status: "loading" | "authenticated" | "anonymous";
  hasPermission: (permission: Permission) => boolean;
  setUser: (user: SessionUser | null) => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({
  children,
  initialUser,
}: {
  children: ReactNode;
  initialUser: SessionUser | null;
}) {
  const queryClient = useQueryClient();
  const storeSetUser = useAuthStore((state) => state.setUser);
  const sessionQuery = useQuery({
    queryKey: queryKeys.session,
    queryFn: authApi.session,
    ...(initialUser ? { initialData: { user: initialUser } } : {}),
    staleTime: 5 * 60_000,
  });
  const user = sessionQuery.data?.user ?? null;
  useEffect(() => {
    storeSetUser(user);
  }, [storeSetUser, user]);
  const setUser = useCallback(
    (nextUser: SessionUser | null) => {
      storeSetUser(nextUser);
      queryClient.setQueryData(queryKeys.session, { user: nextUser });
    },
    [queryClient, storeSetUser],
  );
  useEffect(() => {
    setOnUnauthorized(() => {
      setUser(null);
      queryClient.removeQueries();
    });
    return () => setOnUnauthorized(null);
  }, [queryClient, setUser]);
  const hasPermission = useCallback(
    (permission: Permission) => Boolean(user?.permissions.includes(permission)),
    [user],
  );
  const value = useMemo(
    () => ({
      user,
      authenticated: Boolean(user),
      status: sessionQuery.isPending
        ? ("loading" as const)
        : user
          ? ("authenticated" as const)
          : ("anonymous" as const),
      hasPermission,
      setUser,
    }),
    [hasPermission, sessionQuery.isPending, setUser, user],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context)
    throw new Error("useSession must be used inside SessionProvider");
  return context;
}
