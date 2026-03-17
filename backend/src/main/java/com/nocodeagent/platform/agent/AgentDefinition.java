package com.nocodeagent.platform.agent;

import java.time.Instant;
import java.util.List;

public record AgentDefinition(
    String id,
    String name,
    String description,
    String type,
    String goal,
    String systemPrompt,
    List<String> enabledTools,
    String defaultInput,
    Instant createdAt,
    Instant updatedAt
) {
}
