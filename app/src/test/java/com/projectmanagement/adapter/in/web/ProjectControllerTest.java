package com.projectmanagement.adapter.in.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.projectmanagement.application.dto.CreateProjectRequest;
import com.projectmanagement.application.dto.ProjectResponse;
import com.projectmanagement.domain.exception.ProjectNotFoundException;
import com.projectmanagement.domain.model.ProjectStatus;
import com.projectmanagement.domain.port.in.ProjectUseCase;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Web-layer slice tests for {@link ProjectController}.
 *
 * <p>Uses {@code @WebMvcTest} — only the MVC layer is loaded.
 * {@link ProjectUseCase} is mocked via {@code @MockBean}.</p>
 */
@WebMvcTest(ProjectController.class)
@DisplayName("ProjectController")
class ProjectControllerTest {

    private static final String BASE_URL = "/api/v1/projects";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ProjectUseCase projectUseCase;

    // =========================================================================
    // POST /api/v1/projects
    // =========================================================================

    @Nested
    @DisplayName("POST /api/v1/projects")
    class CreateProject {

        @Test
        @DisplayName("should return 201 Created with project response when request is valid")
        void createProject_validRequest_returns201() throws Exception {
            UUID ownerId   = UUID.randomUUID();
            UUID projectId = UUID.randomUUID();
            Instant now    = Instant.now();

            CreateProjectRequest request = new CreateProjectRequest(
                    "My Project", "A great project", ownerId);

            ProjectResponse response = new ProjectResponse(
                    projectId, "My Project", "A great project",
                    ProjectStatus.ACTIVE, ownerId, now, now);

            when(projectUseCase.createProject(any(CreateProjectRequest.class)))
                    .thenReturn(response);

            mockMvc.perform(post(BASE_URL)
                           .contentType(MediaType.APPLICATION_JSON)
                           .content(objectMapper.writeValueAsString(request)))
                   .andExpect(status().isCreated())
                   .andExpect(jsonPath("$.id").value(projectId.toString()))
                   .andExpect(jsonPath("$.name").value("My Project"))
                   .andExpect(jsonPath("$.description").value("A great project"))
                   .andExpect(jsonPath("$.status").value("ACTIVE"))
                   .andExpect(jsonPath("$.ownerId").value(ownerId.toString()));
        }

        @Test
        @DisplayName("should return 400 Bad Request when name is blank")
        void createProject_blankName_returns400() throws Exception {
            CreateProjectRequest request = new CreateProjectRequest(
                    "", "desc", UUID.randomUUID());

            mockMvc.perform(post(BASE_URL)
                           .contentType(MediaType.APPLICATION_JSON)
                           .content(objectMapper.writeValueAsString(request)))
                   .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("should return 400 Bad Request when ownerId is null")
        void createProject_nullOwnerId_returns400() throws Exception {
            CreateProjectRequest request = new CreateProjectRequest(
                    "Valid Name", "desc", null);

            mockMvc.perform(post(BASE_URL)
                           .contentType(MediaType.APPLICATION_JSON)
                           .content(objectMapper.writeValueAsString(request)))
                   .andExpect(status().isBadRequest());
        }
    }

    // =========================================================================
    // GET /api/v1/projects/{id}
    // =========================================================================

    @Nested
    @DisplayName("GET /api/v1/projects/{id}")
    class GetProjectById {

        @Test
        @DisplayName("should return 200 OK with project response when project exists")
        void getProjectById_found_returns200() throws Exception {
            UUID projectId = UUID.randomUUID();
            UUID ownerId   = UUID.randomUUID();
            Instant now    = Instant.now();

            ProjectResponse response = new ProjectResponse(
                    projectId, "My Project", "desc",
                    ProjectStatus.ACTIVE, ownerId, now, now);

            when(projectUseCase.getProjectById(projectId)).thenReturn(response);

            mockMvc.perform(get(BASE_URL + "/{id}", projectId))
                   .andExpect(status().isOk())
                   .andExpect(jsonPath("$.id").value(projectId.toString()))
                   .andExpect(jsonPath("$.name").value("My Project"))
                   .andExpect(jsonPath("$.status").value("ACTIVE"));
        }

        @Test
        @DisplayName("should return 404 Not Found when project does not exist")
        void getProjectById_notFound_returns404() throws Exception {
            UUID projectId = UUID.randomUUID();

            when(projectUseCase.getProjectById(projectId))
                    .thenThrow(new ProjectNotFoundException(projectId));

            mockMvc.perform(get(BASE_URL + "/{id}", projectId))
                   .andExpect(status().isNotFound());
        }
    }

    // =========================================================================
    // GET /api/v1/projects
    // =========================================================================

    @Nested
    @DisplayName("GET /api/v1/projects")
    class ListProjects {

        @Test
        @DisplayName("should return 200 OK with list of projects")
        void listProjects_returns200WithList() throws Exception {
            UUID ownerId = UUID.randomUUID();
            Instant now  = Instant.now();

            List<ProjectResponse> projects = List.of(
                    new ProjectResponse(UUID.randomUUID(), "Project A", "desc A",
                                        ProjectStatus.ACTIVE, ownerId, now, now),
                    new ProjectResponse(UUID.randomUUID(), "Project B", "desc B",
                                        ProjectStatus.ARCHIVED, ownerId, now, now)
            );

            when(projectUseCase.listProjects()).thenReturn(projects);

            mockMvc.perform(get(BASE_URL))
                   .andExpect(status().isOk())
                   .andExpect(jsonPath("$.length()").value(2))
                   .andExpect(jsonPath("$[0].name").value("Project A"))
                   .andExpect(jsonPath("$[1].name").value("Project B"));
        }
    }
}
