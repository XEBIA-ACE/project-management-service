package com.projectmanagement.application.dto;

import com.projectmanagement.domain.model.ProjectStatus;
import jakarta.validation.constraints.Size;

/**
 * Request DTO for updating an existing project.
 *
 * <p>All fields are optional — only non-null values will be applied to the domain entity.
 * Validated at the controller layer via {@code @Valid}.</p>
 */
public class UpdateProjectRequest {

    @Size(min = 1, max = 255, message = "Project name must be between 1 and 255 characters")
    private String name;

    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    private String description;

    private ProjectStatus status;

    public UpdateProjectRequest() {}

    public UpdateProjectRequest(String name, String description, ProjectStatus status) {
        this.name        = name;
        this.description = description;
        this.status      = status;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public ProjectStatus getStatus() { return status; }
    public void setStatus(ProjectStatus status) { this.status = status; }
}
