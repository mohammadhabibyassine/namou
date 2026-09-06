import { apiClient } from "./client";
import { API_ENDPOINTS } from "./endpoints";
import {
  AddWishlistItemDto,
  ListWishlistQueryDto,
  MergeWishlistDto,
  WishlistView,
} from "@/types/models/wishlist.model";

export const getWishlist = async (
  query?: ListWishlistQueryDto,
): Promise<WishlistView> => {
  const response = await apiClient.get<WishlistView>(
    API_ENDPOINTS.WISHLIST.ROOT,
    { params: query },
  );
  return response.data;
};

export const addWishlistItem = async (
  input: AddWishlistItemDto,
): Promise<WishlistView> => {
  const response = await apiClient.post<WishlistView>(
    API_ENDPOINTS.WISHLIST.ROOT,
    input,
  );
  return response.data;
};

export const removeWishlistItem = async (
  wishlistItemId: string,
): Promise<WishlistView> => {
  const response = await apiClient.delete<WishlistView>(
    API_ENDPOINTS.WISHLIST.ITEM_BY_ID(wishlistItemId),
  );
  return response.data;
};

export const mergeWishlist = async (
  input: MergeWishlistDto,
): Promise<WishlistView> => {
  const response = await apiClient.post<WishlistView>(
    API_ENDPOINTS.WISHLIST.MERGE,
    input,
  );
  return response.data;
};
