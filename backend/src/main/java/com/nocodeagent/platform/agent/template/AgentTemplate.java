package com.nocodeagent.platform.agent.template;

import java.util.List;

public record AgentTemplate(
    String key,
    String name,
    String description,
    String type,
    String goal,
    String systemPrompt,
    List<String> enabledTools,
    String defaultInput) {}
