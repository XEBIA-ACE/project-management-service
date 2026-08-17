package com.projectmanagement.adapter.out.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

/**
 * Spring Data JPA repository for {@link ProjectEntity}.
 *
 * <p>This interface is an implementation detail of the persistence adapter and
 * must not be referenced outside the {@code adapter.out.persistence} package.
 * The domain layer interacts with the outbound port
 * {@link com.projectmanagement.domain.port.out.ProjectRepository} instead.</p>
 */
@Repository
public interface ProjectJpaRepository extends JpaRepository<ProjectEntity, UUID> {
    // Spring Data JPA provides all required CRUD operations via JpaRepository.
    // Custom query methods can be added here as the feature set grows.
}
