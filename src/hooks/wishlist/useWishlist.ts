import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  addWishlistItem,
  getWishlist,
  mergeWishlist,
  removeWishlistItem,
} from "@/services/api/v1/wishlist.api";
import { addCartItem } from "@/services/api/v1/cart.api";
import {
  AddWishlistItemDto,
  ListWishlistQueryDto,
  MergeWishlistDto,
} from "@/types/models/wishlist.model";
import { queryKeys } from "@/lib/query/keys";
import { useAuthStore } from "@/store";

export const WISHLIST_QUERY_KEY = (query?: ListWishlistQueryDto) =>
  queryKeys.wishlist.page(query ?? {});

export const useWishlist = (query?: ListWishlistQueryDto) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: WISHLIST_QUERY_KEY(query),
    queryFn: () => getWishlist(query),
    enabled: isAuthenticated,
  });
};

export const useInfiniteWishlist = (pageSize = 20) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useInfiniteQuery({
    queryKey: queryKeys.wishlist.list,
    initialPageParam: "",
    queryFn: ({ pageParam }) =>
      getWishlist({
        pageSize,
        ...(pageParam ? { cursor: pageParam } : {}),
      }),
    getNextPageParam: (page) =>
      page.pageInfo.hasNextPage
        ? (page.pageInfo.endCursor ?? undefined)
        : undefined,
    enabled: isAuthenticated,
  });
};

export const useAddToWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AddWishlistItemDto) => addWishlistItem(input),
    onSuccess: (updatedWishlist) => {
      queryClient.setQueryData(WISHLIST_QUERY_KEY(), updatedWishlist);
      queryClient.invalidateQueries({ queryKey: queryKeys.wishlist.all });
    },
  });
};

export const useRemoveFromWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (wishlistItemId: string) => removeWishlistItem(wishlistItemId),
    onSuccess: (updatedWishlist) => {
      queryClient.setQueryData(WISHLIST_QUERY_KEY(), updatedWishlist);
      queryClient.invalidateQueries({ queryKey: queryKeys.wishlist.all });
    },
  });
};

export const useMergeWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: MergeWishlistDto) => mergeWishlist(input),
    onSuccess: (updatedWishlist) => {
      queryClient.setQueryData(WISHLIST_QUERY_KEY(), updatedWishlist);
      queryClient.invalidateQueries({ queryKey: queryKeys.wishlist.all });
    },
  });
};

export const useMoveWishlistItemToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      variantId,
      wishlistItemId,
    }: {
      variantId: string;
      wishlistItemId: string;
    }) => {
      await addCartItem({ variantId, quantity: 1 });
      return removeWishlistItem(wishlistItemId);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.cart }),
        queryClient.invalidateQueries({ queryKey: queryKeys.wishlist.all }),
      ]);
    },
  });
};
