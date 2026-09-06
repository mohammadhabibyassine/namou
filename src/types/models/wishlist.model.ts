import { CursorPageInfo, CursorPaginationQuery } from "../api/common.types";

export interface WishlistItemView {
  id: string;
  productId: string;
  variantId: string | null;
  available: boolean;
  price: string;
  currencyCode: string;
  product: {
    title: string;
    slug: string;
    imageUrl: string | null;
  };
  variant: {
    sku: string;
    stockQuantity: number;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface WishlistView {
  items: WishlistItemView[];
  itemCount: number;
  pageInfo: CursorPageInfo;
}

export interface AddWishlistItemDto {
  productId: string;
  variantId?: string | null;
}

export interface MergeWishlistDto {
  items: AddWishlistItemDto[];
}

export type ListWishlistQueryDto = CursorPaginationQuery;
