package com.projectmanagement.domain.port.in;

import com.projectmanagement.application.dto.CreateProjectRequest;
import com.projectmanagement.application.dto.ProjectResponse;
import com.projectmanagement.application.dto.UpdateProjectRequest;

import java.util.List;
import java.util.UUID;

/**
 * Inbound port — defines all use-cases that the application exposes to the outside world.
 *
 * <p>Driving adapters (e.g. REST controllers) depend on this interface, never on the
 * concrete domain service implementation.</p>
 */
public interface ProjectUseCase {

    /**
     * Creates a new project from the supplied request data.
     *
     * @param request validated creation payload
     * @return the newly created project as a response DTO
     */
    ProjectResponse createProject(CreateProjectRequest request);

    /**
     * Retrieves a single project by its unique identifier.
     *
     * @param id the project UUID
     * @return the project response DTO
     * @throws com.projectmanagement.domain.exception.ProjectNotFoundException if no project exists with the given id
     */
    ProjectResponse getProjectById(UUID id);

    /**
     * Updates an existing project with the supplied data.
     *
     * @param id      the UUID of the project to update
     * @param request the update payload (fields may be partial)
     * @return the updated project as a response DTO
     * @throws com.projectmanagement.domain.exception.ProjectNotFoundException if no project exists with the given id
     */
    ProjectResponse updateProject(UUID id, UpdateProjectRequest request);

    /**
     * Soft-deletes a project by its unique identifier.
     *
     * @param id the UUID of the project to delete
     * @throws com.projectmanagement.domain.exception.ProjectNotFoundException if no project exists with the given id
     */
    void deleteProject(UUID id);

    /**
     * Returns all projects that are not soft-deleted.
     *
     * @return list of project response DTOs
     */
    List<ProjectResponse> listProjects();
}
