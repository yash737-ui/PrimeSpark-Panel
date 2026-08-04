# PowerSpark Panel

PowerSpark Panel is a Minecraft server hosting control panel. This repository
currently contains the **project foundation only** — a clean, scalable
monorepo structure with no application features implemented yet.

## Status

🧱 **Foundation stage.** Authentication, dashboard, server management, and API
features have not been built yet. See `PROJECT_PROGRESS.md` for what's done
and `DEVELOPMENT_LOG.md` for a running history of changes.

## Stack

**Frontend** (`apps/web`)
- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui

**Backend** (`apps/api`)
- Node.js
- Express
- TypeScript
- Prisma ORM

**Database**
- PostgreSQL

**Tooling**
- pnpm workspaces (monorepo)
- ESLint + Prettier

> Minecraft server processes will later be managed natively via Node.js
> `child_process` — no Docker dependency is used in this project.

## Monorepo Structure

```
powerspark-panel/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/           # Express + Prisma backend
├── packages/
│   ├── ui/             # Shared shadcn/ui components
│   ├── config/       # Shared tooling config (eslint/tailwind presets)
│   └── types/         # Shared TypeScript types
├── prisma/
│   └── schema.prisma   # Database schema (no models defined yet)
├── .env.example
├── pnpm-workspace.yaml
└── package.json
```

## Getting Started

### Prerequisites
- Node.js >= 20
- pnpm >= 9
- PostgreSQL instance (local or remote)

### Setup

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Generate the Prisma client
pnpm prisma:generate
```

### Development

```bash
# Run the web app
pnpm dev:web

# Run the API
pnpm dev:api
```

## Documentation

- [`PROJECT_PROGRESS.md`](./PROJECT_PROGRESS.md) — checklist of what has been
  built so far.
- [`DEVELOPMENT_LOG.md`](./DEVELOPMENT_LOG.md) — dated log of development
  activity.

## License

Not yet decided.
