import { apiClient } from "./client";
import { API_ENDPOINTS } from "./endpoints";
import {
  AddCartItemDto,
  CartView,
  MergeCartDto,
  SetCartItemQuantityDto,
} from "@/types/models/cart.model";

export const getCart = async (): Promise<CartView> => {
  const response = await apiClient.get<CartView>(API_ENDPOINTS.CART.ROOT);
  return response.data;
};

export const addCartItem = async (input: AddCartItemDto): Promise<CartView> => {
  const response = await apiClient.post<CartView>(
    API_ENDPOINTS.CART.ITEMS,
    input,
  );
  return response.data;
};

export const setCartItemQuantity = async (
  variantId: string,
  input: SetCartItemQuantityDto,
): Promise<CartView> => {
  const response = await apiClient.patch<CartView>(
    API_ENDPOINTS.CART.ITEM_BY_VARIANT_ID(variantId),
    input,
  );
  return response.data;
};

export const removeCartItem = async (variantId: string): Promise<CartView> => {
  const response = await apiClient.delete<CartView>(
    API_ENDPOINTS.CART.ITEM_BY_VARIANT_ID(variantId),
  );
  return response.data;
};

export const mergeCart = async (input: MergeCartDto): Promise<CartView> => {
  const response = await apiClient.post<CartView>(
    API_ENDPOINTS.CART.MERGE,
    input,
  );
  return response.data;
};

// Aliases for compatibility
export const addToCart = addCartItem;
export const updateCartItem = (input: { itemId: string; quantity: number }) =>
  setCartItemQuantity(input.itemId, { quantity: input.quantity });
