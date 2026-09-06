# Namou Frontend

Production-oriented Next.js storefront and operations UI for Namou. The visual language is based on the Stitch references in [`designs`](./designs): warm stone surfaces, black technical panels, condensed display typography, and an acid-lime interaction accent.

## Requirements

- Node.js 22.22.3 (`.nvmrc`)
- The Namou Nest API running locally or reachable from the server runtime

## Local setup

```bash
nvm use
npm install
cp .env.example .env.local
npm run dev
```

The frontend runs at [http://localhost:3001](http://localhost:3001). The default API URL is [http://localhost:3000](http://localhost:3000).

Generate a unique session secret before starting the app:

```bash
openssl rand -base64 48
```

Place the result in `AUTH_SESSION_SECRET` inside `.env.local`. Do not reuse the Nest JWT secret.

## Quality commands

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run test:e2e
```

`npm run check` runs lint, type checking, and unit tests together.

## Application structure

- `src/app` — route groups, metadata, protected layouts, auth handlers, and the allowlisted backend-for-frontend proxy.
- `src/components` — responsive storefront, account, checkout, order, admin, chat, and shared UI components.
- `src/hooks` — canonical TanStack Query hooks for backend state and authentication workflows.
- `src/services/api/v1` — typed Axios service modules aligned to Nest controllers and DTOs.
- `src/store` — existing application slices for session-synchronized UI state.
- `src/stores` — provider-scoped, validated, persisted guest cart and wishlist state.
- `src/features` — thin view adapters and form schemas; API adapters delegate to `src/services/api/v1`.
- `src/lib` — server authentication, query keys, safe formatting/navigation, Socket.IO, and API utilities.
- `designs` — original Stitch desktop/mobile HTML and screenshots used as visual references.
- `docs/ARCHITECTURE.md` — data ownership, security, realtime behavior, route/API mapping, and known backend gaps.

## Security model

The browser never receives persistent access or refresh tokens. Login and registration use same-origin Next route handlers that store tokens in `HttpOnly` cookies. Client API calls pass through an explicit `/api/backend/*` route allowlist. A single-flight refresh queue prevents parallel requests from replaying the backend's rotating refresh token.

Protected layouts cryptographically verify a minimal signed UI session before rendering. Permission checks improve navigation and UX, while the Nest guards remain the authorization authority.

## Backend-aware limitations

- Checkout creates an order; the current backend does not expose a payment-provider or payment-intent flow, so the UI does not simulate one.
- The backend has no dedicated admin product list/detail endpoint. The admin product surface uses the public active catalog and clearly limits editing that needs inactive product metadata.
- Product images are URL-based because no upload/storage endpoint is exposed yet.
- Catalog pagination is cursor-based, so interfaces use load-more behavior rather than invented page counts.

See [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) for the full contract map and implementation decisions.
