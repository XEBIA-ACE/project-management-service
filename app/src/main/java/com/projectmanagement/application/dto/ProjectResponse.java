package com.projectmanagement.application.dto;

import com.projectmanagement.domain.model.ProjectStatus;

import java.time.Instant;
import java.util.UUID;

/**
 * Response DTO returned to API consumers.
 *
 * <p>Mirrors the {@link com.projectmanagement.domain.model.Project} domain model fields
 * but is decoupled from it so that the API contract can evolve independently.</p>
 */
public class ProjectResponse {

    private UUID id;
    private String name;
    private String description;
    private ProjectStatus status;
    private UUID ownerId;
    private Instant createdAt;
    private Instant updatedAt;

    public ProjectResponse() {}

    /** All-args constructor for convenient test construction. */
    public ProjectResponse(UUID id, String name, String description,
                           ProjectStatus status, UUID ownerId,
                           Instant createdAt, Instant updatedAt) {
        this.id          = id;
        this.name        = name;
        this.description = description;
        this.status      = status;
        this.ownerId     = ownerId;
        this.createdAt   = createdAt;
        this.updatedAt   = updatedAt;
    }

    private ProjectResponse(Builder builder) {
        this.id          = builder.id;
        this.name        = builder.name;
        this.description = builder.description;
        this.status      = builder.status;
        this.ownerId     = builder.ownerId;
        this.createdAt   = builder.createdAt;
        this.updatedAt   = builder.updatedAt;
    }

    // -------------------------------------------------------------------------
    // Getters & Setters
    // -------------------------------------------------------------------------

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public ProjectStatus getStatus() { return status; }
    public void setStatus(ProjectStatus status) { this.status = status; }

    public UUID getOwnerId() { return ownerId; }
    public void setOwnerId(UUID ownerId) { this.ownerId = ownerId; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    // -------------------------------------------------------------------------
    // Builder
    // -------------------------------------------------------------------------

    public static Builder builder() { return new Builder(); }

    public static final class Builder {
        private UUID id;
        private String name;
        private String description;
        private ProjectStatus status;
        private UUID ownerId;
        private Instant createdAt;
        private Instant updatedAt;

        private Builder() {}

        public Builder id(UUID id)                   { this.id = id; return this; }
        public Builder name(String name)             { this.name = name; return this; }
        public Builder description(String desc)      { this.description = desc; return this; }
        public Builder status(ProjectStatus status)  { this.status = status; return this; }
        public Builder ownerId(UUID ownerId)         { this.ownerId = ownerId; return this; }
        public Builder createdAt(Instant createdAt)  { this.createdAt = createdAt; return this; }
        public Builder updatedAt(Instant updatedAt)  { this.updatedAt = updatedAt; return this; }

        public ProjectResponse build() { return new ProjectResponse(this); }
    }
}
