const UUID =
  "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}";
const SEGMENT = "[^/]+";

interface RoutePolicy {
  methods: readonly string[];
  pattern: RegExp;
  requiresAuth: boolean;
}

const policies: readonly RoutePolicy[] = [
  {
    methods: ["GET"],
    pattern: new RegExp(`^/products/admin/${UUID}$`),
    requiresAuth: true,
  },
  {
    methods: ["GET"],
    pattern: new RegExp(`^/categories(?:/tree|/${UUID}(?:/subtree)?)$`),
    requiresAuth: false,
  },
  {
    methods: ["GET"],
    pattern: new RegExp(`^/products(?:/facets|/${SEGMENT})?$`),
    requiresAuth: false,
  },
  {
    methods: ["POST"],
    pattern: /^\/products$/,
    requiresAuth: true,
  },
  {
    methods: ["PATCH", "DELETE"],
    pattern: new RegExp(`^/products/${UUID}$`),
    requiresAuth: true,
  },
  {
    methods: ["GET", "PUT"],
    pattern: new RegExp(`^/products/${UUID}/variant-configuration$`),
    requiresAuth: true,
  },
  {
    methods: ["PATCH", "DELETE"],
    pattern: new RegExp(`^/products/${UUID}/variants/${UUID}$`),
    requiresAuth: true,
  },
  {
    methods: ["GET", "PUT"],
    pattern: new RegExp(`^/products/${UUID}/images$`),
    requiresAuth: true,
  },
  {
    methods: ["POST"],
    pattern: new RegExp(`^/uploads/products/${UUID}/presigned-url$`),
    requiresAuth: true,
  },
  {
    methods: ["DELETE"],
    pattern: new RegExp(`^/uploads/products/${UUID}$`),
    requiresAuth: true,
  },
  {
    methods: ["GET", "POST"],
    pattern: /^\/attribute-types$/,
    requiresAuth: true,
  },
  {
    methods: ["PATCH", "DELETE"],
    pattern: new RegExp(`^/attribute-types/${UUID}$`),
    requiresAuth: true,
  },
  {
    methods: ["POST"],
    pattern: new RegExp(`^/attribute-types/${UUID}/values$`),
    requiresAuth: true,
  },
  {
    methods: ["PATCH", "DELETE"],
    pattern: new RegExp(`^/attribute-types/${UUID}/values/${UUID}$`),
    requiresAuth: true,
  },
  {
    methods: ["POST"],
    pattern: /^\/categories$/,
    requiresAuth: true,
  },
  {
    methods: ["PATCH", "DELETE"],
    pattern: new RegExp(`^/categories/${UUID}$`),
    requiresAuth: true,
  },
  {
    methods: ["GET", "PATCH"],
    pattern: /^\/users\/me$/,
    requiresAuth: true,
  },
  {
    methods: ["GET", "POST"],
    pattern: /^\/users\/me\/addresses$/,
    requiresAuth: true,
  },
  {
    methods: ["PATCH", "DELETE"],
    pattern: new RegExp(`^/users/me/addresses/${UUID}$`),
    requiresAuth: true,
  },
  {
    methods: ["GET"],
    pattern: /^\/cart$/,
    requiresAuth: true,
  },
  {
    methods: ["POST"],
    pattern: /^\/cart\/(?:items|merge)$/,
    requiresAuth: true,
  },
  {
    methods: ["PATCH", "DELETE"],
    pattern: new RegExp(`^/cart/items/${UUID}$`),
    requiresAuth: true,
  },
  {
    methods: ["GET", "POST"],
    pattern: /^\/wishlist$/,
    requiresAuth: true,
  },
  {
    methods: ["POST"],
    pattern: /^\/wishlist\/merge$/,
    requiresAuth: true,
  },
  {
    methods: ["DELETE"],
    pattern: new RegExp(`^/wishlist/${UUID}$`),
    requiresAuth: true,
  },
  {
    methods: ["GET"],
    pattern: /^\/orders$/,
    requiresAuth: true,
  },
  {
    methods: ["POST"],
    pattern: /^\/orders\/checkout$/,
    requiresAuth: true,
  },
  {
    methods: ["GET"],
    pattern: new RegExp(`^/orders/${UUID}$`),
    requiresAuth: true,
  },
  {
    methods: ["GET"],
    pattern: /^\/admin\/orders$/,
    requiresAuth: true,
  },
  {
    methods: ["GET"],
    pattern: new RegExp(`^/admin/orders/${UUID}$`),
    requiresAuth: true,
  },
  {
    methods: ["PATCH"],
    pattern: new RegExp(`^/admin/orders/${UUID}/status$`),
    requiresAuth: true,
  },
  {
    methods: ["GET", "POST"],
    pattern: /^\/chat\/conversations$/,
    requiresAuth: true,
  },
  {
    methods: ["GET", "POST"],
    pattern: new RegExp(`^/chat/conversations/${UUID}/messages$`),
    requiresAuth: true,
  },
  {
    methods: ["PATCH"],
    pattern: new RegExp(`^/chat/conversations/${UUID}/(?:read|close)$`),
    requiresAuth: true,
  },
  {
    methods: ["GET"],
    pattern: /^\/admin\/chat\/conversations$/,
    requiresAuth: true,
  },
  {
    methods: ["GET", "POST"],
    pattern: new RegExp(`^/admin/chat/conversations/${UUID}/messages$`),
    requiresAuth: true,
  },
  {
    methods: ["PATCH"],
    pattern: new RegExp(
      `^/admin/chat/conversations/${UUID}/(?:assignment|read|status)$`,
    ),
    requiresAuth: true,
  },
];

export function findRoutePolicy(
  path: string,
  method: string,
): RoutePolicy | null {
  return (
    policies.find(
      (policy) =>
        policy.methods.includes(method.toUpperCase()) &&
        policy.pattern.test(path),
    ) ?? null
  );
}
