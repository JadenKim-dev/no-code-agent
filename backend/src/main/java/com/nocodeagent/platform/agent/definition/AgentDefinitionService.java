package com.nocodeagent.platform.agent.definition;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AgentDefinitionService {

  private final AgentDefinitionRepository repository;

  public AgentDefinition create(CreateAgentRequest request) {
    validateTools(request.enabledTools());
    Instant now = Instant.now();
    AgentDefinition definition =
        new AgentDefinition(
            UUID.randomUUID().toString(),
            request.name().trim(),
            normalize(request.description()),
            request.type().trim(),
            request.goal().trim(),
            request.systemPrompt().trim(),
            normalizeTools(request.enabledTools()),
            normalize(request.defaultInput()),
            now,
            now);
    return repository.save(definition);
  }

  public AgentDefinition update(String id, UpdateAgentRequest request) {
    AgentDefinition existing = getById(id);
    validateTools(request.enabledTools());
    AgentDefinition updated =
        new AgentDefinition(
            existing.getId(),
            request.name().trim(),
            normalize(request.description()),
            request.type() != null ? request.type().trim() : existing.getType(),
            request.goal().trim(),
            request.systemPrompt().trim(),
            normalizeTools(request.enabledTools()),
            normalize(request.defaultInput()),
            existing.getCreatedAt(),
            Instant.now());
    return repository.save(updated);
  }

  public List<AgentDefinition> findAll() {
    return repository.findAllByOrderByUpdatedAtDesc();
  }

  public AgentDefinition getById(String id) {
    return repository
        .findById(id)
        .orElseThrow(
            () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Agent not found: " + id));
  }

  private void validateTools(List<String> enabledTools) {
    if (enabledTools == null || enabledTools.isEmpty()) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST, "At least one tool must be enabled");
    }
  }

  private List<String> normalizeTools(List<String> enabledTools) {
    return enabledTools == null ? List.of() : enabledTools.stream().distinct().toList();
  }

  private String normalize(String value) {
    return value == null ? "" : value.trim();
  }
}
