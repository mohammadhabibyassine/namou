# Frontend architecture

The frontend is a Next.js application with a server-side backend-for-frontend boundary. This document explains the boundaries that matter when adding a page, changing a data flow, or deploying the application.

## Request topology

```text
Browser
  |
  | same-origin page/API requests
  v
Next.js app (:3001)
  |\
  | \-- route proxy protects private UI paths
  | \
  |  \-- /api/auth/* owns cookie and session operations
  |   \-- /api/backend/[...path] allowlists server-side API calls
  |
  +---- server-side bearer request ----> namou NestJS API (:3000)
  |
  +---- short-lived socket token ----> Browser Socket.IO client
                                         |
                                         +--> NestJS `/chat` namespace
```

The browser can render public pages through server-side data access and can use same-origin route handlers for authenticated operations. A client component should not receive backend credentials or invent a direct cross-origin authenticated request.

## Source tree

| Location              | Responsibility                                                    |
| --------------------- | ----------------------------------------------------------------- |
| `src/app`             | App Router pages, layouts, metadata, and API route handlers       |
| `src/proxy.ts`        | Early route protection and login redirects                        |
| `src/components`      | Reusable UI and design-system components                          |
| `src/features`        | Feature-level view, form, and API adapters                        |
| `src/hooks`           | Canonical TanStack Query hooks                                    |
| `src/services/api/v1` | Typed Axios modules and endpoint definitions                      |
| `src/lib/api`         | BFF request policy, server/client API helpers, and error handling |
| `src/lib/auth`        | Cookie/session/refresh behavior                                   |
| `src/lib/query`       | Query client and query-key conventions                            |
| `src/lib/socket`      | Socket.IO token and connection utilities                          |
| `src/providers`       | Query, session, guest-commerce, store, and socket providers       |
| `src/stores`          | Persisted guest cart and wishlist state                           |
| `src/store`           | Local UI and session state                                        |
| `src/styles`          | Global styles and Tailwind setup                                  |

The active query client is `src/lib/query/query-client.ts`. Do not recreate the old duplicate under `src/utils` or introduce another global query client.

## Rendering and data ownership

Next.js server components and route handlers are used where server-side access, SEO, or secure cookies matter. Client components are used for interaction, local state, TanStack Query subscriptions, forms, and Socket.IO.

The ownership rule is simple:

- The backend is the source of truth for users, permissions, catalog, stock, carts, wishlists, orders, addresses, and chat persistence.
- TanStack Query is the frontend cache for server state.
- Zustand is for guest commerce state and local UI state, not authoritative order or inventory data.
- Form state belongs to React Hook Form and is validated with Zod where the feature defines a schema.
- The UI can be optimistic, but it must reconcile with the backend response and invalidate the relevant query.

## BFF and API policy

The catch-all route at `/api/backend/[...path]` is intentionally allowlisted. The allowlist prevents the browser from turning the BFF into an arbitrary proxy and makes the frontend/backend contract visible in one place.

When adding an endpoint:

1. Add or update the backend route and DTO first.
2. Add the endpoint constant and typed service method under `src/services/api/v1`.
3. Add a BFF policy entry only for the exact method/path needed by the UI.
4. Add a hook under `src/hooks` if the operation is server state.
5. Update invalidation and error handling for the affected query keys.
6. Add tests for both the policy and the feature behavior.

Do not bypass the typed service layer with ad hoc `fetch` calls scattered through components. It makes auth refresh, error normalization, and cache invalidation inconsistent.

## Authentication flow

```text
login form
  -> POST /api/auth/login
  -> Next route handler calls backend /auth/login
  -> HttpOnly access/refresh cookies + signed UI session

authenticated browser request
  -> POST/GET /api/backend/*
  -> Next reads access cookie on the server
  -> backend receives Authorization: Bearer <access token>

expired access token
  -> server-side refresh is single-flight
  -> cookies are rotated
  -> original request is retried once
```

The proxy redirects anonymous visitors away from account, checkout, orders, order confirmation, and admin pages. That redirect is not the security boundary: the backend still authenticates every protected request and checks permissions/ownership.

The `/api/auth/socket-token` handler gives the browser a short-lived access token for the Socket.IO handshake. It is not a persistent browser session token and should never be placed in localStorage.

## Catalog flow

Catalog pages support two modes:

- server-side catalog adapters for initial page rendering and SEO;
- browser-side typed clients and TanStack Query for filters, facets, cursor pagination, and load-more interactions.

The cursor returned by the backend is opaque to the UI. Treat it as a continuation token, not as a page number or sortable product identifier.

## Commerce flow

Guest cart and wishlist state is persisted locally until the user signs in. The frontend then calls backend merge endpoints. The backend decides how conflicts are resolved and remains authoritative.

Checkout submits the selected address/cart state to the backend. The backend creates a pending order and owns stock deduction and expiry. The frontend should render the returned order state and should not assume that a successful button click means payment capture or permanent inventory reservation.

## Admin flow

Admin pages use the same typed API boundary as the storefront but call permission-protected backend routes. Product editing uses the complete variant-matrix replacement flow. The older individual variant `PATCH`/`DELETE` endpoints remain compatibility routes in the backend and are not part of the active frontend workflow.

Product images use a three-step flow:

1. request a backend presigned upload URL;
2. upload directly to R2 from the browser;
3. persist image metadata through the backend.

The browser never receives R2 secret credentials. `next.config.ts` limits remote images to `NEXT_PUBLIC_PRODUCT_IMAGE_ORIGIN` and the product path.

## Realtime chat flow

The `SocketProvider` is responsible for connection lifecycle. It checks the feature flag, obtains a short-lived token, connects to the configured Socket.IO URL/path and `/chat` namespace, and handles reconnect/auth retry behavior.

HTTP remains the source for conversation history and durable mutations. Socket.IO is the low-latency delivery path for room events such as `message:created`. If the websocket is unavailable, the application should continue to use the HTTP state it can load; realtime is an enhancement, not the persistence layer.

The backend currently has process-local Socket.IO rooms because a Redis adapter is not configured. Do not assume messages fan out between backend instances.

## Security and headers

The frontend disables the `X-Powered-By` header, enables React strict mode, and sends browser security headers including `nosniff`, `X-Frame-Options: DENY`, a strict referrer policy, and a restrictive permissions policy. Keep `BACKEND_API_URL`, `AUTH_SESSION_SECRET`, and all backend credentials server-side. Only variables intentionally prefixed `NEXT_PUBLIC_` are exposed to the browser.

## Testing strategy

- Vitest covers pure utilities, hooks, route handlers, policy decisions, and components.
- Testing Library exercises component behavior from the user’s perspective.
- Playwright covers browser navigation and end-to-end flows that cross route handlers and the backend.
- TypeScript and ESLint catch contract and boundary mistakes before runtime.

Prefer testing behavior at the narrowest useful boundary. For a BFF change, test the allowlist, cookie/refresh behavior, and a representative browser flow rather than only testing an implementation detail.

## Deployment boundary

The Next.js server must be able to reach `BACKEND_API_URL`. The browser must be able to reach `NEXT_PUBLIC_SOCKET_URL` if chat is enabled. The backend must list the public frontend origin in `CORS_ORIGINS`, and both sides must agree on the Socket.IO path and namespace.

The deployment should provide a strong `AUTH_SESSION_SECRET`, a correct `SITE_URL`, the public product-image origin, and no secrets in client-exposed variables. Build-time and runtime environment behavior should be verified because Next.js may inline some public variables into the client bundle.

## Documentation and change discipline

Keep this file about boundaries and decisions. Keep commands and setup in the root README. Keep exact backend request/response shapes in Swagger and typed service definitions. When a route, cookie, environment variable, cache key, query key, or deployment assumption changes, update the corresponding documentation in the same pull request.
