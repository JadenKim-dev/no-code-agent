package com.nocodeagent.platform.agent;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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
class AgentDefinitionControllerTest {

    @Autowired
    MockMvc mockMvc;

    @DynamicPropertySource
    static void storageProperties(DynamicPropertyRegistry registry) {
        String runId = java.util.UUID.randomUUID().toString();
        registry.add("app.storage.agents-dir", () -> java.nio.file.Path.of("target/test-agents-" + runId).toAbsolutePath().toString());
        registry.add("app.storage.schedules-file", () -> java.nio.file.Path.of("target/test-schedules-" + runId, "schedules.json").toAbsolutePath().toString());
    }

    @Test
    void createsAndListsAgentDefinitions() throws Exception {
        mockMvc.perform(post("/api/agents")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "name": "Planner",
                      "description": "test",
                      "type": "custom",
                      "goal": "help users",
                      "systemPrompt": "be helpful",
                      "enabledTools": ["currentTime"],
                      "defaultInput": "what time is it?"
                    }
                    """))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.name").value("Planner"));

        mockMvc.perform(get("/api/agents"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(1)));
    }
}
