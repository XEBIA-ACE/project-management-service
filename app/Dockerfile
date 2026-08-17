# =============================================================================
# Stage 1 — Build
# =============================================================================
FROM maven:3.9-eclipse-temurin-17 AS builder

WORKDIR /build

# Copy dependency descriptor first to leverage Docker layer caching.
# Dependencies are only re-downloaded when pom.xml changes.
COPY pom.xml .
RUN mvn dependency:go-offline -B --no-transfer-progress

# Copy the full source tree and build the fat JAR, skipping tests
# (tests are run in CI, not during the Docker image build).
COPY src ./src
RUN mvn package -DskipTests -B --no-transfer-progress

# =============================================================================
# Stage 2 — Runtime
# =============================================================================
FROM eclipse-temurin:17-jre-alpine AS runtime

# Create a non-root user for security best practices.
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy only the fat JAR from the build stage.
COPY --from=builder /build/target/project-management-service-*.jar app.jar

# Ensure the non-root user owns the application files.
RUN chown -R appuser:appgroup /app

USER appuser

# Expose the application port.
EXPOSE 8080

# JVM tuning for containerised environments:
#   -XX:+UseContainerSupport          — respect cgroup CPU/memory limits
#   -XX:MaxRAMPercentage=75.0         — use up to 75 % of container RAM for heap
#   -Djava.security.egd=...           — faster startup by using /dev/urandom
ENTRYPOINT ["java", \
            "-XX:+UseContainerSupport", \
            "-XX:MaxRAMPercentage=75.0", \
            "-Djava.security.egd=file:/dev/./urandom", \
            "-jar", "app.jar"]
