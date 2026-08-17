package com.projectmanagement.adapter.in.web;

import com.projectmanagement.application.dto.CreateProjectRequest;
import com.projectmanagement.application.dto.ProjectResponse;
import com.projectmanagement.application.dto.UpdateProjectRequest;
import com.projectmanagement.domain.exception.ProjectNotFoundException;
import com.projectmanagement.domain.port.in.ProjectUseCase;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST adapter (inbound) for project-related operations.
 *
 * <p>Translates HTTP requests into use-case calls and maps domain exceptions to
 * appropriate HTTP responses. This class must not contain any business logic —
 * it is purely a translation layer.</p>
 */
@RestController
@RequestMapping("/api/v1/projects")
public class ProjectController {

    private final ProjectUseCase projectUseCase;

    public ProjectController(ProjectUseCase projectUseCase) {
        this.projectUseCase = projectUseCase;
    }

    // -------------------------------------------------------------------------
    // POST /api/v1/projects
    // -------------------------------------------------------------------------

    /**
     * Creates a new project.
     *
     * @param request validated creation payload
     * @return 201 Created with the new project in the response body
     */
    @PostMapping
    public ResponseEntity<ProjectResponse> createProject(
            @Valid @RequestBody CreateProjectRequest request) {

        ProjectResponse response = projectUseCase.createProject(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // -------------------------------------------------------------------------
    // GET /api/v1/projects/{id}
    // -------------------------------------------------------------------------

    /**
     * Retrieves a single project by ID.
     *
     * @param id the project UUID path variable
     * @return 200 OK with the project, or 404 Not Found if it does not exist
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProjectResponse> getProjectById(@PathVariable UUID id) {
        ProjectResponse response = projectUseCase.getProjectById(id);
        return ResponseEntity.ok(response);
    }

    // -------------------------------------------------------------------------
    // GET /api/v1/projects
    // -------------------------------------------------------------------------

    /**
     * Lists all non-deleted projects.
     *
     * @return 200 OK with a (possibly empty) list of projects
     */
    @GetMapping
    public ResponseEntity<List<ProjectResponse>> listProjects() {
        List<ProjectResponse> projects = projectUseCase.listProjects();
        return ResponseEntity.ok(projects);
    }

    // -------------------------------------------------------------------------
    // PUT /api/v1/projects/{id}
    // -------------------------------------------------------------------------

    /**
     * Updates an existing project.
     *
     * @param id      the project UUID path variable
     * @param request the update payload
     * @return 200 OK with the updated project, or 404 Not Found
     */
    @PutMapping("/{id}")
    public ResponseEntity<ProjectResponse> updateProject(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateProjectRequest request) {

        ProjectResponse response = projectUseCase.updateProject(id, request);
        return ResponseEntity.ok(response);
    }

    // -------------------------------------------------------------------------
    // DELETE /api/v1/projects/{id}
    // -------------------------------------------------------------------------

    /**
     * Soft-deletes a project.
     *
     * @param id the project UUID path variable
     * @return 204 No Content on success, or 404 Not Found
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable UUID id) {
        projectUseCase.deleteProject(id);
        return ResponseEntity.noContent().build();
    }

    // -------------------------------------------------------------------------
    // Exception handlers
    // -------------------------------------------------------------------------

    /**
     * Handles {@link ProjectNotFoundException} thrown by the domain service and
     * returns a 404 response with a descriptive message.
     */
    @ExceptionHandler(ProjectNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleProjectNotFound(ProjectNotFoundException ex) {
        ErrorResponse error = new ErrorResponse(
                HttpStatus.NOT_FOUND.value(),
                ex.getMessage()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    /**
     * Minimal error response body.
     */
    public record ErrorResponse(int status, String message) {}
}
