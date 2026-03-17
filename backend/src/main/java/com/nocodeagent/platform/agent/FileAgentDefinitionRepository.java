package com.nocodeagent.platform.agent;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nocodeagent.platform.config.AppProperties;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;
import org.springframework.stereotype.Repository;

@Repository
public class FileAgentDefinitionRepository implements AgentDefinitionRepository {

    private final ObjectMapper objectMapper;
    private final Path agentsDir;

    public FileAgentDefinitionRepository(ObjectMapper objectMapper, AppProperties properties) {
        this.objectMapper = objectMapper;
        this.agentsDir = properties.getStorage().getAgentsDir();
    }

    @Override
    public AgentDefinition save(AgentDefinition definition) {
        try {
            Files.createDirectories(agentsDir);
            Path target = targetPath(definition.id());
            Path temp = Files.createTempFile(agentsDir, definition.id(), ".tmp");
            objectMapper.writeValue(temp.toFile(), definition);
            Files.move(temp, target, StandardCopyOption.REPLACE_EXISTING, StandardCopyOption.ATOMIC_MOVE);
            return definition;
        }
        catch (IOException exception) {
            throw new UncheckedIOException("Failed to save agent definition", exception);
        }
    }

    @Override
    public Optional<AgentDefinition> findById(String id) {
        Path path = targetPath(id);
        if (!Files.exists(path)) {
            return Optional.empty();
        }
        try {
            return Optional.of(objectMapper.readValue(path.toFile(), AgentDefinition.class));
        }
        catch (IOException exception) {
            return Optional.empty();
        }
    }

    @Override
    public List<AgentDefinition> findAll() {
        if (!Files.exists(agentsDir)) {
            return List.of();
        }
        try (Stream<Path> stream = Files.list(agentsDir)) {
            return stream
                .filter(path -> path.getFileName().toString().endsWith(".json"))
                .map(this::readQuietly)
                .flatMap(Optional::stream)
                .sorted(Comparator.comparing(AgentDefinition::updatedAt).reversed())
                .toList();
        }
        catch (IOException exception) {
            throw new UncheckedIOException("Failed to list agent definitions", exception);
        }
    }

    private Optional<AgentDefinition> readQuietly(Path path) {
        try {
            return Optional.of(objectMapper.readValue(path.toFile(), AgentDefinition.class));
        }
        catch (IOException exception) {
            return Optional.empty();
        }
    }

    private Path targetPath(String id) {
        return agentsDir.resolve(id + ".json");
    }
}
