# AGENTS.md — Project Management Service

## 1. Stack

| Technology | Role |
|---|---|
| Java 21 (LTS) | Primary language; use records, sealed classes, and pattern matching where appropriate |
| Spring Boot 3.x | Application framework; web, security, data, validation starters |
| Spring Security 6.x | Authentication and role-based authorization (JWT / OAuth2 Resource Server) |
| Spring Data JPA | ORM layer; repository abstraction over Hibernate |
| PostgreSQL 16 | Primary relational database |
| Flyway | Database schema versioning and migration |
| MapStruct | Compile-time DTO ↔ entity mapping |
| Lombok | Boilerplate reduction (use sparingly; prefer records for immutable DTOs) |
| SpringDoc OpenAPI 3 | Auto-generated API documentation |
| JUnit 5 | Unit and integration test framework |
| Mockito | Mocking in unit tests |
| Testcontainers | PostgreSQL container for integration tests |
| AssertJ | Fluent assertion library |
| Docker / Docker Compose | Containerisation and local orchestration |
| GitHub Actions | CI pipeline |

---

## 2. Project Structure

```
project-management-service/
├── .github/
│   └── workflows/
│       └── ci.yml                        # GitHub Actions CI pipeline
├── docker/
│   └── postgres/
│       └── init.sql                      # Optional DB seed for local dev
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/company/projectmgmt/
│   │   │       ├── ProjectManagementApplication.java   # Spring Boot entry point
│   │   │       ├── config/
│   │   │       │   ├── SecurityConfig.java             # Spring Security filter chain, JWT config
│   │   │       │   ├── JwtProperties.java              # @ConfigurationProperties for JWT settings
│   │   │       │   └── OpenApiConfig.java              # SpringDoc / Swagger config
│   │   │       ├── controller/
│   │   │       │   └── ProjectController.java          # REST endpoints for project lifecycle
│   │   │       ├── service/
│   │   │       │   ├── ProjectService.java             # Interface defining business operations
│   │   │       │   └── impl/
│   │   │       │       └── ProjectServiceImpl.java     # Business logic implementation
│   │   │       ├── repository/
│   │   │       │   └── ProjectRepository.java          # Spring Data JPA repository
│   │   │       ├── domain/
│   │   │       │   ├── entity/
│   │   │       │   │   └── Project.java                # JPA entity
│   │   │       │   └── enums/
│   │   │       │       └── ProjectStatus.java          # Enum: DRAFT, ACTIVE, ARCHIVED, DELETED
│   │   │       ├── dto/
│   │   │       │   ├── request/
│   │   │       │   │   ├── CreateProjectRequest.java   # Validated request record
│   │   │       │   │   └── UpdateProjectRequest.java   # Validated request record
│   │   │       │   └── response/
│   │   │       │       └── ProjectResponse.java        # Response record
│   │   │       ├── mapper/
│   │   │       │   └── ProjectMapper.java              # MapStruct interface
│   │   │       ├── exception/
│   │   │       │   ├── ProjectNotFoundException.java   # Domain exception
│   │   │       │   ├── ProjectAlreadyExistsException.java
│   │   │       │   └── GlobalExceptionHandler.java     # @RestControllerAdvice
│   │   │       └── security/
│   │   │           ├── JwtAuthenticationFilter.java    # JWT extraction and validation
│   │   │           └── UserPrincipal.java              # Authenticated user context
│   │   └── resources/
│   │       ├── application.yml                         # Base application config
│   │       ├── application-local.yml                   # Local dev overrides
│   │       ├── application-test.yml                    # Test profile config
│   │       └── db/
│   │           └── migration/
│   │               ├── V1__create_projects_table.sql   # Flyway baseline migration
│   │               └── V2__add_project_indexes.sql     # Performance indexes
│   └── test/
│       ├── java/
│       │   └── com/company/projectmgmt/
│       │       ├── controller/
│       │       │   └── ProjectControllerTest.java      # MockMvc slice tests (@WebMvcTest)
│       │       ├── service/
│       │       │   └── ProjectServiceImplTest.java     # Pure unit tests with Mockito
│       │       ├── repository/
│       │       │   └── ProjectRepositoryTest.java      # @DataJpaTest with Testcontainers
│       │       └── integration/
│       │           └── ProjectIntegrationTest.java     # Full-stack @SpringBootTest
│       └── resources/
│           └── application-test.yml                    # Testcontainers datasource override
├── Dockerfile                                          # Multi-stage production image
├── docker-compose.yml                                  # Local dev: app + postgres
├── docker-compose.test.yml                             # Integration test compose override
├── pom.xml                                             # Maven build descriptor
├── .gitignore
├── .editorconfig                                       # Consistent editor settings
├── tasks.md                                            # Agent-generated task tracker (see §3)
└── AGENTS.md                                           # This file
```

---

## 3. Required Workflow

The agent **must** follow these steps in order. Do not skip or reorder steps.

```
Step 1 — READ SPECIFICATIONS
  - Read all provided story/spec documents in full before writing any code.
  - Identify all entities, relationships, roles, business rules, and edge cases.
  - Note every acceptance criterion explicitly.

Step 2 — CREATE tasks.md
  - Create tasks.md at the project root.
  - Break the work into atomic, checkable tasks (one concern per task).
  - Format: GitHub-flavoured Markdown checkboxes [ ] / [x].
  - Include sections: Setup, Domain, Persistence, Service, API, Security, Tests, Docker, CI.
  - Do not proceed to Step 3 until tasks.md is committed.

Step 3 — SCAFFOLD STRUCTURE
  - Generate every file and folder listed in §2 with correct package declarations.
  - Populate pom.xml with all dependencies from §1 at their current stable versions.
  - Write application.yml with placeholder values and document each key inline.

Step 4 — IMPLEMENT (in this order)
  a. Flyway migrations (schema first)
  b. Domain entities and enums
  c. Repository interfaces
  d. DTOs (records) and MapStruct mappers
  e. Service interface then implementation
  f. REST controller
  g. Security configuration and JWT filter
  h. Exception handler and custom exceptions
  i. OpenAPI config and annotations

Step 5 — WRITE TESTS (before marking any task done)
  - Unit tests for every service method (ProjectServiceImplTest).
  - Controller slice tests for every endpoint (ProjectControllerTest).
  - Repository tests for all custom queries (ProjectRepositoryTest).
  - At least one happy-path and one failure-path integration test.
  - Run: mvn verify — all tests must pass before continuing.

Step 6 — VALIDATE
  - Run mvn verify -P coverage and confirm ≥ 90% line coverage.
  - Run mvn checkstyle:check — zero violations.
  - Run docker compose up --build and smoke-test the /actuator/health endpoint.
  - Check all tasks.md items are marked [x].

Step 7 — FINALISE
  - Update tasks.md to reflect completion.
  - Ensure no secrets or credentials are committed (use environment variable references only).
```

---

## 4. Coding Conventions

### Naming
| Artefact | Convention | Example |
|---|---|---|
| Classes | `PascalCase` | `ProjectServiceImpl` |
| Methods / variables | `camelCase` | `findProjectById` |
| Constants | `UPPER_SNAKE_CASE` | `MAX_PROJECT_NAME_LENGTH` |
| Database tables | `snake_case`, plural | `projects`, `project_members` |
| Database columns | `snake_case` | `created_at`, `owner_id` |
| REST endpoints | `kebab-case`, plural nouns | `/api/v1/projects` |
| Flyway scripts | `V{n}__{description}.sql` | `V1__create_projects_table.sql` |
| Test classes | Mirror source class + `Test` | `ProjectServiceImplTest` |

### Architecture Patterns
- **Layered architecture**: Controller → Service → Repository. No layer may skip another.
- **Controller** responsibilities: HTTP mapping, request validation (`@Valid`), response serialisation only. Zero business logic.
- **Service** responsibilities: all business rules, transaction boundaries (`@Transactional`), orchestration.
- **Repository** responsibilities: data access only. No business logic.
- Use **constructor injection** everywhere; never `@Autowired` on fields.
- DTOs **must** be Java records. Entities **must** be JPA `@Entity` classes (not records).
- All public service methods must be covered by a `@Transactional` annotation (read-only where applicable).
- Use `Optional<T>` returns from repositories; never return `null`.
- Throw domain-specific exceptions from the service layer; let `GlobalExceptionHandler` map them to HTTP responses.
- Pagination is mandatory on all list endpoints (`Pageable` parameter, `Page<T>` response).

### Style
- Google Java Style Guide enforced via Checkstyle plugin in `pom.xml`.
- Maximum line length: **120 characters**.
- No wildcard imports.
- Every public class and method must have a Javadoc comment.
- Use `@Slf4j` (Lombok) for logging; log at `DEBUG` for entry/exit of service methods, `ERROR` for exceptions.

### Security Conventions
- Roles defined as `ROLE_ADMIN`, `ROLE_PROJECT_MANAGER`, `ROLE_VIEWER`.
- Use `@PreAuthorize` annotations on controller methods for fine-grained access control.
- JWT claims must include `sub` (user ID), `roles`, `iat`, `exp`.
- Never log JWT tokens or passwords at any log level.

---

## 5. Testing

### Test Layers and Tools

| Layer | Annotation | Dependencies |
|---|---|---|
| Unit — Service | `@ExtendWith(MockitoExtension.class)` | Mockito, AssertJ |
| Unit — Controller | `@WebMvcTest(ProjectController.class)` | MockMvc, Mockito |
| Integration — Repository | `@DataJpaTest` + Testcontainers | Testcontainers PostgreSQL |
| Integration — Full Stack | `@SpringBootTest(webEnvironment = RANDOM_PORT)` + Testcontainers | Full context |

### Writing Tests — Rules
1. Follow **Arrange / Act / Assert** structure with blank-line separation; add comments for each section.
2. Test method naming: `methodName_stateUnderTest_expectedBehaviour` (e.g., `createProject_whenNameDuplicate_throwsProjectAlreadyExistsException`).
3. Every service method must have tests for: happy path, not-found case, validation failure, and authorization failure.
4. Use `@ParameterizedTest` for boundary-value and equivalence-partition cases.
5. Mock only the **direct** collaborators of the class under test.
6. Do not use `@SpringBootTest` for unit tests — keep them fast.
7. Testcontainers configuration must use the `@Testcontainers` + `@Container` pattern with a shared static container per test class.

### Coverage
- **Minimum 90% line coverage** enforced by JaCoCo Maven plugin.
- Configure JaCoCo to **fail the build** if coverage drops below 90%.
- Exclude the following from coverage: `*Application.java`, `*Config.java`, `*Properties.java`, `*MapperImpl.java`.

### Running Tests
```bash
# All tests
mvn verify

# Unit tests only
mvn test

# Integration tests only
mvn failsafe:integration-test

# Coverage report (target/site/jacoco/index.html)
mvn verify -P coverage
```

### pom.xml Plugin Snippets (required)
```xml
<!-- JaCoCo -->
<plugin>
  <groupId>org.jacoco</groupId>
  <artifactId>jacoco-maven-plugin</artifactId>
  <version>0.8.11</version>
  <configuration>
    <excludes>
      <exclude>**/*Application.class</exclude>
      <exclude>**/*Config.class</exclude>
      <exclude>**/*Properties.class</exclude>
      <exclude>**/*MapperImpl.class</exclude>
    </excludes>
  </configuration>
  <executions>
    <execution>
      <id>jacoco-check</id>
      <goals><goal>check</goal></goals>
      <configuration>
        <rules>
          <rule>
            <element>BUNDLE</element>
            <limits>
              <limit>
                <counter>LINE</counter>
                <value>COVEREDRATIO</value>
                <minimum>0.90</minimum>
              </limit>
            </limits>
          </rule>
        </rules>
      </configuration>
    </execution>
  </executions>
</plugin>
```

---

## 6. Docker & CI

### Dockerfile (multi-stage)
```dockerfile
# ── Stage 1: Build ──────────────────────────────────────────────
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /workspace

COPY pom.xml .
COPY src ./src

RUN ./mvnw -B -q package -DskipTests

# ── Stage 2: Runtime ────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine AS runtime

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

WORKDIR /app
COPY --from=builder /workspace/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "app.jar"]
```

### docker-compose.yml (local development)
```yaml
version: "3.9"
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: projectmgmt
      POSTGRES_USER: ${DB_USER:-appuser}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-changeme}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./docker/postgres/init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-appuser}"]
      interval: 10s
      timeout: 5s
      retries: 5

  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      SPRING_PROFILES_ACTIVE: local
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/projectmgmt
      SPRING_DATASOURCE_USERNAME: ${DB_USER:-appuser}
      SPRING_DATASOURCE_PASSWORD: ${DB_PASSWORD:-changeme}
      JWT_SECRET: ${JWT_SECRET:-replace-in-production}
    depends_on:
      postgres:
        condition: service_healthy

volumes:
  postgres_data:
```

### application.yml (required keys)
```yaml
spring:
  application:
    name: project-management-service
  datasource:
    url: ${SPRING_DATASOURCE_URL}
    username: ${SPRING_DATASOURCE_USERNAME