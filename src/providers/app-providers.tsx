"use client";

import type { ReactNode } from "react";
import type { SessionUser } from "@/types/api";
import { GuestCommerceProvider } from "./guest-commerce-provider";
import { QueryProvider } from "./QueryProvider";
import { SessionProvider } from "./session-provider";
import { SocketProvider } from "./socket-provider";
import { StoreProvider } from "./store-provider";

export function AppProviders({
  children,
  initialUser,
}: {
  children: ReactNode;
  initialUser: SessionUser | null;
}) {
  return (
    <StoreProvider>
      <QueryProvider>
        <SessionProvider initialUser={initialUser}>
          <GuestCommerceProvider>
            <SocketProvider>{children}</SocketProvider>
          </GuestCommerceProvider>
        </SessionProvider>
      </QueryProvider>
    </StoreProvider>
  );
}
