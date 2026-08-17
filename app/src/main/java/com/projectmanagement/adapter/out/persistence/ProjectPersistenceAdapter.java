package com.projectmanagement.adapter.out.persistence;

import com.projectmanagement.domain.model.Project;
import com.projectmanagement.domain.port.out.ProjectRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Persistence adapter — implements the outbound port {@link ProjectRepository}
 * by delegating to Spring Data JPA via {@link ProjectJpaRepository}.
 *
 * <p>This class is the only place where JPA-specific concerns (entities, queries)
 * are allowed to cross into the application. The domain service never sees JPA.</p>
 */
@Component
public class ProjectPersistenceAdapter implements ProjectRepository {

    private final ProjectJpaRepository jpaRepository;
    private final ProjectMapper        mapper;

    public ProjectPersistenceAdapter(ProjectJpaRepository jpaRepository,
                                     ProjectMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.mapper        = mapper;
    }

    /**
     * {@inheritDoc}
     *
     * <p>Converts the domain model to a JPA entity, delegates to Spring Data JPA,
     * and converts the saved entity back to a domain model.</p>
     */
    @Override
    public Project save(Project project) {
        ProjectEntity entity    = mapper.toEntity(project);
        ProjectEntity saved     = jpaRepository.save(entity);
        return mapper.toDomain(saved);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Optional<Project> findById(UUID id) {
        return jpaRepository.findById(id)
                            .map(mapper::toDomain);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public List<Project> findAll() {
        return jpaRepository.findAll()
                            .stream()
                            .map(mapper::toDomain)
                            .collect(Collectors.toList());
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public void deleteById(UUID id) {
        jpaRepository.deleteById(id);
    }
}
