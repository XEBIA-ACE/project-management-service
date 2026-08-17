package com.projectmanagement.domain.port.out;

import com.projectmanagement.domain.model.Project;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Outbound port — defines the persistence contract that the domain layer requires.
 *
 * <p>The domain service depends on this interface; the concrete implementation lives in
 * the persistence adapter and is injected at runtime by Spring.</p>
 */
public interface ProjectRepository {

    /**
     * Persists a new project or updates an existing one.
     *
     * @param project the domain entity to persist
     * @return the saved domain entity (may contain generated fields such as {@code createdAt})
     */
    Project save(Project project);

    /**
     * Finds a project by its unique identifier.
     *
     * @param id the project UUID
     * @return an {@link Optional} containing the project if found, or empty otherwise
     */
    Optional<Project> findById(UUID id);

    /**
     * Returns all persisted projects.
     *
     * @return a list of all projects; never {@code null}
     */
    List<Project> findAll();

    /**
     * Removes a project record permanently from the store.
     *
     * <p>Note: the domain service performs a soft-delete by updating the status to
     * {@code DELETED} before calling this method only when a hard-delete is required.
     * For soft-deletes, {@link #save(Project)} is used instead.</p>
     *
     * @param id the UUID of the project to remove
     */
    void deleteById(UUID id);
}
