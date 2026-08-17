package com.projectmanagement.adapter.in.web;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Unit-level slice test for {@link HealthController}.
 *
 * <p>Uses {@code @WebMvcTest} to load only the web layer — no Spring Data, no database.</p>
 */
@WebMvcTest(HealthController.class)
@DisplayName("HealthController — GET /health")
class HealthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("should return HTTP 200 with status UP")
    void health_returnsOkWithStatusUp() throws Exception {
        mockMvc.perform(get("/health"))
               .andExpect(status().isOk())
               .andExpect(content().contentType("application/json"))
               .andExpect(jsonPath("$.status").value("UP"));
    }
}
