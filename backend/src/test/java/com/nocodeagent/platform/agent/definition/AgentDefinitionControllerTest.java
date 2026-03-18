package com.nocodeagent.platform.agent.definition;

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
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest(properties = {
    "spring.ai.openai.api-key=demo-key",
    "spring.datasource.url=jdbc:sqlite::memory:"
})
@AutoConfigureMockMvc
class AgentDefinitionControllerTest {

    @Autowired
    MockMvc mockMvc;

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
