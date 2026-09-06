export const queryKeys = {
  session: ["session"] as const,
  categories: {
    all: ["categories"] as const,
    tree: ["categories", "tree"] as const,
    subtree: (id: string) => ["categories", "subtree", id] as const,
    detail: (id: string) => ["categories", "detail", id] as const,
  },
  products: {
    all: ["products"] as const,
    page: (filters: unknown) => ["products", "page", filters] as const,
    infinite: (filters: unknown) => ["products", "infinite", filters] as const,
    detail: (slug: string) => ["products", "detail", slug] as const,
    facets: (filters: unknown) => ["products", "facets", filters] as const,
  },
  cart: ["cart"] as const,
  wishlist: {
    all: ["wishlist"] as const,
    list: ["wishlist", "list"] as const,
    page: (filters: unknown) => ["wishlist", "page", filters] as const,
  },
  profile: ["profile"] as const,
  addresses: ["addresses"] as const,
  orders: {
    all: ["orders"] as const,
    page: (filters: unknown) => ["orders", "page", filters] as const,
    infinite: (filters: unknown) => ["orders", "infinite", filters] as const,
    detail: (id: string) => ["orders", "detail", id] as const,
  },
  chat: {
    conversations: (filters: unknown) =>
      ["chat", "conversations", filters] as const,
    messages: (conversationId: string) =>
      ["chat", "messages", conversationId] as const,
  },
  admin: {
    categories: ["admin", "categories"] as const,
    attributes: ["admin", "attributes"] as const,
    products: ["admin", "products"] as const,
    variantConfiguration: (productId: string) =>
      ["admin", "products", productId, "variants"] as const,
    orders: (filters: unknown) => ["admin", "orders", filters] as const,
    order: (id: string) => ["admin", "orders", id] as const,
  },
} as const;
