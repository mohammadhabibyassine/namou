# Frontend architecture

## 1. Data ownership

Use the smallest state owner that fits:

1. URL search parameters own shareable catalog filters, search, sort, and pagination state.
2. Server Components own public first-render reads where SEO and fast HTML matter.
3. TanStack Query owns interactive backend state: signed-in cart, wishlist, profile, addresses, orders, and chat history.
4. Zustand owns guest cart/wishlist plus future ephemeral UI state such as drawers. It must not duplicate Query data.
5. Local component state owns isolated interactions such as an open accordion or the currently selected product image.

This prevents multiple caches from disagreeing about the same backend record.

## 2. HTTP request flow

```text
Browser component
    │ same-origin request; no bearer token in JS
    ▼
Next /api/backend/* allowlist
    │ attaches HttpOnly access token
    ▼
Nest controller + authentication + permission guards
    ▼
Prisma/PostgreSQL
```

Public Server Components may call Nest directly with `catalogServerApi`. Client components use `catalogClientApi` or the feature APIs, which use the BFF. Do not import `*.server.ts` from a client module.

Authenticated browser requests use a single-flight Axios response interceptor. On a 401, one same-origin `/api/auth/refresh` request rotates the HttpOnly refresh cookie; concurrent requests await that operation and retry once. The Web Locks API serializes refreshes across same-origin tabs where supported. The BFF and socket-token handlers never refresh independently, preventing valid rotating refresh tokens from being replayed by parallel requests.

The BFF forwards only approved route/method combinations, does not forward a browser-supplied authorization header, rejects foreign-origin mutations, does not follow redirects, and returns authenticated responses with `Cache-Control: no-store`.

When a backend controller is added, explicitly add its method and path to `src/app/api/backend/[...path]/policy.ts` and add a policy test. Never replace the allowlist with a generic pass-through.

## 3. Authentication and authorization

### Login/register

1. The browser posts credentials to a same-origin Next route.
2. Next validates the payload with the same limits used by the Nest DTO.
3. Next calls Nest server-to-server.
4. The access token, rotating refresh token, and signed minimal session are stored as HttpOnly cookies.
5. The browser receives only the safe session user.
6. Guest cart and wishlist are merged; guest state is cleared only after both merges succeed.

Nest registration returns no tokens, so the registration handler immediately performs a server-side login with the same validated credentials.

### Protection layers

- `src/proxy.ts` is an optimistic redirect only. Cookie presence is cheap, but not enough for security.
- Protected server layouts verify the signed UI session before rendering.
- UI permission checks hide actions the user cannot use.
- Nest guards are the secure authority and must validate every protected read and write.

Permissions mirrored from the backend are `manage_products`, `manage_categories`, `manage_orders`, `manage_users`, `view_orders`, `manage_chat`, and `view_analytics`.

The signed UI session contains only user ID, role, and permissions—no email, profile, token, or address data. It is a convenience snapshot. A changed role takes effect authoritatively at Nest immediately and in the UI on the next login/session renewal. For future instant revocation UX, add a backend session/introspection endpoint and let the data-access layer perform a secure check.

### Token rules

- Never write access or refresh tokens to local storage, session storage, URL parameters, logs, React props, Query cache, or Zustand.
- Use a different `AUTH_SESSION_SECRET` from the backend `JWT_ACCESS_SECRET`.
- Production cookies use the `__Host-` prefix, `Secure`, `HttpOnly`, `SameSite=Lax`, and `/` path.
- Logout clears local cookies even when Nest is temporarily unreachable.

## 4. Socket.IO chat

The existing backend uses namespace `/chat`, handshake auth `{ token }`, and these events:

| Direction       | Event                | Payload/result                                    |
| --------------- | -------------------- | ------------------------------------------------- |
| client → server | `conversation:join`  | `{ conversationId }`                              |
| client → server | `conversation:leave` | `{ conversationId }`                              |
| client → server | `message:send`       | `{ conversationId, content }` → `ChatMessage` ack |
| server → client | `message:created`    | `ChatMessage`                                     |

`SocketProvider` is mounted globally but creates no socket until `connect()` is called. Event listeners are registered before connection. Commands use a ten-second acknowledgement timeout. Manager reconnection uses capped exponential backoff with jitter. Authentication failure forces one HTTP refresh, replaces `socket.auth`, and reconnects once.

Browsers cannot attach a custom Authorization header to a native WebSocket handshake. `/api/auth/socket-token` therefore exchanges the HttpOnly session for a short-lived access token held only in Socket.IO memory. The response is same-origin and `no-store`; never persist or log it.

For local development, the Nest gateway currently has no polling CORS configuration, so `.env.local` selects WebSocket-only transport. The preferred production setup is same-origin ingress that routes `/socket.io` to Nest; then set `NEXT_PUBLIC_SOCKET_WEBSOCKET_ONLY=false` to retain polling fallback and normal transport upgrade.

When chat UI opens: load/create a conversation through REST, call `connect()`, join its room, then subscribe to `message:created`. On close, unsubscribe and leave the room. Keep REST send as a fallback if realtime is unavailable.

## 5. Zustand rules

- Export store factories built with `createStore` from `zustand/vanilla`; never export a module-global store.
- Access stores through a React context provider and selectors.
- Do not read or write the store from React Server Components.
- Persist only guest commerce data with `partialize`; actions and hydration flags are not persisted.
- `skipHydration` prevents server/client markup mismatch; the provider rehydrates after mount.
- Persisted state is versioned and runtime-validated with Zod during merge because browser storage is untrusted.
- Keep individual selectors narrow to avoid unrelated rerenders.

## 6. Query rules

- Query keys come from `src/lib/query/keys.ts`.
- Client requests call typed feature adapters and throw `BackendError` for normalized UI handling.
- Do not retry 4xx responses. Mutations do not retry automatically.
- In Server Components, create a QueryClient per request if prefetching. Never share a server QueryClient at module scope.
- Hydrate only data that an interactive client component needs. Plain Server Component data needs no Query cache.
- After mutations, update/invalidate the narrowest related keys.

## 7. Forms and inputs

Generic primitives in `src/components/ui` forward refs, expose native attributes, preserve labels/descriptions/errors, and use `aria-invalid`/`role=alert`. Feature forms should:

- define a Zod schema alongside the feature;
- use `zodResolver` with React Hook Form;
- match Nest DTO normalization and limits;
- map backend validation messages to fields when possible;
- keep the submit button disabled and `aria-busy` while pending;
- let the backend revalidate everything.

Prefer native controls where they meet the interaction. If a custom combobox, dialog, or menu is needed later, choose an accessibility-first primitive and wrap it behind `components/ui` rather than spreading library-specific APIs across features.

## 8. Backend-aligned routes

| Frontend                         | Primary backend contracts         | Stitch reference                                |
| -------------------------------- | --------------------------------- | ----------------------------------------------- |
| `/`                              | categories tree, product list     | `designs/namou_*_techwear_storefront/`          |
| `/shop`                          | products, facets, category tree   | `designs/NAMOU All Objects Catalog*/`           |
| `/shop/[slug]`                   | product detail, cart/wishlist add | `designs/NAMOU Technical Shell 01 Detail*/`     |
| `/cart`                          | guest store or `/cart`            | `designs/NAMOU Cart : 02 Screen*/`              |
| `/wishlist`                      | guest store or `/wishlist`        | `designs/NAMOU Saved Objects Wishlist*/`        |
| `/login`, `/signup`              | Next auth BFF                     | `designs/NAMOU Account & Saved Addresses*/`     |
| `/account`, `/account/addresses` | `/users/me/*`                     | shared account visual system                    |
| `/checkout`                      | cart, addresses, checkout         | `designs/NAMOU Review : Place Order*/`          |
| `/order-confirmation/[orderId]`  | order detail                      | `designs/NAMOU Order Confirmation*/`            |
| `/orders`, `/orders/[orderId]`   | customer orders                   | `designs/NAMOU Orders History*/`                |
| `/admin/orders/*`                | admin orders/status               | `designs/NAMOU Admin Orders*/`                  |
| `/admin/products/*`              | products/variants/images          | `designs/NAMOU Admin Create Product Variants*/` |
| `/admin/categories`              | category CRUD                     | `designs/NAMOU Admin Categories Tree*/`         |
| `/admin/attributes`              | attribute type/value CRUD         | `designs/NAMOU Admin Attributes*/`              |
| `/admin/chat`                    | admin chat REST + socket          | admin visual system                             |

## 9. Known backend gaps that affect the UI

- Checkout creates an order but has no payment intent/provider flow yet. Do not show a fake card payment form as functional.
- There is no dedicated admin product list/detail-by-ID API. The public catalog cannot fully back an operations table or reliably load an inactive product editor.
- There are no user-management or analytics controllers yet despite permissions being defined.
- Product images are URL-based; direct upload/storage is not yet available.
- Customer cancellation is not exposed. Admin order status changes must follow backend transition rules.
- Catalog pagination is cursor-based and returns no total count; the UI should use “load more”/infinite patterns rather than invented page totals.

## 10. Implemented surfaces

- Storefront and admin shells, responsive navigation, typography, tokens, and reusable commerce primitives.
- Server-rendered home, catalog, URL-owned filters, cursor-based loading, dynamic product metadata, and interactive product variants.
- Persistent guest cart/wishlist plus authenticated Query-backed cart/wishlist and post-login merge.
- Login, signup, profile, saved-address CRUD, checkout, confirmation, order history, and order detail.
- Customer support widget and admin support queue using REST history and lazy Socket.IO rooms.
- Admin orders and valid status transitions, category tree CRUD, attribute/value CRUD, product creation, and variant editing.
- Route loading, empty, network, 404, reduced-motion, metadata, Open Graph, robots, and sitemap states.

The product operations screens deliberately disclose the current backend limitation: active products can be listed from the public catalog and variant configuration can be edited, but complete inactive-product metadata and existing image editing require an admin product detail endpoint.
