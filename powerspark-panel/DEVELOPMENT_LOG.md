# PowerSpark Panel — Development Log

A running, dated log of development activity. Add a new entry each time
meaningful work is done on the project.

---

## 2026-08-03 — Project Foundation

**Type:** Scaffolding

Created the initial monorepo foundation for PowerSpark Panel. No application
logic, authentication, dashboard, server management, or API features were
implemented — this step was structure only.

**Added:**
- pnpm workspace monorepo (`apps/*`, `packages/*`)
- `apps/web`: Next.js 15 + React + TypeScript + Tailwind CSS + shadcn/ui setup
- `apps/api`: Node.js + Express + TypeScript scaffold with a single `/health` route
- `prisma/schema.prisma`: PostgreSQL datasource configured, no models yet
- `packages/ui`, `packages/config`, `packages/types`: empty shared package scaffolds
- Root-level ESLint, Prettier, `.env.example`, `.gitignore`
- `README.md`, `PROJECT_PROGRESS.md`, `DEVELOPMENT_LOG.md`

**Decisions:**
- No Docker — Minecraft server instances will run as native Linux processes
  via Node.js `child_process` in a later step.
- shadcn/ui components will be generated on-demand into `packages/ui` rather
  than pre-generating a full component set.

**Next step:** Define the Prisma data models (users, Minecraft servers,
sessions/roles) — see the prompt provided at the end of the foundation setup.

---

## 2026-08-04 — Development Environment Setup & Preview

**Type:** Verification / Configuration

Set up and verified the development environment. No application logic
(auth, dashboard, server management, file manager, console, billing) was
added — this step was setup, verification, and a preview landing page only.

**Added / Changed:**
- `.env` created locally from `.env.example`
- `apps/api/src/index.ts`: added `GET /health/db` — checks PostgreSQL
  connectivity via `prisma.$queryRaw` (alongside the existing `GET /health`
  liveness check)
- `apps/web/src/app/page.tsx`: built the PowerSpark Panel landing page —
  nav bar with placeholder links, hero section, feature grid, footer;
  blue premium theme; fully responsive
- `apps/web/src/app/globals.css`: shifted CSS variable theme tokens to a
  blue primary color (light + dark mode)
- Dependency audit: cross-referenced every `import`/`require` against each
  `package.json` and added what was missing:
  - `apps/web`: `tailwindcss-animate`, `@eslint/eslintrc`
  - `apps/api`: `@eslint/js`, `typescript-eslint`
  - root: `@eslint/js`, `typescript-eslint`, `eslint`, `prettier-plugin-tailwindcss`

**Verification performed:**
- All JSON config files across the repo parse successfully
- All `.ts`/`.tsx` source files pass a TypeScript syntax check (no parse errors)
- `pnpm-workspace.yaml` structure confirmed correct
- Prisma schema manually reviewed — valid `generator`/`datasource` blocks
- Tailwind config content paths and PostCSS pipeline confirmed correct
- shadcn/ui `components.json` and `cn()` utility confirmed in place

**Known limitation:** this sandbox has no outbound network access, so
`pnpm install`, `pnpm dev:web`, `pnpm dev:api`, and `prisma generate` could
not be executed live here. All checks above were done statically. These
commands should be run on a machine with network access to complete a live
boot test — see README.md for exact commands.

**Next step:** Build the authentication module.

---

## 2026-08-04 — Authentication System

**Type:** Feature (Backend + Frontend)

Built the full authentication module end to end. No server management,
dashboard, file manager, console, or billing logic was added — this step
was authentication only, as scoped.

**Prisma (`prisma/schema.prisma`):**
- Added `Role` enum (`ADMIN`, `USER`)
- Added `User` model (email, hashed password, name, role, emailVerified)
- Added `RefreshToken` model — tokens stored hashed, rotated on every use,
  revocable
- Added `EmailVerificationToken` and `PasswordResetToken` models — both
  store only a hash of the token, single-use (`usedAt`), time-limited
- Added `AuditLog` model — append-only, indexed on `userId` and `action`

**Backend (`apps/api`):**
- `src/lib/prisma.ts` — Prisma client singleton (avoids connection-pool
  exhaustion on dev hot-reload)
- `src/lib/password.ts` — bcrypt hashing/comparison (configurable salt
  rounds via `BCRYPT_SALT_ROUNDS`)
- `src/lib/tokens.ts` — cryptographically random raw tokens for
  verification/reset links; SHA-256 hash stored at rest
- `src/lib/jwt.ts` — access token (15m default) + refresh token (7d
  default) signing/verification
- `src/lib/audit.ts` — `recordAuditLog()` + `AuditAction` constants;
  failures are logged, never thrown, so audit logging can't break auth
- `src/middleware/validate.ts` — generic zod validation middleware,
  returns field-level error messages
- `src/middleware/authenticate.ts` — verifies the `Authorization: Bearer`
  access token, attaches `req.user`
- `src/middleware/authorize.ts` — RBAC middleware (`authorize("ADMIN")`),
  ready for future protected routes; not yet applied to any route beyond
  the example `GET /api/auth/me`
- `src/middleware/error-handler.ts` — centralized error handler
- `src/modules/auth/{auth.service,auth.controller,auth.routes}.ts` —
  register, login, logout, refresh (rotating), forgot-password,
  reset-password, verify-email, me
- Refresh tokens are delivered as an httpOnly, `SameSite=Lax` cookie
  scoped to `/api/auth`, not returned in the JSON body
- `src/index.ts` — wired in `cookie-parser`, CORS with `credentials: true`
  restricted to `CLIENT_URL`, mounted `/api/auth`, added the error handler

**Frontend (`apps/web`):**
- `src/app/(auth)/layout.tsx` — shared centered layout with PowerSpark
  branding
- `src/app/(auth)/login/page.tsx`, `register/page.tsx`,
  `forgot-password/page.tsx`, `reset-password/page.tsx`,
  `verify-email/page.tsx` — built with `react-hook-form` +
  `@hookform/resolvers/zod`, validated against the same zod schemas the
  backend uses
- `src/lib/api-client.ts` — typed fetch wrapper (`credentials: "include"`
  for the refresh cookie, normalizes errors into `ApiError`)
- `src/lib/auth-api.ts` — one function per auth endpoint

**Shared packages:**
- `packages/types/src/schemas/auth.ts` — zod schemas
  (`registerSchema`, `loginSchema`, `forgotPasswordSchema`,
  `resetPasswordSchema`, `verifyEmailSchema`), used by both apps
- `packages/types/src/auth.ts` — `Role`, `AuthUser`, API response shapes
- `packages/ui/src/{button,input,label,card}.tsx` — first real shadcn/ui
  components, built out to support the auth forms

**Design decisions:**
- Refresh tokens rotate on every use and are stored hashed — a stolen,
  already-used refresh token cannot be replayed
- Password reset invalidates all of a user's existing sessions
  (all refresh tokens revoked in the same transaction)
- Login/forgot-password responses don't reveal whether an email is
  registered, to avoid user enumeration
- Email verification and password reset are structurally complete but no
  email provider is wired up yet — the raw token is only echoed back in
  the API response when `NODE_ENV !== "production"`, so the flow can be
  tested end-to-end today and swapped for real email sending later
  without changing the token logic

**Verification performed:** every new/changed `.ts`/`.tsx` file across
`apps/api`, `apps/web`, `packages/ui`, and `packages/types` passed a
TypeScript syntax check; every `package.json` was cross-referenced against
actual `import`/`require` statements and missing dependencies were added;
all JSON configs validated.

**Known limitation (same as Step 2):** no outbound network access in this
sandbox, so `pnpm install`, live dev servers, and `prisma migrate dev`
against a real database were not executed here — verification was static.

**Next step:** Prisma data models and API/UI for Minecraft server
management (server dashboard groundwork).
