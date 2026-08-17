# Project Management Service

A production-ready **Spring Boot 3** microservice for managing projects, built with **Hexagonal Architecture** (Ports and Adapters), **PostgreSQL**, and **Flyway** database migrations.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Architecture Overview](#architecture-overview)
3. [Project Structure](#project-structure)
4. [Environment Variables](#environment-variables)
5. [Running Locally](#running-locally)
   - [With Maven](#with-maven)
   - [With Docker](#with-docker)
6. [API Endpoints](#api-endpoints)
7. [Running Tests](#running-tests)
8. [Database Migrations](#database-migrations)

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Java | 17 | Language |
| Spring Boot | 3.x | Application framework |
| Spring Web (MVC) | 3.x | REST API |
| Spring Data JPA | 3.x | ORM / persistence |
| Hibernate | 6.x | JPA provider |
| PostgreSQL | 15+ | Primary database |
| Flyway | 9.x | Database migrations |
| Spring Boot Actuator | 3.x | Health & metrics endpoints |
| Lombok | 1.18.x | Boilerplate reduction |
| JUnit 5 | 5.x | Testing framework |
| Mockito | 5.x | Mocking framework |
| Maven | 3.9 | Build tool |
| Docker | 24+ | Containerisation |

---

## Architecture Overview

This service follows the **Hexagonal Architecture** (also known as *Ports and Adapters*) pattern, which cleanly separates business logic from infrastructure concerns.

```
┌─────────────────────────────────────────────────────────────────┐
│                        Driving Adapters                         │
│              (adapter/in — REST Controllers)                    │
└────────────────────────────┬────────────────────────────────────┘
                             │  calls
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Inbound Ports                              │
│              (domain/port/in — ProjectUseCase)                  │
└────────────────────────────┬────────────────────────────────────┘
                             │  implemented by
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Domain Layer                              │
│   domain/model  ·  domain/service  ·  domain/exception          │
│   (pure Java — zero framework dependencies)                     │
└────────────────────────────┬────────────────────────────────────┘
                             │  calls
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Outbound Ports                             │
│            (domain/port/out — ProjectRepository)                │
└────────────────────────────┬────────────────────────────────────┘
                             │  implemented by
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Driven Adapters                             │
│         (adapter/out — JPA Persistence Adapter)                 │
└─────────────────────────────────────────────────────────────────┘
```

### Key Principles

- **Domain layer** has **zero** Spring or JPA annotations — it is a pure Java model.
- **Inbound ports** (`ProjectUseCase`) define what the application *can do*; REST controllers depend on the interface, never the implementation.
- **Outbound ports** (`ProjectRepository`) define what the domain *needs*; the JPA adapter implements the interface, keeping Hibernate out of the domain.
- **DTOs** live in the `application` layer and are translated to/from domain objects at the adapter boundary.

---

## Project Structure

```
src/
├── main/
│   ├── java/com/projectmanagement/
│   │   ├── ProjectManagementApplication.java       # Spring Boot entry point
│   │   ├── adapter/
│   │   │   ├── in/web/
│   │   │   │   ├── ProjectController.java          # REST CRUD controller
│   │   │   │   └── HealthController.java           # Liveness probe
│   │   │   └── out/persistence/
│   │   │       ├── ProjectEntity.java              # JPA entity
│   │   │       ├── ProjectJpaRepository.java       # Spring Data interface
│   │   │       ├── ProjectMapper.java              # Entity ↔ Domain mapper
│   │   │       └── ProjectPersistenceAdapter.java  # Outbound port impl
│   │   ├── application/
│   │   │   └── dto/
│   │   │       ├── CreateProjectRequest.java
│   │   │       ├── UpdateProjectRequest.java
│   │   │       └── ProjectResponse.java
│   │   └── domain/
│   │       ├── exception/
│   │       │   └── ProjectNotFoundException.java
│   │       ├── model/
│   │       │   ├── Project.java                    # Domain entity (pure POJO)
│   │       │   └── ProjectStatus.java              # Enum: ACTIVE, ARCHIVED, DELETED
│   │       ├── port/
│   │       │   ├── in/ProjectUseCase.java          # Inbound port
│   │       │   └── out/ProjectRepository.java      # Outbound port
│   │       └── service/
│   │           └── ProjectService.java             # Domain service
│   └── resources/
│       ├── application.yml
│       └── db/migration/
│           └── V1__create_projects_table.sql
└── test/
    ├── java/com/projectmanagement/
    │   ├── adapter/in/web/
    │   │   ├── HealthControllerTest.java
    │   │   └── ProjectControllerTest.java
    │   └── domain/service/
    │       └── ProjectServiceTest.java
    └── resources/
        └── application.yml                         # H2 in-memory config for tests
```

---

## Environment Variables

All sensitive configuration is externalised via environment variables. Copy `.env.example` to `.env` and fill in the values.

```bash
cp .env.example .env
```

| Variable | Default | Description |
|---|---|---|
| `DB_HOST` | `localhost` | PostgreSQL hostname |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_NAME` | `projectdb` | Database name |
| `DB_USERNAME` | `postgres` | Database username |
| `DB_PASSWORD` | *(required)* | Database password |
| `SERVER_PORT` | `8080` | HTTP server port |
| `SPRING_PROFILES_ACTIVE` | `default` | Active Spring profile |

---

## Running Locally

### Prerequisites

- Java 17+
- Maven 3.9+
- PostgreSQL 15+ (or Docker)

### With Maven

1. **Start PostgreSQL** (skip if you already have one running):

   ```bash
   docker run -d \
     --name postgres \
     -e POSTGRES_DB=projectdb \
     -e POSTGRES_USER=postgres \
     -e POSTGRES_PASSWORD=changeme \
     -p 5432:5432 \
     postgres:15-alpine
   ```

2. **Set environment variables** (or export them in your shell):

   ```bash
   export DB_HOST=localhost
   export DB_PORT=5432
   export DB_NAME=projectdb
   export DB_USERNAME=postgres
   export DB_PASSWORD=changeme
   ```

3. **Run the application**:

   ```bash
   mvn spring-boot:run
   ```

   The service will start on `http://localhost:8080`.

### With Docker

1. **Build the Docker image**:

   ```bash
   docker build -t project-management-service:latest .
   ```

2. **Run the container** (assumes PostgreSQL is accessible at `DB_HOST`):

   ```bash
   docker run -d \
     --name project-management-service \
     -p 8080:8080 \
     -e DB_HOST=host.docker.internal \
     -e DB_PORT=5432 \
     -e DB_NAME=projectdb \
     -e DB_USERNAME=postgres \
     -e DB_PASSWORD=changeme \
     project-management-service:latest
   ```

   > **Tip:** Use `host.docker.internal` on macOS/Windows to reach a PostgreSQL instance running on the host machine. On Linux, use `--network host` or a Docker network.

3. **Verify the service is running**:

   ```bash
   curl http://localhost:8080/health
   # {"status":"UP"}
   ```

---

## API Endpoints

### Projects

| Method | Path | Description | Request Body | Success Response |
|---|---|---|---|---|
| `POST` | `/api/v1/projects` | Create a new project | `CreateProjectRequest` | `201 Created` + `ProjectResponse` |
| `GET` | `/api/v1/projects` | List all non-deleted projects | — | `200 OK` + `ProjectResponse[]` |
| `GET` | `/api/v1/projects/{id}` | Get a project by ID | — | `200 OK` + `ProjectResponse` |
| `PUT` | `/api/v1/projects/{id}` | Update a project | `UpdateProjectRequest` | `200 OK` + `ProjectResponse` |
| `DELETE` | `/api/v1/projects/{id}` | Soft-delete a project | — | `204 No Content` |

### Health & Actuator

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Simple liveness probe — returns `{"status":"UP"}` |
| `GET` | `/actuator/health` | Spring Boot Actuator health endpoint |

### Request / Response Schemas

**`CreateProjectRequest`**
```json
{
  "name":        "My Project",
  "description": "An optional description",
  "ownerId":     "550e8400-e29b-41d4-a716-446655440000"
}
```

**`UpdateProjectRequest`** (all fields optional)
```json
{
  "name":        "Renamed Project",
  "description": "Updated description",
  "status":      "ARCHIVED"
}
```

**`ProjectResponse`**
```json
{
  "id":          "550e8400-e29b-41d4-a716-446655440001",
  "name":        "My Project",
  "description": "An optional description",
  "status":      "ACTIVE",
  "ownerId":     "550e8400-e29b-41d4-a716-446655440000",
  "createdAt":   "2024-01-15T10:30:00Z",
  "updatedAt":   "2024-01-15T10:30:00Z"
}
```

**Project Status Values**

| Value | Meaning |
|---|---|
| `ACTIVE` | Project is in progress |
| `ARCHIVED` | Project is completed / archived |
| `DELETED` | Project has been soft-deleted (excluded from list results) |

---

## Running Tests

```bash
# Run all tests
mvn test

# Run a specific test class
mvn test -Dtest=ProjectServiceTest

# Run tests with verbose output
mvn test -Dsurefire.useFile=false
```

Tests use an **H2 in-memory database** (configured in `src/test/resources/application.yml`) so no external PostgreSQL instance is required.

### Test Coverage

| Test Class | Type | What it tests |
|---|---|---|
| `ProjectServiceTest` | Unit | Domain service logic with mocked repository |
| `ProjectControllerTest` | Web slice (`@WebMvcTest`) | REST endpoints with mocked use-case |
| `HealthControllerTest` | Web slice (`@WebMvcTest`) | Health endpoint response |

---

## Database Migrations

Database schema is managed by **Flyway**. Migration scripts live in:

```
src/main/resources/db/migration/
```

| Version | Script | Description |
|---|---|---|
| V1 | `V1__create_projects_table.sql` | Creates the `projects` table with indexes |

Flyway runs automatically on application startup. To add a new migration, create a file following the naming convention `V{n}__{description}.sql`.

---

## Actuator Endpoints

Spring Boot Actuator is configured to expose the `health` endpoint:

```bash
curl http://localhost:8080/actuator/health
```

Additional endpoints (e.g., `info`, `metrics`, `prometheus`) can be enabled in `application.yml` under `management.endpoints.web.exposure.include`.
