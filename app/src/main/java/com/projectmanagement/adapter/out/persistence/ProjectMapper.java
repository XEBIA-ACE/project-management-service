package com.projectmanagement.adapter.out.persistence;

import com.projectmanagement.domain.model.Project;
import org.springframework.stereotype.Component;

/**
 * Stateless mapper that converts between the {@link Project} domain model and
 * the {@link ProjectEntity} JPA entity.
 *
 * <p>Keeping mapping logic in a dedicated class prevents both the domain model
 * and the JPA entity from accumulating framework-specific concerns.</p>
 */
@Component
public class ProjectMapper {

    /**
     * Converts a domain {@link Project} to a {@link ProjectEntity} suitable for
     * persistence.
     *
     * @param project the domain model; must not be {@code null}
     * @return a new {@link ProjectEntity} populated from the domain model
     */
    public ProjectEntity toEntity(Project project) {
        ProjectEntity entity = new ProjectEntity();
        entity.setId(project.getId());
        entity.setName(project.getName());
        entity.setDescription(project.getDescription());
        entity.setStatus(project.getStatus());
        entity.setOwnerId(project.getOwnerId());
        entity.setCreatedAt(project.getCreatedAt());
        entity.setUpdatedAt(project.getUpdatedAt());
        return entity;
    }

    /**
     * Converts a {@link ProjectEntity} retrieved from the database to a domain
     * {@link Project}.
     *
     * @param entity the JPA entity; must not be {@code null}
     * @return a new {@link Project} populated from the entity
     */
    public Project toDomain(ProjectEntity entity) {
        return Project.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .status(entity.getStatus())
                .ownerId(entity.getOwnerId())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
