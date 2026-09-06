import type { ReactNode } from "react";
import { requireSession } from "@/lib/auth/dal";
import { StoreFooter } from "@/components/layout/store-footer";
import { StoreHeader } from "@/components/layout/store-header";

export default async function AccountLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireSession();
  return (
    <>
      <StoreHeader />
      <main className="flex-1">{children}</main>
      <StoreFooter />
    </>
  );
}
