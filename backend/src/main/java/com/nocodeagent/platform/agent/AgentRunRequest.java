package com.nocodeagent.platform.agent;

import jakarta.validation.constraints.NotBlank;

public record AgentRunRequest(@NotBlank String input) {
}
