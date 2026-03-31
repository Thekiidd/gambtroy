# GambTroy

Base técnica inicial del proyecto **Gambling Destroy** siguiendo el plan `GAMBTROY_PLAN_TECNICO.md`.

## Qué se implementó en este arranque

- Monorepo con `pnpm workspaces` + `turbo`.
- App web (`apps/web`) en Next.js 14 con landing inicial del MVP.
- API (`apps/api`) en Fastify con:
  - seguridad base (`helmet`, `cors`, `rate-limit`, `jwt`),
  - endpoints iniciales de auth (`/register`, `/login`, `/me`),
  - endpoint de salud (`/health`).
- Schema Prisma completo de la versión 1.0 del plan técnico.
- Docker compose para PostgreSQL + Redis.

## Instalación

```bash
pnpm install
cp apps/api/.env.example apps/api/.env
docker compose -f docker/docker-compose.yml up -d
pnpm dev
```

## URLs

- Web: http://localhost:3000
- API: http://localhost:3001
- Health check: http://localhost:3001/health

## Próximo paso sugerido

Implementar persistencia real en auth con Prisma (registro/login) y middleware de auditoría por endpoint.
