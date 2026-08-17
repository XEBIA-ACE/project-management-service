package com.projectmanagement.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

/**
 * Request DTO for creating a new project.
 *
 * <p>Validated at the controller layer via {@code @Valid} before the use-case is invoked.</p>
 */
public class CreateProjectRequest {

    @NotBlank(message = "Project name must not be blank")
    @Size(min = 1, max = 255, message = "Project name must be between 1 and 255 characters")
    private String name;

    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    private String description;

    @NotNull(message = "Owner ID must not be null")
    private UUID ownerId;

    public CreateProjectRequest() {}

    public CreateProjectRequest(String name, String description, UUID ownerId) {
        this.name        = name;
        this.description = description;
        this.ownerId     = ownerId;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public UUID getOwnerId() { return ownerId; }
    public void setOwnerId(UUID ownerId) { this.ownerId = ownerId; }
}
