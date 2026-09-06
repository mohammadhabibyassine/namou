/**
 * Compatibility barrel for application-facing contracts.
 *
 * The canonical transport shapes remain in `types/api/*` and
 * `types/models/*`. This file exposes concise names to the route/component
 * layer without duplicating those interfaces.
 */
export * from "./index";

export type {
  BackendLoginResult as LoginResponse,
  TokenPair,
} from "./api/auth.types";
export type {
  CartItemView as CartItem,
  CartView as Cart,
} from "./models/cart.model";
export type {
  ChatConversationView as ChatConversation,
  ChatMessageView as ChatMessage,
} from "./models/chat.model";
export type {
  OrderDetailView as OrderDetail,
  OrderSummaryView as OrderSummary,
} from "./models/order.model";
export type {
  CreateProductDto as ProductCreateInput,
  ProductAttributeValueView as ProductAttributeValue,
  ProductAttributeView as ProductAttribute,
  ProductImageView as ProductImage,
  ProductVariantOptionView as ProductVariantOption,
  UpdateProductDto as ProductMetadataInput,
} from "./models/product.model";
export type {
  AdminVariantView as AdminVariant,
  ProductImageAdminView as ProductImageAdmin,
  VariantConfigurationView as VariantConfiguration,
} from "./models/variant.model";
export type { UserAddressRecord as UserAddress } from "./models/user.model";
export type {
  WishlistItemView as WishlistItem,
  WishlistView as Wishlist,
} from "./models/wishlist.model";

export const permissions = {
  manageProducts: "manage_products",
  manageCategories: "manage_categories",
  manageOrders: "manage_orders",
  manageUsers: "manage_users",
  viewOrders: "view_orders",
  manageChat: "manage_chat",
  viewAnalytics: "view_analytics",
} as const;

export type Permission = (typeof permissions)[keyof typeof permissions];

export type { SessionUser } from "./api/auth.types";

export interface ApiErrorPayload {
  statusCode?: number;
  error?: string;
  message?: string | string[];
}
