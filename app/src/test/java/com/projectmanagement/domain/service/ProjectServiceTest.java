package com.projectmanagement.domain.service;

import com.projectmanagement.application.dto.CreateProjectRequest;
import com.projectmanagement.application.dto.ProjectResponse;
import com.projectmanagement.application.dto.UpdateProjectRequest;
import com.projectmanagement.domain.exception.ProjectNotFoundException;
import com.projectmanagement.domain.model.Project;
import com.projectmanagement.domain.model.ProjectStatus;
import com.projectmanagement.domain.port.out.ProjectRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Pure unit tests for {@link ProjectService}.
 *
 * <p>No Spring context is loaded — all dependencies are mocked with Mockito.</p>
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("ProjectService")
class ProjectServiceTest {

    @Mock
    private ProjectRepository projectRepository;

    @InjectMocks
    private ProjectService projectService;

    private UUID   projectId;
    private UUID   ownerId;
    private Project sampleProject;

    @BeforeEach
    void setUp() {
        projectId     = UUID.randomUUID();
        ownerId       = UUID.randomUUID();
        sampleProject = Project.builder()
                               .id(projectId)
                               .name("Test Project")
                               .description("A test project")
                               .status(ProjectStatus.ACTIVE)
                               .ownerId(ownerId)
                               .createdAt(Instant.now())
                               .updatedAt(Instant.now())
                               .build();
    }

    // =========================================================================
    // createProject
    // =========================================================================

    @Nested
    @DisplayName("createProject")
    class CreateProject {

        @Test
        @DisplayName("should persist a new project and return a response DTO")
        void createProject_persistsAndReturnsResponse() {
            // Arrange
            CreateProjectRequest request = new CreateProjectRequest(
                    "Test Project", "A test project", ownerId);

            when(projectRepository.save(any(Project.class))).thenReturn(sampleProject);

            // Act
            ProjectResponse response = projectService.createProject(request);

            // Assert
            assertThat(response).isNotNull();
            assertThat(response.getName()).isEqualTo("Test Project");
            assertThat(response.getDescription()).isEqualTo("A test project");
            assertThat(response.getOwnerId()).isEqualTo(ownerId);
            assertThat(response.getStatus()).isEqualTo(ProjectStatus.ACTIVE);

            // Verify the entity passed to save has the correct fields
            ArgumentCaptor<Project> captor = ArgumentCaptor.forClass(Project.class);
            verify(projectRepository, times(1)).save(captor.capture());
            Project saved = captor.getValue();
            assertThat(saved.getName()).isEqualTo("Test Project");
            assertThat(saved.getOwnerId()).isEqualTo(ownerId);
            assertThat(saved.getStatus()).isEqualTo(ProjectStatus.ACTIVE);
            assertThat(saved.getId()).isNotNull();
        }
    }

    // =========================================================================
    // getProjectById
    // =========================================================================

    @Nested
    @DisplayName("getProjectById")
    class GetProjectById {

        @Test
        @DisplayName("should return the project when it exists")
        void getProjectById_found_returnsResponse() {
            when(projectRepository.findById(projectId)).thenReturn(Optional.of(sampleProject));

            ProjectResponse response = projectService.getProjectById(projectId);

            assertThat(response).isNotNull();
            assertThat(response.getId()).isEqualTo(projectId);
            assertThat(response.getName()).isEqualTo("Test Project");
            verify(projectRepository, times(1)).findById(projectId);
        }

        @Test
        @DisplayName("should throw ProjectNotFoundException when project does not exist")
        void getProjectById_notFound_throwsException() {
            when(projectRepository.findById(projectId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> projectService.getProjectById(projectId))
                    .isInstanceOf(ProjectNotFoundException.class)
                    .hasMessageContaining(projectId.toString());

            verify(projectRepository, times(1)).findById(projectId);
        }
    }

    // =========================================================================
    // updateProject
    // =========================================================================

    @Nested
    @DisplayName("updateProject")
    class UpdateProject {

        @Test
        @DisplayName("should update mutable fields and return updated response")
        void updateProject_updatesFieldsAndReturnsResponse() {
            UpdateProjectRequest request = new UpdateProjectRequest(
                    "Updated Name", "Updated description", ProjectStatus.ARCHIVED);

            Project updatedProject = Project.builder()
                                            .id(projectId)
                                            .name("Updated Name")
                                            .description("Updated description")
                                            .status(ProjectStatus.ARCHIVED)
                                            .ownerId(ownerId)
                                            .createdAt(sampleProject.getCreatedAt())
                                            .updatedAt(Instant.now())
                                            .build();

            when(projectRepository.findById(projectId)).thenReturn(Optional.of(sampleProject));
            when(projectRepository.save(any(Project.class))).thenReturn(updatedProject);

            ProjectResponse response = projectService.updateProject(projectId, request);

            assertThat(response.getName()).isEqualTo("Updated Name");
            assertThat(response.getStatus()).isEqualTo(ProjectStatus.ARCHIVED);
            verify(projectRepository).findById(projectId);
            verify(projectRepository).save(any(Project.class));
        }

        @Test
        @DisplayName("should throw ProjectNotFoundException when project does not exist")
        void updateProject_notFound_throwsException() {
            when(projectRepository.findById(projectId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> projectService.updateProject(
                    projectId, new UpdateProjectRequest("x", null, null)))
                    .isInstanceOf(ProjectNotFoundException.class);
        }
    }

    // =========================================================================
    // deleteProject
    // =========================================================================

    @Nested
    @DisplayName("deleteProject")
    class DeleteProject {

        @Test
        @DisplayName("should soft-delete the project by saving with DELETED status")
        void deleteProject_softDeletesProject() {
            when(projectRepository.findById(projectId)).thenReturn(Optional.of(sampleProject));
            when(projectRepository.save(any(Project.class))).thenReturn(sampleProject);

            projectService.deleteProject(projectId);

            ArgumentCaptor<Project> captor = ArgumentCaptor.forClass(Project.class);
            verify(projectRepository).save(captor.capture());
            assertThat(captor.getValue().getStatus()).isEqualTo(ProjectStatus.DELETED);
        }

        @Test
        @DisplayName("should throw ProjectNotFoundException when project does not exist")
        void deleteProject_notFound_throwsException() {
            when(projectRepository.findById(projectId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> projectService.deleteProject(projectId))
                    .isInstanceOf(ProjectNotFoundException.class);

            verify(projectRepository, never()).save(any());
        }
    }

    // =========================================================================
    // listProjects
    // =========================================================================

    @Nested
    @DisplayName("listProjects")
    class ListProjects {

        @Test
        @DisplayName("should return all non-deleted projects")
        void listProjects_returnsActiveAndArchivedProjects() {
            Project archived = Project.builder()
                                      .id(UUID.randomUUID())
                                      .name("Archived")
                                      .status(ProjectStatus.ARCHIVED)
                                      .ownerId(ownerId)
                                      .createdAt(Instant.now())
                                      .updatedAt(Instant.now())
                                      .build();

            Project deleted = Project.builder()
                                     .id(UUID.randomUUID())
                                     .name("Deleted")
                                     .status(ProjectStatus.DELETED)
                                     .ownerId(ownerId)
                                     .createdAt(Instant.now())
                                     .updatedAt(Instant.now())
                                     .build();

            when(projectRepository.findAll()).thenReturn(List.of(sampleProject, archived, deleted));

            List<ProjectResponse> responses = projectService.listProjects();

            // DELETED projects are filtered out
            assertThat(responses).hasSize(2);
            assertThat(responses).extracting(ProjectResponse::getStatus)
                                 .doesNotContain(ProjectStatus.DELETED);
        }
    }
}
