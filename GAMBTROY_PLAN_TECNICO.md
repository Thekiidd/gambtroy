# GambTroy — Plan Técnico Completo
> **Gambling Destroy** · Plataforma web para romper la adicción al juego
> Versión: 1.0 · Estado: Listo para desarrollo

---

## 1. Visión del Producto

GambTroy es una plataforma SaaS B2C que ayuda a personas con ludopatía a:
- Bloquear acceso a sitios de apuestas
- Registrar y visualizar pérdidas económicas
- Establecer metas de ahorro y pago de deudas
- Recibir apoyo emocional con IA
- Involucrar a un "guardián" (familiar/amigo) con permisos diferenciados

**Modelo de negocio:** Freemium → Plan Pro ($99 MXN/mes) → Plan Familia ($149 MXN/mes)

---

## 2. Stack Tecnológico

### Frontend
| Tecnología | Versión | Propósito |
|---|---|---|
| Next.js | 14 (App Router) | Framework React con SSR/SSG |
| TypeScript | 5.x | Tipado estático |
| Tailwind CSS | 3.x | Estilos utilitarios |
| shadcn/ui | latest | Componentes accesibles (Radix UI) |
| Zustand | 4.x | Estado global del cliente |
| React Query (TanStack) | 5.x | Cache y sincronización de datos |
| Recharts | 2.x | Gráficas de gastos y progreso |
| Framer Motion | 11.x | Animaciones y transiciones |
| React Hook Form | 7.x | Formularios con validación |
| Zod | 3.x | Validación de esquemas compartida |

### Backend
| Tecnología | Versión | Propósito |
|---|---|---|
| Node.js | 20 LTS | Runtime |
| Fastify | 4.x | API REST (más rápido que Express) |
| TypeScript | 5.x | Tipado |
| Prisma ORM | 5.x | ORM con migraciones |
| PostgreSQL | 16 | Base de datos principal |
| Redis | 7 | Sesiones, caché, rate limiting |
| BullMQ | 4.x | Colas de trabajo (emails, notificaciones) |
| Zod | 3.x | Validación de entrada en API |

### Autenticación y Seguridad
| Tecnología | Propósito |
|---|---|
| Auth.js (NextAuth v5) | Autenticación OAuth + Email |
| bcrypt | Hash de contraseñas |
| JWT (jose) | Tokens de sesión |
| Helmet.js | Headers HTTP seguros |
| express-rate-limit / @fastify/rate-limit | Rate limiting por IP/usuario |
| CSRF tokens | Protección CSRF en formularios |

### Infraestructura y DevOps
| Tecnología | Propósito |
|---|---|
| Docker + Docker Compose | Contenedores para dev y prod |
| GitHub Actions | CI/CD |
| Vercel | Deploy frontend |
| Railway / Render | Deploy backend + PostgreSQL |
| Upstash | Redis serverless |
| Cloudflare | CDN + DNS + WAF |
| Sentry | Monitoreo de errores |
| PostHog | Analytics de producto |

### Pagos
| Tecnología | Propósito |
|---|---|
| Stripe | Suscripciones y pagos |
| Conekta (opcional) | Pagos México (OXXO, tarjetas MX) |

---

## 3. Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENTE (Browser)                    │
│              Next.js 14 + TypeScript + Tailwind          │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS
┌────────────────────────▼────────────────────────────────┐
│                   API Gateway / BFF                      │
│              Next.js API Routes (Edge)                   │
│         Rate Limiting · Auth Middleware · CORS           │
└──────┬──────────────────────────────────────┬───────────┘
       │                                      │
┌──────▼──────────┐                  ┌────────▼──────────┐
│  Fastify API    │                  │  Auth Service     │
│  REST + WS      │                  │  Auth.js v5       │
│  Port 3001      │                  │  JWT + Sessions   │
└──────┬──────────┘                  └────────┬──────────┘
       │                                      │
┌──────▼──────────────────────────────────────▼──────────┐
│                    PostgreSQL 16                         │
│           (Prisma ORM · Migraciones · RLS)               │
└─────────────────────────┬───────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────┐
│                      Redis 7                             │
│         Sesiones · Caché · Rate Limit · BullMQ           │
└─────────────────────────────────────────────────────────┘
```

---

## 4. Modelo de Datos (Prisma Schema)

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── USUARIOS Y ROLES ───────────────────────────────────

enum Role {
  USER      // Apostador (usuario principal)
  GUARDIAN  // Familiar o amigo de confianza
  ADMIN     // Administrador de plataforma
}

enum Plan {
  FREE
  PRO
  FAMILY
}

model User {
  id            String   @id @default(cuid())
  email         String   @unique
  emailVerified DateTime?
  name          String
  passwordHash  String?
  role          Role     @default(USER)
  plan          Plan     @default(FREE)
  avatarUrl     String?
  phone         String?
  timezone      String   @default("America/Chihuahua")
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  deletedAt     DateTime? // soft delete

  // Relaciones
  profile       UserProfile?
  sessions      Session[]
  accounts      Account[]   // OAuth
  guardianLinks GuardianLink[] @relation("UserGuardian")
  wardLinks     GuardianLink[] @relation("GuardianUser")
  blocklist     BlockedSite[]
  losses        GamblingLoss[]
  challenges    Challenge[]
  savings       SavingGoal[]
  messages      SupportMessage[]
  notifications Notification[]
  subscription  Subscription?
  auditLogs     AuditLog[]
}

model UserProfile {
  id              String   @id @default(cuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  startDate       DateTime @default(now()) // Fecha inicio abstinencia
  longestStreak   Int      @default(0)     // Racha más larga en días
  currentStreak   Int      @default(0)
  totalLost       Decimal  @default(0) @db.Decimal(12,2)
  totalSaved      Decimal  @default(0) @db.Decimal(12,2)
  emergencyContact String?
  bio             String?
  isPublicProfile Boolean  @default(false)
  updatedAt       DateTime @updatedAt
}

// ─── AUTENTICACIÓN ──────────────────────────────────────

model Session {
  id           String   @id @default(cuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  token        String   @unique
  ipAddress    String?
  userAgent    String?
  expiresAt    DateTime
  createdAt    DateTime @default(now())
  @@index([userId])
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  provider          String  // google, github, etc
  providerAccountId String
  accessToken       String?
  refreshToken      String?
  expiresAt         Int?
  @@unique([provider, providerAccountId])
}

// ─── SISTEMA DE GUARDIANES ──────────────────────────────

model GuardianLink {
  id          String            @id @default(cuid())
  userId      String
  user        User              @relation("UserGuardian", fields: [userId], references: [id])
  guardianId  String
  guardian    User              @relation("GuardianUser", fields: [guardianId], references: [id])
  status      GuardianStatus    @default(PENDING)
  permissions GuardianPermission[]
  inviteToken String?           @unique
  invitedAt   DateTime          @default(now())
  acceptedAt  DateTime?
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt
  @@unique([userId, guardianId])
}

enum GuardianStatus {
  PENDING   // Invitación enviada
  ACTIVE    // Guardián activo
  REVOKED   // Acceso revocado
}

model GuardianPermission {
  id             String       @id @default(cuid())
  guardianLinkId String
  guardianLink   GuardianLink @relation(fields: [guardianLinkId], references: [id], onDelete: Cascade)
  permission     Permission
  granted        Boolean      @default(true)
  grantedAt      DateTime     @default(now())
  @@unique([guardianLinkId, permission])
}

enum Permission {
  VIEW_LOSSES         // Ver pérdidas económicas
  VIEW_STREAK         // Ver racha actual
  MANAGE_BLOCKLIST    // Agregar/quitar sitios bloqueados
  APPROVE_UNBLOCK     // Debe aprobar para desbloquear sitios
  VIEW_CHALLENGES     // Ver retos y metas
  EDIT_CHALLENGES     // Editar metas del usuario
  VIEW_MESSAGES       // Ver mensajes de apoyo (privacidad)
  RECEIVE_ALERTS      // Recibir alertas cuando el usuario tiene impulsos
  EMERGENCY_CONTACT   // Contacto de emergencia
}

// ─── BLOQUEO DE SITIOS ──────────────────────────────────

model BlockedSite {
  id          String      @id @default(cuid())
  userId      String
  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  domain      String      // ej: caliente.mx
  name        String      // ej: Caliente
  category    SiteCategory
  isActive    Boolean     @default(true)
  addedBy     String      // userId de quien lo agregó (puede ser guardián)
  requiresGuardianToUnblock Boolean @default(true)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  @@unique([userId, domain])
}

enum SiteCategory {
  CASINO
  SPORTS_BETTING
  POKER
  LOTTERY
  SLOTS
  OTHER
}

// ─── REGISTRO DE PÉRDIDAS ───────────────────────────────

model GamblingLoss {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  amount      Decimal  @db.Decimal(12,2)
  currency    String   @default("MXN")
  description String?
  platform    String?  // Caliente, Codere, etc
  date        DateTime
  isEstimate  Boolean  @default(false) // Si es estimado o exacto
  createdAt   DateTime @default(now())
  @@index([userId, date])
}

// ─── RETOS Y METAS ──────────────────────────────────────

model Challenge {
  id          String          @id @default(cuid())
  userId      String
  user        User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  type        ChallengeType
  title       String
  description String?
  targetValue Decimal?        @db.Decimal(12,2)  // Para metas económicas
  targetDays  Int?            // Para metas de días
  currentValue Decimal        @default(0) @db.Decimal(12,2)
  status      ChallengeStatus @default(ACTIVE)
  startDate   DateTime        @default(now())
  endDate     DateTime?
  completedAt DateTime?
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt
}

enum ChallengeType {
  DAYS_CLEAN    // Días sin apostar
  SAVE_MONEY    // Ahorrar X cantidad
  PAY_DEBT      // Pagar deuda
  CUSTOM        // Meta personalizada
}

enum ChallengeStatus {
  ACTIVE
  COMPLETED
  FAILED
  PAUSED
}

model SavingGoal {
  id           String   @id @default(cuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  name         String
  targetAmount Decimal  @db.Decimal(12,2)
  savedAmount  Decimal  @default(0) @db.Decimal(12,2)
  deadline     DateTime?
  emoji        String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

// ─── APOYO EMOCIONAL ────────────────────────────────────

model SupportMessage {
  id        String      @id @default(cuid())
  userId    String
  user      User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  role      MessageRole
  content   String      @db.Text
  sentiment String?     // positive, negative, neutral (análisis IA)
  isUrse    Boolean     @default(false) // Marcado como urgente
  createdAt DateTime    @default(now())
  @@index([userId, createdAt])
}

enum MessageRole {
  USER
  ASSISTANT
}

// ─── NOTIFICACIONES ─────────────────────────────────────

model Notification {
  id        String           @id @default(cuid())
  userId    String
  user      User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  type      NotificationType
  title     String
  body      String
  data      Json?
  read      Boolean          @default(false)
  createdAt DateTime         @default(now())
  @@index([userId, read])
}

enum NotificationType {
  STREAK_MILESTONE    // 7, 14, 30 días
  CHALLENGE_COMPLETE  // Reto completado
  GUARDIAN_ACTION     // Guardián hizo algo
  IMPULSE_LOGGED      // Registraste un impulso
  WEEKLY_SUMMARY      // Resumen semanal
  SYSTEM              // Mensaje del sistema
}

// ─── SUSCRIPCIONES ──────────────────────────────────────

model Subscription {
  id                 String   @id @default(cuid())
  userId             String   @unique
  user               User     @relation(fields: [userId], references: [id])
  stripeCustomerId   String?  @unique
  stripeSubId        String?  @unique
  plan               Plan
  status             String   // active, canceled, past_due
  currentPeriodEnd   DateTime?
  cancelAtPeriodEnd  Boolean  @default(false)
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
}

// ─── AUDITORÍA ──────────────────────────────────────────

model AuditLog {
  id         String   @id @default(cuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id])
  action     String   // ej: BLOCK_SITE, UNBLOCK_SITE, UPDATE_PERMISSION
  entityType String?  // ej: BlockedSite, GuardianLink
  entityId   String?
  metadata   Json?
  ipAddress  String?
  createdAt  DateTime @default(now())
  @@index([userId, createdAt])
}
```

---

## 5. Estructura de Carpetas

```
gambtroy/
├── apps/
│   ├── web/                          # Next.js 14 (Frontend)
│   │   ├── app/
│   │   │   ├── (auth)/               # Rutas de autenticación
│   │   │   │   ├── login/
│   │   │   │   ├── register/
│   │   │   │   └── verify/
│   │   │   ├── (dashboard)/          # Rutas protegidas (usuario)
│   │   │   │   ├── dashboard/
│   │   │   │   ├── blocklist/
│   │   │   │   ├── losses/
│   │   │   │   ├── challenges/
│   │   │   │   ├── support/
│   │   │   │   └── settings/
│   │   │   ├── (guardian)/           # Rutas del guardián
│   │   │   │   ├── guardian/
│   │   │   │   └── guardian/[userId]/
│   │   │   ├── (admin)/              # Rutas de administración
│   │   │   │   └── admin/
│   │   │   ├── api/                  # API Routes (BFF)
│   │   │   │   └── auth/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── components/
│   │   │   ├── ui/                   # shadcn/ui components
│   │   │   ├── dashboard/
│   │   │   ├── blocklist/
│   │   │   ├── guardian/
│   │   │   └── shared/
│   │   ├── lib/
│   │   │   ├── auth.ts
│   │   │   ├── api-client.ts
│   │   │   └── utils.ts
│   │   ├── hooks/
│   │   ├── stores/                   # Zustand stores
│   │   └── types/
│   │
│   └── api/                          # Fastify Backend
│       ├── src/
│       │   ├── routes/
│       │   │   ├── auth/
│       │   │   ├── users/
│       │   │   ├── blocklist/
│       │   │   ├── losses/
│       │   │   ├── challenges/
│       │   │   ├── guardian/
│       │   │   ├── support/          # AI chat
│       │   │   ├── notifications/
│       │   │   └── subscriptions/
│       │   ├── middleware/
│       │   │   ├── auth.middleware.ts
│       │   │   ├── permission.middleware.ts
│       │   │   ├── rate-limit.middleware.ts
│       │   │   └── audit.middleware.ts
│       │   ├── services/
│       │   │   ├── ai.service.ts      # Anthropic/OpenAI
│       │   │   ├── email.service.ts   # Resend
│       │   │   ├── stripe.service.ts
│       │   │   └── notification.service.ts
│       │   ├── jobs/                  # BullMQ workers
│       │   │   ├── email.job.ts
│       │   │   ├── streak.job.ts
│       │   │   └── summary.job.ts
│       │   ├── lib/
│       │   │   ├── prisma.ts
│       │   │   ├── redis.ts
│       │   │   └── logger.ts
│       │   └── app.ts
│       └── prisma/
│           ├── schema.prisma
│           └── migrations/
│
├── packages/
│   ├── shared-types/                 # Tipos compartidos frontend/backend
│   ├── zod-schemas/                  # Schemas de validación compartidos
│   └── ui-tokens/                    # Design tokens compartidos
│
├── docker/
│   ├── docker-compose.yml
│   ├── docker-compose.prod.yml
│   └── Dockerfile.*
│
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── deploy-web.yml
│       └── deploy-api.yml
│
├── turbo.json                        # Turborepo
├── package.json
└── README.md
```

---

## 6. Endpoints de la API

### Autenticación
```
POST   /auth/register          → Registro con email/password
POST   /auth/login             → Login → devuelve JWT
POST   /auth/logout            → Invalida sesión
POST   /auth/refresh           → Refresca JWT
POST   /auth/forgot-password   → Email de recuperación
POST   /auth/reset-password    → Cambia contraseña con token
GET    /auth/me                → Usuario actual
```

### Usuarios y Perfil
```
GET    /users/profile          → Perfil del usuario
PATCH  /users/profile          → Actualiza perfil
DELETE /users/account          → Elimina cuenta (soft delete)
GET    /users/stats            → Estadísticas generales
```

### Bloqueo de Sitios
```
GET    /blocklist              → Lista de sitios bloqueados
POST   /blocklist              → Agrega sitio
PATCH  /blocklist/:id/toggle   → Activa/desactiva (requiere guardián si aplica)
DELETE /blocklist/:id          → Elimina sitio
GET    /blocklist/catalog      → Catálogo de sitios predefinidos
POST   /blocklist/request-unblock/:id → Solicita desbloqueo al guardián
```

### Pérdidas
```
GET    /losses                 → Lista paginada de pérdidas
POST   /losses                 → Registra pérdida
PATCH  /losses/:id             → Edita pérdida
DELETE /losses/:id             → Elimina pérdida
GET    /losses/summary         → Resumen por período (semana, mes, año)
GET    /losses/chart           → Datos para gráfica
```

### Retos y Metas
```
GET    /challenges             → Lista de retos activos
POST   /challenges             → Crea reto
PATCH  /challenges/:id         → Actualiza progreso/estado
DELETE /challenges/:id         → Elimina reto
GET    /saving-goals           → Lista de metas de ahorro
POST   /saving-goals           → Crea meta de ahorro
PATCH  /saving-goals/:id       → Actualiza meta
```

### Guardián
```
POST   /guardian/invite        → Envía invitación por email
GET    /guardian/links         → Mis guardianes o mis tutelados
PATCH  /guardian/links/:id/accept → Acepta invitación
DELETE /guardian/links/:id     → Revoca acceso
GET    /guardian/links/:id/permissions → Permisos actuales
PATCH  /guardian/links/:id/permissions → Actualiza permisos
GET    /guardian/ward/:userId/dashboard → Dashboard del tutelado (guardian only)
POST   /guardian/approve-unblock/:requestId → Aprueba desbloqueo de sitio
```

### Apoyo / Chat IA
```
GET    /support/messages       → Historial de conversación
POST   /support/messages       → Envía mensaje, recibe respuesta IA
POST   /support/impulse        → Registra impulso superado (alerta al guardián)
```

### Notificaciones
```
GET    /notifications          → Lista de notificaciones
PATCH  /notifications/:id/read → Marca como leída
PATCH  /notifications/read-all → Marca todas como leídas
```

### Suscripciones
```
GET    /subscriptions/plans    → Planes disponibles
POST   /subscriptions/checkout → Crea sesión Stripe Checkout
POST   /subscriptions/portal   → Portal de billing Stripe
POST   /subscriptions/webhook  → Webhook Stripe (público)
```

---

## 7. Sistema de Permisos por Rol

```
                          USER    GUARDIAN   ADMIN
─────────────────────────────────────────────────
Ver propio dashboard       ✓        -          ✓
Ver dashboard de tutelado  -        ✓*         ✓
Registrar pérdidas         ✓        -          -
Ver pérdidas propias       ✓        ✓*         ✓
Agregar sitio bloqueado    ✓        ✓*         ✓
Desbloquear sitio          ✓**      ✓*         ✓
Aprobar desbloqueo         -        ✓*         ✓
Gestionar retos propios    ✓        ✓*         ✓
Usar chat de apoyo         ✓        -          -
Ver mensajes del tutelado  -        ✓*         -
Enviar alertas urgentes    ✓        -          -
Recibir alertas            -        ✓*         -
Gestionar usuarios         -        -          ✓
Ver audit logs             -        -          ✓
Gestionar suscripciones    ✓        -          ✓

*  Solo si el permiso específico está habilitado en GuardianPermission
** Solo si requiresGuardianToUnblock = false, O si el guardián aprobó
```

---

## 8. Seguridad

### Autenticación
- Contraseñas hasheadas con **bcrypt** (cost factor 12)
- JWT con expiración corta (15 min) + Refresh Token (7 días) en httpOnly cookie
- Verificación de email obligatoria antes de acceder
- Rate limiting en endpoints de auth: 5 intentos / 15 min por IP

### API
- Todos los endpoints requieren JWT válido (excepto auth y webhooks)
- Middleware de permisos verifica rol + permisos de guardián en cada request
- Rate limiting general: 100 req/min por usuario autenticado
- Validación de entrada con Zod en todos los endpoints
- SQL injection imposible con Prisma (prepared statements)
- XSS: Next.js escapa por defecto; Content Security Policy headers
- CORS restrictivo: solo orígenes de producción permitidos

### Datos Sensibles
- Variables de entorno nunca en el repositorio (.env en .gitignore)
- Secretos en variables de entorno del proveedor (Vercel/Railway)
- Soft delete para datos de usuarios (cumplimiento de privacidad)
- Audit log de todas las acciones sensibles

### Headers HTTP (Helmet.js)
```
Content-Security-Policy
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=()
Strict-Transport-Security: max-age=31536000
```

---

## 9. Roadmap de Desarrollo

### Fase 1 — MVP (4-6 semanas)
- [ ] Setup monorepo (Turborepo + pnpm workspaces)
- [ ] Schema Prisma + migraciones iniciales
- [ ] Auth completa (registro, login, email verification)
- [ ] Dashboard básico con métricas clave
- [ ] Bloqueo de sitios (CRUD)
- [ ] Registro de pérdidas
- [ ] Sistema de guardianes (invitación + permisos básicos)
- [ ] Deploy inicial (Vercel + Railway)

### Fase 2 — Core Features (3-4 semanas)
- [ ] Retos y metas de ahorro
- [ ] Chat de apoyo con IA (Claude API)
- [ ] Notificaciones (in-app + email)
- [ ] Aprobaciones del guardián (desbloqueo, etc.)
- [ ] Dashboard del guardián

### Fase 3 — Monetización (2-3 semanas)
- [ ] Integración Stripe (suscripciones)
- [ ] Planes Free / Pro / Familia
- [ ] Landing page pública
- [ ] Onboarding guiado

### Fase 4 — Crecimiento (ongoing)
- [ ] App móvil (React Native / Expo)
- [ ] Extensión de Chrome para bloqueo real
- [ ] Comunidad / grupos de apoyo
- [ ] Estadísticas avanzadas y exportación
- [ ] Partnerships con psicólogos

---

## 10. Variables de Entorno

```env
# apps/api/.env

# Base de datos
DATABASE_URL="postgresql://user:pass@host:5432/gambtroy"

# Redis
REDIS_URL="redis://localhost:6379"

# Auth
JWT_SECRET="super-secret-key-min-32-chars"
JWT_REFRESH_SECRET="another-secret-key-min-32-chars"

# Email (Resend)
RESEND_API_KEY="re_..."
EMAIL_FROM="noreply@gambtroy.com"

# IA (Anthropic)
ANTHROPIC_API_KEY="sk-ant-..."

# Stripe
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# App
APP_URL="https://gambtroy.com"
API_URL="https://api.gambtroy.com"
NODE_ENV="production"

# Monitoring
SENTRY_DSN="https://..."
```

---

## 11. Comandos para Iniciar

```bash
# Clonar y configurar
git clone https://github.com/tu-usuario/gambtroy.git
cd gambtroy
pnpm install

# Configurar variables de entorno
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# Levantar infraestructura local (Docker)
docker-compose up -d   # PostgreSQL + Redis

# Migraciones
cd apps/api
pnpm prisma migrate dev
pnpm prisma db seed

# Correr en desarrollo
cd ../..
pnpm dev   # Corre web (3000) y api (3001) en paralelo

# Build producción
pnpm build
```

---

## 12. Notas para Codex / Antigravity

Al pasar este plan al agente de código, indicar en el prompt:

1. **Usar este schema de Prisma exactamente** — no modificar nombres de modelos ni enums
2. **TypeScript estricto** — `strict: true` en tsconfig, sin `any`
3. **Cada endpoint debe tener**: validación Zod + middleware de auth + audit log
4. **Tests mínimos**: al menos unit test para servicios críticos (auth, permisos)
5. **Commits atómicos**: un commit por feature/endpoint
6. **Seguir estructura de carpetas** definida en sección 5 exactamente

---

*GambTroy — Documento generado para desarrollo. Versión 1.0*
EOF