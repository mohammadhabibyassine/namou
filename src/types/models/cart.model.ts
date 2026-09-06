export interface CartItemProductView {
  id: string;
  title: string;
  slug: string;
  imageUrl: string | null;
}

export interface CartItemVariantOptionView {
  attributeType: string;
  value: string;
}

export interface CartItemVariantView {
  sku: string;
  options: CartItemVariantOptionView[];
}

export interface CartItemView {
  id: string;
  variantId: string;
  quantity: number;
  available: boolean;
  availableQuantity: number;
  unitPrice: string;
  currencyCode: string;
  product: CartItemProductView;
  variant: CartItemVariantView;
  createdAt: string;
  updatedAt: string;
}

export interface CartView {
  items: CartItemView[];
  itemCount: number;
  quantityTotal: number;
}

export interface AddCartItemDto {
  variantId: string;
  quantity?: number;
}

export interface SetCartItemQuantityDto {
  quantity: number;
}

export interface MergeCartDto {
  items: AddCartItemDto[];
}

// Aliases for compatibility
export type Cart = CartView;
export type CartItem = CartItemView;
