import type { ReactNode } from "react";
import { requireSession } from "@/lib/auth/dal";
import { StoreFooter } from "@/components/layout/store-footer";
import { StoreHeader } from "@/components/layout/store-header";
import { StoreMobileDock } from "@/components/layout/store-mobile-dock";

export default async function AccountLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireSession();
  return (
    <>
      <StoreHeader />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <StoreFooter />
      <StoreMobileDock />
    </>
  );
}
