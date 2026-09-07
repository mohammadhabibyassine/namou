# namou frontend

The namou frontend is a Next.js storefront and administration console. It renders the public shop, customer account flows, checkout and orders, plus the admin tools for products, categories, attributes, orders, and chat.

The frontend is intentionally a backend-for-frontend (BFF). Browser requests go to same-origin Next.js route handlers. Those handlers call the NestJS backend server-side, keep persistent auth tokens in HttpOnly cookies, and expose only the backend paths that the UI is allowed to use.

The backend repository is `/Users/mohammadyassin/Documents/namou`. Read [the frontend architecture guide](docs/ARCHITECTURE.md) for the request flows and boundaries.

Next.js was chosen deliberately for this e-commerce storefront because SEO,
server-rendered product pages, metadata, and fast navigation matter more here
than using a client-only React application. Even if the project had only
specified a Node/Express environment and left the frontend choice open, I
would still use Next.js as the web layer so server rendering and the
storefront could live together in one well-organized codebase.

## Technology versions

These are the important versions installed in this repository on 2026-09-07. `package-lock.json` is authoritative for the complete dependency tree.

| Area              | Technology            | Version              |
| ----------------- | --------------------- | -------------------- |
| Runtime           | Node.js               | `22.22.3` (`.nvmrc`) |
| Framework         | Next.js               | `16.3.4`             |
| UI runtime        | React / React DOM     | `19.2.8`             |
| Language          | TypeScript            | `5.9.3`              |
| Data fetching     | TanStack Query        | `5.102.8`            |
| HTTP client       | Axios                 | `1.20.0`             |
| Client state      | Zustand               | `5.0.15`             |
| Forms and schemas | React Hook Form / Zod | `7.87.0` / `4.5.4`   |
| Realtime          | Socket.IO client      | `4.8.3`              |
| Auth primitives   | `jose`                | `6.2.12`             |
| Styling           | Tailwind CSS          | `4.3.3`              |
| Unit tests        | Vitest                | `5.0.0`              |
| Browser tests     | Playwright            | `1.63.0`             |
| Quality           | ESLint / Prettier     | `9.39.5` / `3.9.6`   |

## Requirements

- Node.js `22.22.3`
- npm
- A running namou backend on port `3000` for authenticated and data-backed pages
- PostgreSQL, Redis, and R2 are needed by the backend, not directly by this Next.js process

## Local setup

```bash
nvm use
npm install
cp .env.example .env.local
```

Set the local values in `.env.local`:


```dotenv
BACKEND_API_URL="http://localhost:3000"
BACKEND_REQUEST_TIMEOUT_MS="10000"
SITE_URL="http://localhost:3001"
NEXT_PUBLIC_PRODUCT_IMAGE_ORIGIN="https://your-public-r2-domain.example.com"
AUTH_SESSION_SECRET="replace-with-a-separate-random-secret-at-least-32-characters"
AUTH_REFRESH_TTL_DAYS="30"
NEXT_PUBLIC_CHAT_ENABLED="true"
NEXT_PUBLIC_SOCKET_URL="http://localhost:3000"
NEXT_PUBLIC_SOCKET_PATH="/socket.io"
NEXT_PUBLIC_SOCKET_WEBSOCKET_ONLY="true"
```

Generate a real local session secret instead of using the example value:

```bash
openssl rand -base64 48
```

Start the backend first, then run:

```bash
npm run dev
```

The storefront is available at `http://localhost:3001`.

`BACKEND_API_URL` is server-side configuration and must not be exposed as a browser variable. `NEXT_PUBLIC_SOCKET_URL` is public because the browser needs it for the realtime handshake; the socket token itself is short-lived and issued by `/api/auth/socket-token`.

## Routes

### Public storefront

- `/` — home page
- `/shop` — product listing and facets
- `/shop/[slug]` — product detail
- `/categories` — category browsing
- `/drops` — curated drops view
- `/cart` and `/wishlist` — commerce state
- `/login` and `/signup` — authentication entry points

### Customer area

- `/account` and `/account/addresses`
- `/checkout`
- `/orders` and `/orders/[orderId]`
- `/order-confirmation/[orderId]`

### Admin area

- `/admin`
- `/admin/products`, `/admin/products/new`, `/admin/products/[productId]`
- `/admin/categories`
- `/admin/attributes`
- `/admin/orders`, `/admin/orders/[orderId]`
- `/admin/chat`

The route proxy protects account, checkout, order, and admin paths before rendering. The backend remains authoritative and repeats authentication, permission, and ownership checks.

## Authentication model

The browser never stores persistent access or refresh tokens in JavaScript-accessible storage.

```text
browser -> /api/auth/login
       -> Next route handler calls backend /auth/login
       -> HttpOnly cookies are set by Next

browser -> /api/backend/*
       -> BFF reads access cookie server-side
       -> allowlisted backend request receives bearer token

expired access token
       -> server performs one refresh request
       -> cookies rotate, original request is retried once
```

The signed UI session is separate from the backend access token. It helps the Next.js app render user state, but it does not replace backend authorization.

## Data fetching and state

- TanStack Query owns server state: catalog, cart, wishlist, orders, addresses, admin data, and chat HTTP data.
- Axios service modules under `src/services/api/v1` define the typed backend calls.
- Hooks under `src/hooks` are the canonical query/mutation boundary used by pages and components.
- `src/features` contains feature-specific adapters for forms and views.
- Zustand stores guest cart/wishlist and local UI/session state.
- Guest cart and wishlist can be merged into the authenticated account through backend merge endpoints.
- Catalog pages support server-side loading for SEO and browser-side cursor pagination/load-more behavior.

Do not call the NestJS backend directly from a client component when the request contains authenticated data. Add or use a BFF allowlist entry and a typed service method instead.

## Product images

Product image upload is implemented. Admin UI code requests a presigned URL from the backend, uploads the file directly to Cloudflare R2, then records the image metadata. The frontend does not need R2 secret credentials and does not proxy the image bytes through Next.js.

The image origin is restricted by `next.config.ts` to the configured public origin and the `/products/**` path. Keep that origin exact in deployment.

## Chat

Chat has both HTTP and realtime paths. Conversation history and administrative operations use the BFF. Live events use Socket.IO with the `/chat` namespace.

The provider obtains a short-lived socket token from the Next.js server route, connects using the configured socket URL/path, joins conversation rooms, and handles `message:created`. If chat is disabled with `NEXT_PUBLIC_CHAT_ENABLED=false`, the provider does not connect.

The backend currently has no Socket.IO Redis adapter, so realtime room delivery is process-local when the backend has multiple instances. Redis-backed rate limiting still works across instances; cross-instance chat fan-out requires a future adapter and deployment test.

## Commands

```bash
npm run dev             # Next.js development server on port 3001
npm run build           # production build
npm run start           # serve the production build
npm run lint            # ESLint with zero warnings allowed
npm run typecheck       # TypeScript without emitting files
npm run test            # Vitest unit/component tests
npm run test:e2e        # Playwright browser tests
npm run format          # Prettier write
npm run format:check    # Prettier verification
npm run check           # lint + typecheck + unit tests
```

Before a frontend change is ready, run `npm run check`, `npm run test:e2e`, `npm run format:check`, and `npm run build` when the change affects routing, environment variables, rendering, or deployment.

## Deployment

Build and run the Next.js application in an environment that can reach the backend:

```bash
npm ci
npm run build
npm run start
```

Set `BACKEND_API_URL` to the private or controlled backend origin, `SITE_URL` to the public frontend origin, a strong `AUTH_SESSION_SECRET`, the correct product image origin, and the Socket.IO settings used by the deployment. Keep backend-only variables out of `NEXT_PUBLIC_*`.

The frontend and backend origins must be coordinated: the backend `CORS_ORIGINS` must include the frontend origin for API and Socket.IO access, and the socket path/namespace must match both sides.

## Current product boundaries

- Checkout creates a pending order; there is no payment-provider capture flow yet.
- The backend owns inventory and order transitions; the frontend does not treat optimistic UI as final stock truth.
- Product image uploads are direct-to-R2 and require backend storage configuration.
- Cursor pagination is intentional for catalog data; do not assume page-number semantics.
- Route protection in Next.js is a user experience and early rejection layer, not a replacement for NestJS guards.

## Documentation conventions

Documentation is easiest to keep healthy when each file has one job:

- `README.md` answers “what is this, how do I run it, and what commands do I need?”
- `docs/ARCHITECTURE.md` explains request paths, ownership, state, and cross-service decisions.
- The backend Swagger document is the exact API contract; prose docs explain how to use it and why it is shaped that way.
- Environment variables are documented by purpose, with secrets shown only as placeholders.
- Current behavior, limitations, and planned work are labeled separately.
- Route, API, auth, environment, or deployment changes should update the relevant docs in the same change.

Good documentation should be useful to a new developer at 2 a.m.: it should be explicit, copy-pasteable, honest about limitations, and written around the decisions a person actually has to make.
