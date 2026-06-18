# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**Ageris** (package/repo name `boip`) — a marketplace for buying and selling cattle. Sellers list cattle *lots* with detailed profiles; buyers browse, filter, and pay via PIX. One Spring Boot backend serves two frontends: an Expo React Native mobile app and a Next.js web app.

```
backend/              Spring Boot API (Java 21, com.boip.backend)
frontend/boi-app/     Expo React Native (TypeScript) — primary client
frontend/boi-web/     Next.js 16 web app
secrets/              firebase-service-account.json (git-ignored)
start.py              Full-stack dev orchestrator (tunnel + docker + webhook + expo)
docker-compose.yml    db (postgres:16) + backend
```

## Commands

### Backend (`backend/`)
- Build: `./mvnw clean package` (use `mvnw.cmd` on Windows shells)
- Run all tests: `./mvnw test`
- **Run a single test class**: `./mvnw test -Dtest=ListingControllerTest`
- Run a single method: `./mvnw test -Dtest=ListingControllerTest#methodName`
- Integration tests (`*IT.java`) spin up **Testcontainers PostgreSQL** — Docker must be running.

### Full stack (from repo root)
- `python start.py` — the intended dev entrypoint. Starts a cloudflared tunnel, rewrites `.env` with the tunnel URL + a fresh webhook auth token, brings up Docker (db + backend), registers the Asaas webhook, then launches Expo. `Ctrl+C` cleans up the webhook and stops everything. Without this, Asaas payment webhooks cannot reach a local backend.
- `make up` / `make down` / `make reset` (WIPES DB volume) / `make backend-logs` / `make db-shell` — Docker lifecycle. See `Makefile` for the full list.

### Frontends
- Mobile: `cd frontend/boi-app && npx expo start` (`npm run lint` to lint)
- Web: `cd frontend/boi-web && npm run dev` / `npm run build` / `npm run lint`

## Architecture — the load-bearing decisions

**No user roles.** Everyone is an `AppUser`. Any user can both sell (create listings) and buy. `sellerUserId` on a `Listing` means "the user who created it", not a role/permission. Don't add role checks; authorization is ownership-based.

**Auth is a two-step identity split (Firebase ↔ AppUser):**
1. Firebase Authentication owns credentials. The frontend obtains an ID token and sends it as `Authorization: Bearer <token>` on every request.
2. `FirebaseTokenFilter` (in `auth/`) verifies the token on each request. If an `AppUser` row exists for the Firebase UID, it becomes the principal with `ROLE_USER`. **If not**, the principal is a lightweight `AuthUser` record with *no authorities* — authenticated by Firebase but not yet onboarded.
3. `POST /auth/onboard` creates the `AppUser`. **Email always comes from the verified Firebase token, never the request body.**

This split is why `GET /auth/me` is `permitAll` (a freshly-signed-up user has a token but no AppUser yet and needs to check status). `SecurityConfig` whitelists exactly the endpoints reachable before onboarding — be deliberate when changing that list.

**Webhook auth is separate from Firebase.** `/api/webhooks/**` is `permitAll` in Spring Security but guarded by a shared-secret header validated in `security/WebhookTokenVerifier`. The secret (`APP_WEBHOOK_AUTH_TOKEN`) is generated per-run by `start.py`. These endpoints are called by Asaas and by `start.py` itself, not by app users.

**Rate limiting** (`config/RateLimitInterceptor`, Bucket4j, in-memory): `POST /api/payments/{id}` is limited per Firebase UID (10/min); `POST /auth/onboard` per IP (5/hour). The bucket map grows unbounded — fine only for single-instance scale.

**Payments (Asaas, PIX):** Buyer calls `POST /api/payments/{listingId}` → backend lazily creates an Asaas customer (stored as `asaasCustomerId` on AppUser) on first purchase, then a PIX charge. Frontend polls `GET /api/listings/{id}` until status is `SOLD`. The `PAYMENT_CONFIRMED` webhook flips the listing to `SOLD` and triggers the seller payout (PIX or TED) minus a 5% platform commission (`TransferService`).

**Listing lifecycle:** `DRAFT → ACTIVE → PAUSED → SOLD / CANCELLED`, enforced in `ListingService` via `PATCH /api/listings/{id}/status`. Listings start as `DRAFT`.

### Domain model (`entity/`)
- `CattleLot` — a physical lot (owned by a user, has a `locationId` + optional coordinates).
- `CattleLotProfile` — **versioned** profile of a lot (breed, sex, purpose, weight, age). History is queryable via `GET /api/lots/{id}/profile/history`.
- `Listing` — the ad to sell a lot. `ListingResponseDto` embeds a `LotSummaryDto` (null if the lot was deleted).
- `ListingMedia` — slots 0–2 are IMAGE, slot 3 is VIDEO; stored in Firebase Storage at `listings/{userId}/{lotId}/{slot}.jpg`. The backend needs `FIREBASE_STORAGE_BUCKET` set to clean these up on listing delete.
- `Location` — UF (char(2)) + municipality, seeded by Flyway.
- `UserPayoutInfo` — PIX or TED payout details, validated by the cross-field `@ValidPayoutInfo` (`validation/`).

**Portuguese enum values are stored in the DB** (changed from English in V9): Purpose = `Corte`/`Leite`/`Reprodução`/`Misto`; Sex = `M`/`F`/`MIXED` (displayed as Macho/Fêmea/Misto). Don't reintroduce English constants.

### Backend layout
Standard layered split under `com.boip.backend`: `controller/` → `service/` → `repository/` (Spring Data JPA), with `dto/`, `mapper/`, `entity/`, `exception/` (global handler), `validation/` (custom validators), `auth/` + `security/` + `config/`. Schema is **Flyway-managed** (`resources/db/migration/V*.sql`) and JPA runs with `ddl-auto=validate` — every schema change must be a new migration; never let Hibernate auto-DDL.

### Config
- `application.properties` (default/local) and `application-prod.properties`. Docker runs the backend with `SPRING_PROFILES_ACTIVE=local`, `ddl-auto=validate`, and mounts the Firebase key read-only at `/run/secrets/`.
- Error responses are deliberately stripped (`server.error.include-*=never/false`) — don't loosen this to "debug" prod.
- Locale is fixed to `pt_BR`.
- CORS allowed origins via `APP_CORS_ALLOWED_ORIGINS` (`config/CorsConfig`).

## Frontend notes
- Both apps talk only to the backend REST API and to Firebase (Auth + Storage) directly. API base URLs: `EXPO_PUBLIC_API_BASE` (mobile), `NEXT_PUBLIC_API_BASE` (web). Physical phones must use the LAN IP, not `localhost`.
- `frontend/boi-app/app/` uses Expo Router file-based routing: `auth/`, `(tabs)/` (feed, profile, my-lots), `listing/create.tsx` (full lot→profile→media-upload→listing→activate flow), `payment/[chargeId].tsx` (PIX polling), `payout-info.tsx`.
- `frontend/boi-web` has its own `CLAUDE.md`/`AGENTS.md` (Next.js 16). Treat that file's claims about reading `node_modules/next/dist/docs/` with skepticism — verify against the actual installed Next version before acting on it.

## Environment / secrets
- `secrets/firebase-service-account.json` is required and git-ignored. Backend won't start without it.
- Root `.env` (backend + Docker), `frontend/boi-app/.env`, `frontend/boi-web/.env.local` — all derive from `.env.example` files. Asaas defaults to the **sandbox** base URL. See `README.md` for the full first-time setup (Firebase project, Storage rules, Asaas key).
