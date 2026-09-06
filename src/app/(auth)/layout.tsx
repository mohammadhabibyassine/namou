import type { ReactNode } from "react";
import { StoreHeader } from "@/components/layout/store-header";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <StoreHeader />
      <main className="flex-1">{children}</main>
    </>
  );
}
