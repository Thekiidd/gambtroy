# GambTroy

MVP demo base for **GambTroy** with English-standardized code, bilingual UI (`es`/`en`), and functional demo flows for auth, blocklist, losses, and guardians.

## Current scope

- Monorepo with `pnpm` workspaces + `turbo`.
- Web app (`apps/web`) with locale routes:
  - `/es`
  - `/en`
  - `/[locale]/legal`
- API app (`apps/api`) with demo endpoints:
  - `POST /api/v1/auth/register`
  - `POST /api/v1/auth/login`
  - `GET /api/v1/auth/me`
  - `GET/PATCH /api/v1/users/profile`
  - `GET/POST/PATCH/DELETE /api/v1/blocklist`
  - `GET/POST /api/v1/losses` + `/summary`
  - `POST/GET/PATCH /api/v1/guardian`
- Prisma schema (full spec v1.0 from technical plan).
- Docker compose for PostgreSQL + Redis.

> Note: current API persistence is in-memory demo storage to validate full MVP interaction before wiring Prisma services.

## Run

```bash
pnpm install
cp apps/api/.env.example apps/api/.env
docker compose -f docker/docker-compose.yml up -d
pnpm dev
```

## Branding

- Product name: **GambTroy**
- Palette: professional blue scale (`#2563eb`, `#3b82f6`) on light neutral backgrounds.

## Next implementation step

Replace in-memory storage with Prisma repositories + migrations + tests.
