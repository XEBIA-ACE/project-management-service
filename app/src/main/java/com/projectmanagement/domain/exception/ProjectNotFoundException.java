package com.projectmanagement.domain.exception;

import java.util.UUID;

/**
 * Thrown when a requested project cannot be found in the repository.
 */
public class ProjectNotFoundException extends RuntimeException {

    private final UUID projectId;

    public ProjectNotFoundException(UUID projectId) {
        super("Project not found with id: " + projectId);
        this.projectId = projectId;
    }

    public UUID getProjectId() {
        return projectId;
    }
}
