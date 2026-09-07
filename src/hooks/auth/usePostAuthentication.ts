import { useQueryClient } from "@tanstack/react-query";
import { mergeGuestCommerce } from "@/features/cart/merge-guest-commerce";
import { queryKeys } from "@/lib/query/keys";
import { useGuestCommerce } from "@/providers/guest-commerce-provider";
import { useSession } from "@/providers/session-provider";
import type { SessionUser } from "@/types/api";

export function usePostAuthentication() {
  const queryClient = useQueryClient();
  const { setUser } = useSession();
  const cartItems = useGuestCommerce((state) => state.cartItems);
  const wishlistItems = useGuestCommerce((state) => state.wishlistItems);
  const clearGuestState = useGuestCommerce((state) => state.clearGuestState);

  return async (user: SessionUser) => {
    setUser(user);
    try {
      await mergeGuestCommerce({ cartItems, wishlistItems });
      clearGuestState();
    } catch {
      // Guest state is retained so a transient merge failure never loses data.
    }
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.cart }),
      queryClient.invalidateQueries({ queryKey: queryKeys.wishlist.all }),
    ]);
  };
}
