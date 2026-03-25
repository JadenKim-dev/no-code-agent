package com.nocodeagent.platform.agent.definition;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(properties = {
    "spring.ai.openai.api-key=demo-key",
    "spring.datasource.url=jdbc:sqlite::memory:"
})
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class AgentDefinitionControllerTest {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    ObjectMapper objectMapper;

    private static final String VALID_AGENT_JSON = """
        {
          "name": "Planner",
          "description": "test",
          "type": "custom",
          "goal": "help users",
          "systemPrompt": "be helpful",
          "enabledTools": ["currentTime"],
          "defaultInput": "what time is it?"
        }
        """;

    @Test
    void createsAgentAndReturns201WithBody() throws Exception {
        mockMvc.perform(post("/api/agents")
                .contentType(MediaType.APPLICATION_JSON)
                .content(VALID_AGENT_JSON))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.name").value("Planner"))
            .andExpect(jsonPath("$.id").isNotEmpty())
            .andExpect(jsonPath("$.enabledTools[0]").value("currentTime"));
    }

    @Test
    void listAgents_returnsCreatedAgents() throws Exception {
        mockMvc.perform(post("/api/agents")
                .contentType(MediaType.APPLICATION_JSON)
                .content(VALID_AGENT_JSON))
            .andExpect(status().isCreated());

        mockMvc.perform(get("/api/agents"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(1)));
    }

    @Test
    void getAgentById_returnsAgent() throws Exception {
        MvcResult createResult = mockMvc.perform(post("/api/agents")
                .contentType(MediaType.APPLICATION_JSON)
                .content(VALID_AGENT_JSON))
            .andExpect(status().isCreated())
            .andReturn();

        String id = objectMapper.readTree(createResult.getResponse().getContentAsString()).get("id").asText();
        assertThat(id).isNotBlank();

        mockMvc.perform(get("/api/agents/{id}", id))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(id))
            .andExpect(jsonPath("$.name").value("Planner"));
    }

    @Test
    void getAgentById_returnsNotFoundForUnknownId() throws Exception {
        mockMvc.perform(get("/api/agents/unknown-id"))
            .andExpect(status().isNotFound());
    }

    @Test
    void updateAgent_returnsUpdatedAgent() throws Exception {
        MvcResult createResult = mockMvc.perform(post("/api/agents")
                .contentType(MediaType.APPLICATION_JSON)
                .content(VALID_AGENT_JSON))
            .andExpect(status().isCreated())
            .andReturn();

        String id = objectMapper.readTree(createResult.getResponse().getContentAsString()).get("id").asText();

        mockMvc.perform(put("/api/agents/{id}", id)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "name": "Updated Planner",
                      "description": "",
                      "type": "custom",
                      "goal": "help teams",
                      "systemPrompt": "be very helpful",
                      "enabledTools": ["currentTime", "listSchedules"],
                      "defaultInput": ""
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("Updated Planner"))
            .andExpect(jsonPath("$.goal").value("help teams"));
    }

    @Test
    void createAgent_returnsBadRequestWhenNameIsBlank() throws Exception {
        mockMvc.perform(post("/api/agents")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "name": "",
                      "description": "test",
                      "type": "custom",
                      "goal": "help users",
                      "systemPrompt": "be helpful",
                      "enabledTools": ["currentTime"],
                      "defaultInput": ""
                    }
                    """))
            .andExpect(status().isBadRequest());
    }

    @Test
    void createAgent_returnsBadRequestWhenNoToolsProvided() throws Exception {
        mockMvc.perform(post("/api/agents")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "name": "Planner",
                      "description": "test",
                      "type": "custom",
                      "goal": "help users",
                      "systemPrompt": "be helpful",
                      "enabledTools": [],
                      "defaultInput": ""
                    }
                    """))
            .andExpect(status().isBadRequest());
    }
}
