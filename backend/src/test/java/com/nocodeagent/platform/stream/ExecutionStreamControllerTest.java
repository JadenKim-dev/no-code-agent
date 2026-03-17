package com.nocodeagent.platform.stream;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.nocodeagent.platform.agent.AgentDefinitionService;
import com.nocodeagent.platform.agent.CreateAgentRequest;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest(properties = "spring.ai.openai.api-key=demo-key")
@AutoConfigureMockMvc
class ExecutionStreamControllerTest {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    AgentDefinitionService agentDefinitionService;

    private String agentId;

    @DynamicPropertySource
    static void storageProperties(DynamicPropertyRegistry registry) {
        String runId = java.util.UUID.randomUUID().toString();
        registry.add("app.storage.agents-dir", () -> java.nio.file.Path.of("target/test-stream-agents-" + runId).toAbsolutePath().toString());
        registry.add("app.storage.schedules-file", () -> java.nio.file.Path.of("target/test-stream-schedules-" + runId, "schedules.json").toAbsolutePath().toString());
    }

    @BeforeEach
    void setUp() {
        agentId = agentDefinitionService.create(new CreateAgentRequest(
            "Planner",
            "",
            "custom",
            "help users",
            "be helpful",
            List.of("currentTime", "listSchedules"),
            "what time is it?"
        )).id();
    }

    @Test
    void streamsExecutionEvents() throws Exception {
        mockMvc.perform(post("/api/agents/%s/runs/stream".formatted(agentId))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"input\":\"What is on my schedule today?\"}"))
            .andExpect(status().isOk())
            .andExpect(header().string("Content-Type", containsString("text/event-stream")));
    }
}
