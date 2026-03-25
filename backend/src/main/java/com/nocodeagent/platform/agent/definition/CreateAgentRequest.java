package com.nocodeagent.platform.agent.definition;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public record CreateAgentRequest(
    @NotBlank String name,
    String description,
    @NotBlank String type,
    @NotBlank String goal,
    @NotBlank String systemPrompt,
    List<String> enabledTools,
    String defaultInput) {}
