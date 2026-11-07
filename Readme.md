# ForgeFit Backend

REST API for **ForgeFit** — a workout planning and tracking app. Users browse a shared exercise catalog, create or pick workout plans, run sessions, log sets, and track progress over time. Built to support an offline-first mobile client.

---

## Tech Stack

| Layer      | Technology                                             |
| ---------- | ------------------------------------------------------ |
| Runtime    | Node.js 20+                                            |
| Language   | TypeScript (strict, ESM)                               |
| Framework  | Express 5                                              |
| ORM        | Prisma                                                 |
| Database   | PostgreSQL 14+                                         |
| Validation | Zod                                                    |
| Auth       | JWT (jsonwebtoken) + bcrypt                            |
| Docs       | OpenAPI 3 · Swagger UI (auto-generated from Zod)       |
| Tooling    | tsx, nodemon, helmet, cors, morgan, express-rate-limit |

---

## Features

- **JWT authentication** — register, login, and protected routes.
- **Shared exercise catalog** — filterable by muscle group, equipment, or name.
- **Workout plans** — global (read-only) and per-user custom plans with ordered exercises and targets.
- **Session engine** — start a session from a plan (snapshots targets for history), log sets, complete or cancel. Enforces single in-progress session per user.
- **Derived metrics** — volume (`weight × reps` over completed sets only), duration, and personal records computed on read.
- **Progress endpoints** — overall stats, weekly volume/frequency, and per-exercise history.
- **Consistent JSON errors** — `AppError`, `ZodError`, and Prisma errors are all normalized by a single handler.
- **Auto-generated API docs** — schemas live in Zod; Swagger is derived, never hand-written.

---

## Prerequisites

- Node.js **20+**
- PostgreSQL **14+** (local or Docker)
- npm **10+**

Quick Postgres with Docker:

```bash
docker run --name forgefit-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=forgefit \
  -p 5432:5432 \
  -d postgres:16
```

---

## Installation

```bash
# 1. Clone
git clone <your-repo-url> forgefit-backend
cd forgefit-backend

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# then edit .env with your DATABASE_URL and JWT_SECRET

# 4. Apply migrations
npx prisma migrate dev --name init

# 5. Seed exercises + demo plans
npm run scripts:seed

# 6. Start dev server
npm run dev
```

Server runs at **http://localhost:4000**. Swagger UI at **http://localhost:4000/api-docs**.

---

## Environment Variables

Copy `.env.example` → `.env` and adjust:

| Variable         | Required | Description                           | Example                                                  |
| ---------------- | :------: | ------------------------------------- | -------------------------------------------------------- |
| `NODE_ENV`       |    no    | `development` · `production` · `test` | `development`                                            |
| `PORT`           |    no    | HTTP port (default `4000`)            | `4000`                                                   |
| `DATABASE_URL`   | **yes**  | PostgreSQL connection string          | `postgresql://postgres:postgres@localhost:5432/forgefit` |
| `JWT_SECRET`     | **yes**  | Signing key, **32+ chars**            | `openssl rand -hex 48`                                   |
| `JWT_EXPIRES_IN` |    no    | JWT lifetime (default `7d`)           | `7d`                                                     |
| `BCRYPT_ROUNDS`  |    no    | Hashing cost (8–15, default `10`)     | `10`                                                     |
| `CORS_ORIGIN`    |    no    | Allowed origin (default `*`)          | `*`                                                      |

Generate a strong JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

---

## Scripts

| Command                    | Description                                       |
| -------------------------- | ------------------------------------------------- |
| `npm run dev`              | Start in watch mode (tsx)                         |
| `npm run build`            | `prisma generate` + compile TypeScript to `dist/` |
| `npm start`                | Run compiled build (`dist/server.js`)             |
| `npm run prisma:migrate`   | Create and apply a new migration                  |
| `npm run prisma:deploy`    | Apply existing migrations (production)            |
| `npm run scripts:seed`     | Seed exercises + demo workout plans               |
| `npm run prisma:studio`    | Open Prisma Studio (DB GUI)                       |
| `npm run openapi:generate` | Export `openapi.json` for external tools          |

---

## Project Structure

```
src/
├── config/                # env, prisma client, swagger, zod-openapi extension
│   ├── env.ts
│   ├── prisma.ts
│   ├── swagger.ts
│   └── zod-openapi.ts
├── controllers/           # HTTP adapters (no business logic)
├── docs/                  # OpenAPI path definitions
│   ├── registry.ts
│   └── paths/
├── middlewares/           # auth, validate, errorHandler, rateLimiter
├── routes/                # Express routers
├── schemas/               # Zod contracts (source of truth)
├── services/              # business logic
├── utils/                 # AppError, asyncHandler, jwt, password, logger
├── app.ts                 # Express app assembly
└── server.ts              # bootstrap + graceful shutdown
prisma/
├── schema.prisma
└── migrations/
scripts/
├── seed-sessions.ts
├── seed.ts
```

**Layering:** route → controller → service → prisma. Controllers never contain logic; services never touch `req`/`res`.

---

## API Overview

Base URL: **`/api`** · Full spec at `/api-docs` (Swagger UI).

| Method   | Endpoint                                        | Auth | Description                        |
| -------- | ----------------------------------------------- | :--: | ---------------------------------- |
| `GET`    | `/health`                                       |  —   | Liveness check                     |
| `POST`   | `/auth/register`                                |  —   | Register user, returns JWT         |
| `POST`   | `/auth/login`                                   |  —   | Login, returns JWT                 |
| `GET`    | `/auth/me`                                      | JWT  | Current user                       |
| `PATCH`  | `/users/me`                                     | JWT  | Update profile                     |
| `GET`    | `/users/me/preferences`                         | JWT  | Read preferences (with defaults)   |
| `PUT`    | `/users/me/preferences`                         | JWT  | Upsert preferences                 |
| `GET`    | `/exercises`                                    | JWT  | List exercises (filterable)        |
| `GET`    | `/exercises/:id`                                | JWT  | Exercise detail                    |
| `GET`    | `/workout-plans`                                | JWT  | List global + own plans            |
| `POST`   | `/workout-plans`                                | JWT  | Create plan                        |
| `GET`    | `/workout-plans/:id`                            | JWT  | Plan detail                        |
| `PATCH`  | `/workout-plans/:id`                            | JWT  | Update own plan                    |
| `DELETE` | `/workout-plans/:id`                            | JWT  | Delete own plan                    |
| `GET`    | `/workout-sessions`                             | JWT  | Session history (paginated)        |
| `POST`   | `/workout-sessions/start`                       | JWT  | Start session from plan            |
| `GET`    | `/workout-sessions/:id`                         | JWT  | Session detail                     |
| `PATCH`  | `/workout-sessions/:id/exercises/:seId/sets/:n` | JWT  | Log / upsert set                   |
| `POST`   | `/workout-sessions/:id/complete`                | JWT  | Complete session (computes volume) |
| `POST`   | `/workout-sessions/:id/cancel`                  | JWT  | Cancel in-progress session         |
| `GET`    | `/progress/overall`                             | JWT  | Aggregated stats + weekly volume   |
| `GET`    | `/progress/exercises/:exerciseId`               | JWT  | Per-exercise progress + PRs        |

**Auth header:**

```
Authorization: Bearer <jwt>
```

---

## Error Responses

All errors return JSON:

```json
{
  "error": {
    "message": "Human-readable message",
    "details": null
  }
}
```

| Status | Meaning                                                  |
| :----: | -------------------------------------------------------- |
| `400`  | Business rule violation                                  |
| `401`  | Missing / invalid / expired JWT                          |
| `403`  | Resource belongs to another user                         |
| `404`  | Resource not found                                       |
| `409`  | Unique constraint violation / duplicate state            |
| `422`  | Validation failed (details: `[{ path, message, code }]`) |
| `500`  | Unhandled error (stack included only in development)     |

---

## Testing the API

**Option 1 — Swagger UI:** open `http://localhost:4000/api-docs`, click **Authorize**, paste a JWT, then use **Try it out** on any endpoint.

**Option 2 — End-to-end with seed data:**

```bash
# 1. Login as the demo user (created by the session seeder)
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@forgefit.dev","password":"supersecret1"}'

# 2. Copy the token from the response, then:
curl http://localhost:4000/api/progress/overall \
  -H "Authorization: Bearer <token>"
```

**Option 3 — Bulk seed historical sessions** (6 weeks of data for chart testing):

```bash
npx tsx prisma/seed-sessions.ts
```

---

## Data Model (Summary)

```
users ─┬─ workout_sessions ─ session_exercises ─ exercise_sets
       └─ workout_plans ─ plan_exercises ─ exercises
```

- `session_exercises` snapshots `exercise_name` and target values at session start — editing or deleting a plan never rewrites history.
- Personal records are **derived**, not stored.
- Deleting a plan preserves its historical sessions (`workoutPlanId` becomes `null`).

Full ERD and business rules in [`docs/architecture.md`](docs/architecture.md).
