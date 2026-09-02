# AGENTS.md — Project Management Service

## 1. Stack

| Technology | Role |
|---|---|
| **Node.js 20 LTS + Express 4.x** | Primary runtime and HTTP framework |
| **TypeScript 5.x** | Type safety across all source files |
| **Prisma ORM** | Database access layer, schema migrations, and type-safe queries |
| **PostgreSQL 15** | Primary relational datastore |
| **passport-jwt / jose** | JWT parsing and OAuth2/OIDC token validation |
| **express-validator** | Request body and parameter validation middleware |
| **helmet + cors** | HTTP security headers and CORS policy enforcement |
| **express-rate-limit** | Per-route and global rate limiting |
| **prom-client** | Prometheus metrics exposition (`/metrics` endpoint) |
| **winston** | Structured JSON logging for application and audit events |
| **Jest + Supertest** | Unit, integration, and end-to-end API tests |
| **ts-jest** | TypeScript preprocessor for Jest |
| **Docker 24 + Compose v2** | Containerisation and local dev orchestration |
| **GitHub Actions** | CI pipeline (lint → build → test → security scan → push image) |
| **OpenAPI 3.1 / swagger-ui-express** | API contract documentation served at `/api-docs` |
| **Zod** | Runtime schema validation aligned with OpenAPI contracts |

---

## 2. Project Structure

```
project-management-service/
├── .github/
│   └── workflows/
│       └── ci.yml                  # GitHub Actions pipeline definition
├── docker/
│   ├── Dockerfile                  # Production multi-stage image
│   └── Dockerfile.dev              # Dev image with hot-reload (ts-node-dev)
├── docker-compose.yml              # Local stack: app + postgres + grafana + prometheus
├── docker-compose.test.yml         # Isolated test stack with ephemeral postgres
├── prometheus/
│   └── prometheus.yml              # Scrape config targeting app /metrics
├── grafana/
│   └── dashboards/
│       └── project-service.json    # Pre-built Grafana dashboard JSON
├── prisma/
│   ├── schema.prisma               # Data model: Project, AuditLog, User (ref)
│   └── migrations/                 # Auto-generated migration files
├── src/
│   ├── main.ts                     # Entry point: creates app, connects DB, starts server
│   ├── app.ts                      # Express app factory (middleware registration)
│   ├── config/
│   │   ├── env.ts                  # Zod-validated environment variable schema
│   │   └── constants.ts            # App-wide constants (pagination limits, roles, etc.)
│   ├── middleware/
│   │   ├── authenticate.ts         # OIDC/JWT token validation middleware
│   │   ├── authorize.ts            # RBAC role-checking middleware factory
│   │   ├── rateLimiter.ts          # express-rate-limit configurations
│   │   ├── requestLogger.ts        # Winston HTTP request/response logger
│   │   ├── errorHandler.ts         # Centralised error handling and RFC 7807 responses
│   │   └── metricsMiddleware.ts    # prom-client request duration histogram
│   ├── modules/
│   │   └── projects/
│   │       ├── project.router.ts   # Express Router: all /projects routes
│   │       ├── project.controller.ts # Route handlers (thin — delegates to service)
│   │       ├── project.service.ts  # Business logic, CRUD, concurrency control
│   │       ├── project.repository.ts # Prisma data access — no business logic here
│   │       ├── project.schema.ts   # Zod schemas for create/update/query payloads
│   │       ├── project.types.ts    # TypeScript interfaces and enums for domain
│   │       └── project.audit.ts    # Audit log write helpers called from service
│   ├── metrics/
│   │   └── registry.ts             # prom-client registry and metric definitions
│   ├── openapi/
│   │   └── spec.yaml               # OpenAPI 3.1 spec (source of truth for contracts)
│   └── utils/
│       ├── logger.ts               # Winston logger instance (JSON transport)
│       ├── pagination.ts           # Cursor/offset pagination helpers
│       └── errors.ts               # Typed error classes (NotFoundError, ConflictError, etc.)
├── tests/
│   ├── unit/
│   │   ├── projects/
│   │   │   ├── project.service.test.ts
│   │   │   ├── project.repository.test.ts
│   │   │   └── project.schema.test.ts
│   │   └── middleware/
│   │       ├── authenticate.test.ts
│   │       └── authorize.test.ts
│   ├── integration/
│   │   └── projects/
│   │       └── project.api.test.ts # Supertest against real Express app + test DB
│   └── helpers/
│       ├── testApp.ts              # Bootstraps Express app for tests
│       ├── dbSetup.ts              # Prisma test DB seed/teardown helpers
│       └── fixtures/
│           └── project.fixtures.ts # Reusable test data factories
├── tasks.md                        # Agent-generated task breakdown (see §3)
├── .env.example                    # All required env vars with placeholder values
├── .eslintrc.json                  # ESLint config (typescript-eslint + prettier)
├── .prettierrc                     # Prettier formatting rules
├── jest.config.ts                  # Jest configuration with coverage thresholds
├── tsconfig.json                   # TypeScript compiler options
├── tsconfig.build.json             # Build-only tsconfig (excludes tests)
└── package.json                    # Scripts, dependencies, engines field
```

---

## 3. Required Workflow

The agent **must** follow these steps in order. Do not skip or reorder steps.

### Step 1 — Read All Specifications
- Read every file in the repository root before writing any code.
- Parse `src/openapi/spec.yaml` to understand all endpoints, request/response schemas, and error codes.
- Identify all environment variables required; verify they are present in `.env.example`.

### Step 2 — Create `tasks.md`
- Before writing implementation code, create `tasks.md` at the repo root.
- Break the work into numbered tasks grouped by layer: `[CONFIG]`, `[MIDDLEWARE]`, `[MODULE]`, `[TESTS]`, `[DOCKER]`, `[CI]`.
- Each task must reference the file(s) it affects and its acceptance criterion.
- Example entry:
  ```
  ### [MODULE-03] Implement optimistic concurrency in project.service.ts
  Files: src/modules/projects/project.service.ts, prisma/schema.prisma
  Criterion: updateProject throws ConflictError when request version != DB version field.
  ```
- Do not proceed to Step 3 until `tasks.md` is committed.

### Step 3 — Implement in Layer Order
Execute tasks in this sequence to avoid circular dependency errors:

1. `config/env.ts` — parse and validate all env vars with Zod; fail fast on startup if invalid.
2. `prisma/schema.prisma` — define `Project` model with `version Int @default(0)` for optimistic locking and `AuditLog` model.
3. Run `npx prisma migrate dev --name init` to generate the initial migration.
4. `utils/` — implement shared logger, typed error classes, and pagination helpers.
5. `middleware/` — implement in order: `authenticate.ts` → `authorize.ts` → `rateLimiter.ts` → `errorHandler.ts` → `metricsMiddleware.ts`.
6. `modules/projects/` — implement in order: `project.types.ts` → `project.schema.ts` → `project.repository.ts` → `project.service.ts` → `project.audit.ts` → `project.controller.ts` → `project.router.ts`.
7. `app.ts` and `main.ts` — wire all middleware and routers; expose `/health`, `/metrics`, and `/api-docs`.
8. `openapi/spec.yaml` — ensure spec matches implemented routes exactly.

### Step 4 — Write Tests
- Write tests **after** implementation but **before** marking any task complete.
- Follow the testing rules in §5.
- Run `npm test -- --coverage` and confirm coverage thresholds pass.

### Step 5 — Validate
Run each command and fix all failures before finishing:

```bash
npm run lint          # ESLint — zero warnings allowed
npm run typecheck     # tsc --noEmit using tsconfig.json
npm run test          # Jest — all suites green, coverage ≥ 90%
docker compose build  # Image must build without errors
docker compose up -d  # Stack must reach healthy state
curl http://localhost:3000/health  # Must return 200 {"status":"ok"}
curl http://localhost:3000/metrics # Must return Prometheus text format
```

---

## 4. Coding Conventions

### Naming
| Artefact | Convention | Example |
|---|---|---|
| Files | `kebab-case.role.ts` | `project.service.ts` |
| Classes | `PascalCase` | `ProjectService` |
| Interfaces | `PascalCase` prefixed with `I` | `IProjectRepository` |
| Functions / methods | `camelCase` | `createProject()` |
| Constants | `UPPER_SNAKE_CASE` | `MAX_PAGE_SIZE` |
| Env vars | `UPPER_SNAKE_CASE` | `DATABASE_URL` |
| Route paths | `kebab-case` plural nouns | `/projects/:projectId` |
| Zod schemas | `camelCase` suffixed `Schema` | `createProjectSchema` |

### Architecture Patterns
- **Controller → Service → Repository** layering is mandatory. Controllers must not contain business logic. Repositories must not contain business logic.
- **Dependency injection via constructor parameters** — do not use global singletons for service/repository instances in production code (makes unit testing easier).
- **Optimistic concurrency**: every `UPDATE` in `project.repository.ts` must include a `WHERE version = :expectedVersion` clause (via Prisma's `where` + `version` filter). If `count === 0`, the service throws `ConflictError`.
- **Transactional writes**: all write operations that touch more than one table (e.g., updating a project and writing an audit log) must use `prisma.$transaction([...])`.
- **RBAC**: `authorize.ts` must be a factory `authorize(...roles: Role[])` returning Express middleware. Apply it per-route, not globally.
- **Error responses**: all errors must follow [RFC 7807](https://www.rfc-editor.org/rfc/rfc7807) — `{ type, title, status, detail, instance }`. The `errorHandler.ts` middleware is the single place that serialises errors to this format.
- **Never** use `any` type. ESLint rule `@typescript-eslint/no-explicit-any` must be set to `error`.
- **Async/await** throughout — no raw Promise chains or callbacks.
- **Validation order**: authenticate → rate-limit → Zod schema validation → RBAC → controller handler.

### Logging
- Use `winston` with JSON format in all environments.
- Every audit-relevant action (create, update, delete) must call `project.audit.ts` helpers which write to the `AuditLog` table AND emit a structured log entry with fields: `action`, `projectId`, `actorId`, `timestamp`, `changes`.
- Request logs must include: `method`, `path`, `statusCode`, `durationMs`, `requestId` (from `X-Request-ID` header or generated UUID).

---

## 5. Testing

### Test Types and Locations
| Type | Location | Tool | What to test |
|---|---|---|---|
| Unit | `tests/unit/` | Jest + ts-jest | Pure functions, service logic with mocked repo, schema validation, middleware in isolation |
| Integration | `tests/integration/` | Jest + Supertest | Full HTTP request → real Express app → test DB (via `docker-compose.test.yml`) |

### Coverage Requirements
- **Minimum 90% line, branch, function, and statement coverage** enforced in `jest.config.ts`:
  ```ts
  coverageThreshold: {
    global: { lines: 90, branches: 90, functions: 90, statements: 90 }
  }
  ```
- Coverage report format: `lcov` (for CI upload) + `text-summary` (for console).

### Mocking Rules
- Mock Prisma client using `jest.mock` or `jest-mock-extended` — never hit a real DB in unit tests.
- Mock the OIDC token validation call in `authenticate.ts` unit tests using `jest.spyOn`.
- Use `tests/helpers/fixtures/project.fixtures.ts` factory functions for all test data — no inline object literals in test files.

### Test File Conventions
- One test file per source file.
- Describe blocks mirror the function/class name: `describe('ProjectService', () => { describe('createProject', () => { ... }) })`.
- Test names use plain language: `it('throws ConflictError when version does not match')`.
- Each test must have exactly one logical assertion group (arrange / act / assert pattern).

### Running Tests
```bash
# All tests with coverage
npm test -- --coverage

# Unit tests only
npm test -- --testPathPattern=tests/unit

# Integration tests only (requires docker-compose.test.yml to be running)
npm test -- --testPathPattern=tests/integration

# Watch mode during development
npm run test:watch
```

### `jest.config.ts` Required Settings
```ts
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  collectCoverageFrom: ['src/**/*.ts', '!src/main.ts', '!src/**/*.types.ts'],
  coverageDirectory: 'coverage',
  coverageReporters: ['lcov', 'text-summary'],
  setupFilesAfterFramework: ['<rootDir>/tests/helpers/dbSetup.ts'],
};
```

---

## 6. Docker & CI

### `docker/Dockerfile` (Production — Multi-Stage)
```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --ignore-scripts
COPY tsconfig.build.json ./tsconfig.json
COPY src ./src
COPY prisma ./prisma
RUN npx prisma generate
RUN npm run build          # tsc -p tsconfig.build.json → dist/

# Stage 2: Runtime
FROM node:20-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY prisma ./prisma
USER appuser
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD wget -qO- http://localhost:3000/health || exit 1
CMD ["node", "dist/main.js"]
```

### `docker-compose.yml` (Local Development)
Must define these services:
- **`app`**: built from `docker/Dockerfile.dev`, mounts `./src` as a volume, depends on `postgres`.
- **`postgres`**: `postgres:15-alpine`, named volume `pgdata`, env vars from `.env`.
- **`prometheus`**: `prom/prometheus:latest`, mounts `./prometheus/prometheus.yml`, scrapes `app:3000/metrics`.
- **`grafana`**: `grafana/grafana:latest`, mounts `./grafana/dashboards/`, provisioned datasource pointing to prometheus.

All services must be on a named bridge network `project-net`.

### `docker-compose.test.yml`
- Defines only `postgres-test` with a separate named volume `pgtest-data`.
- Used exclusively by integration tests via `DATABASE_