package com.nocodeagent.platform.agent;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nocodeagent.platform.config.AppProperties;
import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

class FileAgentDefinitionRepositoryTest {

    @TempDir
    java.nio.file.Path tempDir;

    @Test
    void savesAndLoadsAgentDefinition() {
        AppProperties properties = new AppProperties();
        properties.getStorage().setAgentsDir(tempDir.resolve("agents"));
        FileAgentDefinitionRepository repository = new FileAgentDefinitionRepository(new ObjectMapper().findAndRegisterModules(), properties);

        AgentDefinition definition = new AgentDefinition(
            "agent-1",
            "Planner",
            "desc",
            "custom",
            "help users",
            "You are helpful",
            List.of("currentTime"),
            "default input",
            Instant.now(),
            Instant.now()
        );

        repository.save(definition);

        assertThat(repository.findById("agent-1")).contains(definition);
        assertThat(repository.findAll()).contains(definition);
    }
}
