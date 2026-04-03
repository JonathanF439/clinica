# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Ophthalmology clinic management system (Clinica) — a fullstack monorepo with a **NestJS** backend (`/backend`) and **Next.js** frontend (`/frontend`), using **PostgreSQL** via **Prisma** ORM.

---

## Development Commands

### Running the full stack

```bash
# Start database + backend + frontend via Docker
docker compose -f docker-compose.dev.yml up

# Or run services individually (requires PostgreSQL running locally):
cd backend && npm run dev   # http://localhost:5000
cd frontend && npm run dev  # http://localhost:3000
```

### Backend (`/backend`)

```bash
npm run dev           # Start in watch mode
npm run build         # Compile TypeScript
npm run lint          # ESLint with auto-fix
npm run test          # Run unit tests (Jest)
npm run test:watch    # Jest in watch mode
npm run test:cov      # Coverage report
npm run test:e2e      # End-to-end tests

# Prisma
npm run prisma:migrate   # Create and apply migrations (dev)
npm run prisma:push      # Push schema without migration file
npm run prisma:generate  # Regenerate Prisma client
npm run prisma:seed      # Seed database with initial data
npm run studio           # Open Prisma Studio UI
```

### Frontend (`/frontend`)

```bash
npm run dev    # Next.js dev server (http://localhost:3000)
npm run build  # Production build
npm run lint   # ESLint
```

---

## Architecture

### Backend (NestJS)

Standard NestJS module structure. Each domain has: `module`, `controller`, `service`, `dto/`.

```
backend/src/
├── main.ts              # App entry: Express, CORS, Swagger, ValidationPipe, port 5000
├── app.module.ts        # Root module
├── auth/                # JWT auth via cookies (passport-jwt)
├── user/                # User CRUD, roles enum
├── doctor/              # Doctor management
├── patient/             # Patient management (20+ fields)
├── appointment/         # Appointment scheduling
├── procedure/           # Procedure catalog (47 pre-seeded eye-care procedures)
└── prisma/              # PrismaService (singleton, lifecycle hooks)
```

- Global prefix: `/api`
- Swagger docs: `http://localhost:5000/api/docs`
- Auth: JWT stored as httpOnly cookie (`access_token`). Guard is `JwtAuthGuard`.
- Validation: `ValidationPipe` with `whitelist: true, transform: true` globally applied.

### Frontend (Next.js App Router)

```
frontend/src/
├── app/
│   ├── layout.tsx           # Root layout (wraps Providers)
│   ├── providers.tsx        # TanStack Query + AuthProvider
│   ├── login/               # Public route
│   └── (protected)/         # Route group with auth layout check
│       ├── agenda/          # Main appointment calendar view
│       ├── agendamento/novo/# New appointment form
│       ├── medicos/         # Doctors list
│       └── pacientes/       # Patients list
├── components/
│   ├── agenda/              # Appointment modals, calendar, status badge
│   ├── layout/Sidebar.tsx
│   ├── patients/            # PatientFormModal
│   └── shared/              # ProcedureCombobox, reusable UI
├── context/auth-context.tsx # Auth state (user, login, logout)
├── services/api.ts          # Axios instance + all service functions
├── types/clinic.ts          # Shared TypeScript interfaces for all domain models
└── lib/                     # utils, constants, validation
```

- Path alias: `@/*` → `src/*`
- Server state: TanStack Query (staleTime 60s)
- HTTP: Axios with `withCredentials: true` (cookie-based auth); 401 interceptor redirects to `/login`
- Styling: Tailwind CSS v4 + Radix UI primitives + `shadcn/ui`-style component pattern (`cn()` from `clsx` + `tailwind-merge`)

### Database (Prisma + PostgreSQL)

Schema at `backend/prisma/schema.prisma`. Key models: `User`, `Doctor`, `Patient`, `Appointment`, `Procedure`.

`UserRole` enum: `ADMIN | MEDICO | RECEPCIONISTA | ENFERMAGEM | PACIENTE`

Seed data (run `npm run prisma:seed` from `backend/`): 47 procedures, 4 doctors, 4 users (admin/medico/recepcao/enfermagem@clinica.com), 1 patient, 1 appointment.

---

## Environment

Copy `.env.dev` to `.env` in `backend/` and `frontend/`:

- **Backend**: `PORT=5000`, `DATABASE_URL_POSTGRES=postgresql://postgres:admin@localhost:5432/clinica?schema=public`, `JWT_SECRET`, `CORS_ORIGIN=http://localhost:3000`
- **Frontend**: `NEXT_PUBLIC_API_URL=http://localhost:5000/api`
