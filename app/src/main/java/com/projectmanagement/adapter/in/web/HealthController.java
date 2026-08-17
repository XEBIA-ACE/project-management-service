package com.projectmanagement.adapter.in.web;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Simple liveness / readiness probe endpoint.
 *
 * <p>Returns a static {@code {"status":"UP"}} payload so that load-balancers and
 * container orchestrators can verify the service is running. For richer health
 * information, the Spring Boot Actuator endpoint at {@code /actuator/health} is
 * also available.</p>
 */
@RestController
@RequestMapping("/health")
public class HealthController {

    /**
     * Returns a 200 OK response with a static health payload.
     *
     * @return {@code {"status":"UP"}}
     */
    @GetMapping
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP"));
    }
}
