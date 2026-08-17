package com.projectmanagement.domain.service;

import com.projectmanagement.application.dto.CreateProjectRequest;
import com.projectmanagement.application.dto.ProjectResponse;
import com.projectmanagement.application.dto.UpdateProjectRequest;
import com.projectmanagement.domain.exception.ProjectNotFoundException;
import com.projectmanagement.domain.model.Project;
import com.projectmanagement.domain.model.ProjectStatus;
import com.projectmanagement.domain.port.in.ProjectUseCase;
import com.projectmanagement.domain.port.out.ProjectRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Domain service that orchestrates project-related use-cases.
 *
 * <p>This class sits at the centre of the hexagon. It depends only on the outbound
 * {@link ProjectRepository} port and implements the inbound {@link ProjectUseCase} port.
 * No framework-specific code should leak into this class beyond the Spring
 * {@code @Service} / {@code @Transactional} annotations needed for lifecycle management.</p>
 */
@Service
@Transactional
public class ProjectService implements ProjectUseCase {

    private final ProjectRepository projectRepository;

    public ProjectService(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    // -------------------------------------------------------------------------
    // Use-case implementations
    // -------------------------------------------------------------------------

    /**
     * {@inheritDoc}
     *
     * <p>Assigns a new random UUID, sets the initial status to {@link ProjectStatus#ACTIVE},
     * and records the creation timestamp before persisting.</p>
     */
    @Override
    public ProjectResponse createProject(CreateProjectRequest request) {
        Instant now = Instant.now();

        Project project = Project.builder()
                .id(UUID.randomUUID())
                .name(request.getName())
                .description(request.getDescription())
                .status(ProjectStatus.ACTIVE)
                .ownerId(request.getOwnerId())
                .createdAt(now)
                .updatedAt(now)
                .build();

        Project saved = projectRepository.save(project);
        return toResponse(saved);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional(readOnly = true)
    public ProjectResponse getProjectById(UUID id) {
        Project project = findOrThrow(id);
        return toResponse(project);
    }

    /**
     * {@inheritDoc}
     *
     * <p>Delegates field-level update logic to {@link Project#update(String, String, ProjectStatus)}
     * to keep business rules inside the domain model.</p>
     */
    @Override
    public ProjectResponse updateProject(UUID id, UpdateProjectRequest request) {
        Project project = findOrThrow(id);
        project.update(request.getName(), request.getDescription(), request.getStatus());
        Project saved = projectRepository.save(project);
        return toResponse(saved);
    }

    /**
     * {@inheritDoc}
     *
     * <p>Performs a soft-delete: sets the project status to {@link ProjectStatus#DELETED}
     * and persists the change rather than removing the record from the database.</p>
     */
    @Override
    public void deleteProject(UUID id) {
        Project project = findOrThrow(id);
        project.softDelete();
        projectRepository.save(project);
    }

    /**
     * {@inheritDoc}
     *
     * <p>Returns all projects regardless of status. Filtering by status (e.g. excluding
     * {@link ProjectStatus#DELETED}) can be added here or pushed down to the repository
     * query as a future enhancement.</p>
     */
    @Override
    @Transactional(readOnly = true)
    public List<ProjectResponse> listProjects() {
        return projectRepository.findAll()
                .stream()
                .filter(p -> !ProjectStatus.DELETED.equals(p.getStatus()))
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    private Project findOrThrow(UUID id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new ProjectNotFoundException(id));
    }

    private ProjectResponse toResponse(Project project) {
        return ProjectResponse.builder()
                .id(project.getId())
                .name(project.getName())
                .description(project.getDescription())
                .status(project.getStatus())
                .ownerId(project.getOwnerId())
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .build();
    }
}
