import type { Metadata } from "next";
import { WishlistView } from "@/components/wishlist/wishlist-view";

export const metadata: Metadata = {
  title: "Saved objects",
  robots: { index: false, follow: false },
};

export default function WishlistPage() {
  return <WishlistView />;
}
