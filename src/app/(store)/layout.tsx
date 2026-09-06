import type { ReactNode } from "react";
import { StoreFooter } from "@/components/layout/store-footer";
import { StoreHeader } from "@/components/layout/store-header";
import { StoreMobileDock } from "@/components/layout/store-mobile-dock";

export default function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <StoreHeader />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <StoreFooter />
      <StoreMobileDock />
    </>
  );
}
