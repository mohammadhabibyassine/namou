export const API_ENDPOINTS = {
  // App
  HEALTH: "/",

  // Auth
  AUTH: {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    REFRESH: "/auth/refresh",
    LOGOUT: "/auth/logout",
  },

  // Users & Profile & Addresses
  USERS: {
    ME: "/users/me",
    ADDRESSES: "/users/me/addresses",
    ADDRESS_BY_ID: (addressId: string) => `/users/me/addresses/${addressId}`,
  },

  // Categories
  CATEGORIES: {
    ROOT: "/categories",
    TREE: "/categories/tree",
    BY_ID: (id: string) => `/categories/${id}`,
    SUBTREE: (id: string) => `/categories/${id}/subtree`,
  },

  // Products
  PRODUCTS: {
    ROOT: "/products",
    FACETS: "/products/facets",
    BY_SLUG: (slug: string) => `/products/${slug}`,
    BY_ID: (id: string) => `/products/${id}`,
  },

  UPLOADS: {
    PRODUCT_PRESIGN: (productId: string) =>
      `/uploads/products/${productId}/presigned-url`,
    PRODUCT: (productId: string) => `/uploads/products/${productId}`,
  },

  // Variants & Attributes
  VARIANTS: {
    CONFIGURATION: (productId: string) =>
      `/products/${productId}/variant-configuration`,
    VARIANT_BY_ID: (productId: string, variantId: string) =>
      `/products/${productId}/variants/${variantId}`,
    IMAGES: (productId: string) => `/products/${productId}/images`,
  },

  ATTRIBUTES: {
    ROOT: "/attribute-types",
    BY_ID: (attributeTypeId: string) => `/attribute-types/${attributeTypeId}`,
    VALUES: (attributeTypeId: string) =>
      `/attribute-types/${attributeTypeId}/values`,
    VALUE_BY_ID: (attributeTypeId: string, attributeValueId: string) =>
      `/attribute-types/${attributeTypeId}/values/${attributeValueId}`,
  },

  // Cart
  CART: {
    ROOT: "/cart",
    ITEMS: "/cart/items",
    ITEM_BY_VARIANT_ID: (variantId: string) => `/cart/items/${variantId}`,
    MERGE: "/cart/merge",
  },

  // Wishlist
  WISHLIST: {
    ROOT: "/wishlist",
    ITEM_BY_ID: (wishlistItemId: string) => `/wishlist/${wishlistItemId}`,
    MERGE: "/wishlist/merge",
  },

  // Orders
  ORDERS: {
    ROOT: "/orders",
    CHECKOUT: "/orders/checkout",
    BY_ID: (orderId: string) => `/orders/${orderId}`,
    ADMIN: {
      ROOT: "/admin/orders",
      BY_ID: (orderId: string) => `/admin/orders/${orderId}`,
      STATUS: (orderId: string) => `/admin/orders/${orderId}/status`,
    },
  },

  // Chat
  CHAT: {
    CONVERSATIONS: "/chat/conversations",
    MESSAGES: (conversationId: string) =>
      `/chat/conversations/${conversationId}/messages`,
    READ: (conversationId: string) =>
      `/chat/conversations/${conversationId}/read`,
    CLOSE: (conversationId: string) =>
      `/chat/conversations/${conversationId}/close`,
    ADMIN: {
      CONVERSATIONS: "/admin/chat/conversations",
      MESSAGES: (conversationId: string) =>
        `/admin/chat/conversations/${conversationId}/messages`,
      ASSIGNMENT: (conversationId: string) =>
        `/admin/chat/conversations/${conversationId}/assignment`,
      READ: (conversationId: string) =>
        `/admin/chat/conversations/${conversationId}/read`,
      STATUS: (conversationId: string) =>
        `/admin/chat/conversations/${conversationId}/status`,
    },
  },
} as const;
