package com.nocodeagent.platform.agent.execution;

import jakarta.validation.constraints.NotBlank;

public record AgentRunRequest(@NotBlank String input) {}
