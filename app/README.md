# Project Management Service

## Overview

The **Project Management Service** is a RESTful microservice responsible for managing project entities within the platform. It provides full CRUD operations, enforces business rules, handles role-based access control (RBAC), and implements optimistic concurrency control to prevent conflicting updates.

Built with **Node.js (Express)** following **hexagonal architecture** (ports and adapters), the service is designed to be modular, testable, and production-ready.

---

## Architecture

```
src/
├── index.js                        # Application entry point
├── app.js                          # Express app factory
├── config/
│   └── index.js                    # Environment configuration
├── domain/
│   ├── entities/
│   │   └── Project.js              # Project domain entity
│   ├── ports/
│   │   ├── ProjectRepository.js    # Repository port (interface)
│   │   └── AuthProvider.js         # Auth provider port (interface)
│   └── usecases/
│       ├── CreateProject.js
│       ├── GetProject.js
│       ├── ListProjects.js
│       ├── UpdateProject.js
│       └── DeleteProject.js
├── adapters/
│   ├── inbound/
│   │   └── http/
│   │       ├── routes/
│   │       │   ├── healthRoutes.js
│   │       │   ├── projectRoutes.js
│   │       │   └── metricsRoutes.js
│   │       ├── middleware/
│   │       │   ├── authMiddleware.js
│   │       │   ├── errorHandler.js
│   │       │   ├── rateLimiter.js
│   │       │   └── validateRequest.js
│   │       └── controllers/
│   │           └── ProjectController.js
│   └── outbound/
│       ├── persistence/
│       │   └── InMemoryProjectRepository.js
│       └── auth/
│           └── JwtAuthProvider.js
└── infrastructure/
    ├── logger.js
    └── metrics.js
```

---

## Technology Stack

| Concern            | Technology                        |
|--------------------|-----------------------------------|
| Runtime            | Node.js ≥ 18                      |
| Framework          | Express 4                         |
| Auth               | OAuth2 / JWT (jsonwebtoken, jwks-rsa) |
| Validation         | Joi                               |
| Logging            | Winston + express-winston         |
| Metrics            | Prometheus (prom-client)          |
| Rate Limiting      | express-rate-limit                |
| Security Headers   | Helmet                            |
| Testing            | Jest + Supertest                  |
| Containerisation   | Docker                            |

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9
- Docker (optional)

### Local Development

```bash
# 1. Clone the repository
git clone <repo-url>
cd project-management-service

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your values

# 4. Start the service
npm run dev
```

The service will be available at `http://localhost:3000`.

### Running with Docker

```bash
docker build -t project-management-service .
docker run -p 3000:3000 --env-file .env project-management-service
```

---

## API Endpoints

### Health

| Method | Path            | Description              |
|--------|-----------------|--------------------------|
| GET    | `/health`       | Liveness check           |
| GET    | `/health/ready` | Readiness check          |

### Projects (requires Bearer token)

| Method | Path               | Description                  | Roles          |
|--------|--------------------|------------------------------|----------------|
| GET    | `/api/v1/projects` | List all projects             | any            |
| POST   | `/api/v1/projects` | Create a new project          | admin, manager |
| GET    | `/api/v1/projects/:id` | Get a project by ID       | any            |
| PUT    | `/api/v1/projects/:id` | Update a project          | admin, manager |
| DELETE | `/api/v1/projects/:id` | Delete a project          | admin          |

### Metrics

| Method | Path       | Description              |
|--------|------------|--------------------------|
| GET    | `/metrics` | Prometheus metrics       |

---

## Environment Variables

See [.env.example](.env.example) for all supported variables.

---

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage
```

---

## Optimistic Concurrency Control

All update operations require a `version` field in the request body. If the version does not match the current stored version, the service returns `409 Conflict`.

---

## RBAC

Roles are extracted from the JWT `roles` claim. Supported roles:

- `admin` — full access
- `manager` — create and update projects
- `viewer` — read-only access

---

## Audit Logging

All write operations are logged with the acting user's ID, the operation type, and the affected resource ID using structured JSON logs via Winston.

---

## License

MIT
