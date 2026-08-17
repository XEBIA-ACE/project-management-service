package com.projectmanagement.domain.model;

import java.time.Instant;
import java.util.UUID;

/**
 * Core domain entity representing a Project.
 *
 * <p>This is a pure POJO — it carries no framework or persistence annotations.
 * All business invariants live here or in the domain service layer.</p>
 */
public class Project {

    private UUID id;
    private String name;
    private String description;
    private ProjectStatus status;
    private UUID ownerId;
    private Instant createdAt;
    private Instant updatedAt;

    /** No-arg constructor required for mapping utilities. */
    public Project() {}

    private Project(Builder builder) {
        this.id          = builder.id;
        this.name        = builder.name;
        this.description = builder.description;
        this.status      = builder.status;
        this.ownerId     = builder.ownerId;
        this.createdAt   = builder.createdAt;
        this.updatedAt   = builder.updatedAt;
    }

    // -------------------------------------------------------------------------
    // Business behaviour
    // -------------------------------------------------------------------------

    /**
     * Archives this project, transitioning its status to {@link ProjectStatus#ARCHIVED}.
     *
     * @throws IllegalStateException if the project is already deleted.
     */
    public void archive() {
        if (ProjectStatus.DELETED.equals(this.status)) {
            throw new IllegalStateException("Cannot archive a deleted project.");
        }
        this.status    = ProjectStatus.ARCHIVED;
        this.updatedAt = Instant.now();
    }

    /**
     * Soft-deletes this project by setting its status to {@link ProjectStatus#DELETED}.
     */
    public void softDelete() {
        this.status    = ProjectStatus.DELETED;
        this.updatedAt = Instant.now();
    }

    /**
     * Updates mutable fields of the project.
     *
     * @param name        new name (ignored if {@code null})
     * @param description new description (ignored if {@code null})
     * @param status      new status (ignored if {@code null})
     */
    public void update(String name, String description, ProjectStatus status) {
        if (name != null && !name.isBlank()) {
            this.name = name;
        }
        if (description != null) {
            this.description = description;
        }
        if (status != null) {
            this.status = status;
        }
        this.updatedAt = Instant.now();
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
        private ProjectStatus status = ProjectStatus.ACTIVE;
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

        public Project build() { return new Project(this); }
    }

    @Override
    public String toString() {
        return "Project{" +
               "id=" + id +
               ", name='" + name + '\'' +
               ", status=" + status +
               ", ownerId=" + ownerId +
               '}';
    }
}
