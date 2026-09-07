import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addCartItem,
  getCart,
  mergeCart,
  removeCartItem,
  setCartItemQuantity,
} from "@/services/api/v1/cart.api";
import {
  AddCartItemDto,
  MergeCartDto,
  SetCartItemQuantityDto,
} from "@/types/models/cart.model";
import { queryKeys } from "@/lib/query/keys";
import { useAuthStore, useCartStore } from "@/store";

export const CART_QUERY_KEY = queryKeys.cart;

export const useCart = (options?: { enabled?: boolean }) => {
  const setCart = useCartStore((state) => state.setCart);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const enabled =
    options?.enabled !== undefined ? options.enabled : isAuthenticated;

  return useQuery({
    queryKey: CART_QUERY_KEY,
    queryFn: async () => {
      const cart = await getCart();
      setCart(cart);
      return cart;
    },
    enabled,
  });
};

export const useAddToCart = () => {
  const queryClient = useQueryClient();
  const setCart = useCartStore((state) => state.setCart);

  return useMutation({
    mutationFn: (input: AddCartItemDto) => addCartItem(input),
    onSuccess: (updatedCart) => {
      setCart(updatedCart);
      queryClient.setQueryData(CART_QUERY_KEY, updatedCart);
      void queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });
};

export const useSetCartItemQuantity = () => {
  const queryClient = useQueryClient();
  const setCart = useCartStore((state) => state.setCart);

  return useMutation({
    mutationFn: ({
      variantId,
      input,
    }: {
      variantId: string;
      input: SetCartItemQuantityDto;
    }) => setCartItemQuantity(variantId, input),
    onSuccess: (updatedCart) => {
      setCart(updatedCart);
      queryClient.setQueryData(CART_QUERY_KEY, updatedCart);
      void queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });
};

export const useRemoveCartItem = () => {
  const queryClient = useQueryClient();
  const setCart = useCartStore((state) => state.setCart);

  return useMutation({
    mutationFn: (variantId: string) => removeCartItem(variantId),
    onSuccess: (updatedCart) => {
      setCart(updatedCart);
      queryClient.setQueryData(CART_QUERY_KEY, updatedCart);
      void queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });
};

export const useMergeCart = () => {
  const queryClient = useQueryClient();
  const setCart = useCartStore((state) => state.setCart);

  return useMutation({
    mutationFn: (input: MergeCartDto) => mergeCart(input),
    onSuccess: (updatedCart) => {
      setCart(updatedCart);
      queryClient.setQueryData(CART_QUERY_KEY, updatedCart);
      void queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });
};

// Aliases for compatibility
export const useUpdateCartItem = () => {
  const mutation = useSetCartItemQuantity();
  return {
    ...mutation,
    mutate: (input: { itemId: string; quantity: number }) =>
      mutation.mutate({
        variantId: input.itemId,
        input: { quantity: input.quantity },
      }),
    mutateAsync: (input: { itemId: string; quantity: number }) =>
      mutation.mutateAsync({
        variantId: input.itemId,
        input: { quantity: input.quantity },
      }),
  };
};
