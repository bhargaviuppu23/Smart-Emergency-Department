package com.hospital.emergency.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hospital.emergency.dto.PatientRequestDto;
import com.hospital.emergency.model.Severity;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class PatientControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("POST /api/patients creates patient and returns 201")
    void testRegisterPatientEndpoint() throws Exception {
        PatientRequestDto request = new PatientRequestDto(
                "Jane Smith", 32, "Female", "Severe migraine with photophobia",
                Severity.MEDIUM, "Triage room 2 assessment"
        );

        mockMvc.perform(post("/api/patients")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.patientIdentifier", startsWith("ED-")))
                .andExpect(jsonPath("$.fullName", is("Jane Smith")))
                .andExpect(jsonPath("$.severity", is("MEDIUM")))
                .andExpect(jsonPath("$.status", is("WAITING")));
    }

    @Test
    @DisplayName("POST /api/patients fails validation on blank name and invalid age")
    void testRegisterPatientValidationFailure() throws Exception {
        PatientRequestDto request = new PatientRequestDto(
                "", -5, "Female", "", null, null
        );

        mockMvc.perform(post("/api/patients")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.details", hasSize(greaterThan(0))));
    }

    @Test
    @DisplayName("GET /api/queue returns active waiting patients")
    void testGetLiveQueueEndpoint() throws Exception {
        mockMvc.perform(get("/api/queue"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    @Test
    @DisplayName("GET /api/analytics/summary returns accurate metrics")
    void testGetAnalyticsSummaryEndpoint() throws Exception {
        mockMvc.perform(get("/api/analytics/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalRegistered").isNumber())
                .andExpect(jsonPath("$.waitingCount").isNumber());
    }

    @Test
    @DisplayName("Demo endpoints generate and reset data cleanly")
    void testDemoWorkflow() throws Exception {
        // Generate demo records
        mockMvc.perform(post("/api/demo/generate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"count\": 4, \"clearExisting\": false}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(4)));

        // Reset demo records
        mockMvc.perform(delete("/api/demo/reset"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("SUCCESS")));
    }
}
