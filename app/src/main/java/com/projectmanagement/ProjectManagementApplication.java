package com.projectmanagement;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Entry point for the Project Management Service.
 *
 * <p>This service follows the <em>Hexagonal Architecture</em> (Ports and Adapters) pattern:
 * <ul>
 *   <li><strong>Domain layer</strong> — pure business logic, no framework dependencies
 *       ({@code com.projectmanagement.domain})</li>
 *   <li><strong>Application layer</strong> — DTOs and orchestration
 *       ({@code com.projectmanagement.application})</li>
 *   <li><strong>Adapters (inbound)</strong> — REST controllers that drive the application
 *       ({@code com.projectmanagement.adapter.in})</li>
 *   <li><strong>Adapters (outbound)</strong> — JPA persistence that the application drives
 *       ({@code com.projectmanagement.adapter.out})</li>
 * </ul>
 * </p>
 */
@SpringBootApplication
public class ProjectManagementApplication {

    public static void main(String[] args) {
        SpringApplication.run(ProjectManagementApplication.class, args);
    }
}
