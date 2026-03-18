package com.nocodeagent.platform.agent;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.List;

@Entity
@Table(name = "agent_definition")
public class AgentDefinition {

    @Id
    private String id;
    private String name;
    private String description;
    private String type;
    private String goal;
    @Column(columnDefinition = "TEXT")
    private String systemPrompt;
    @Convert(converter = StringListConverter.class)
    private List<String> enabledTools;
    private String defaultInput;
    private Instant createdAt;
    private Instant updatedAt;

    protected AgentDefinition() {}

    public AgentDefinition(String id, String name, String description, String type, String goal,
                           String systemPrompt, List<String> enabledTools, String defaultInput,
                           Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.type = type;
        this.goal = goal;
        this.systemPrompt = systemPrompt;
        this.enabledTools = enabledTools;
        this.defaultInput = defaultInput;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public String id() { return id; }
    public String name() { return name; }
    public String description() { return description; }
    public String type() { return type; }
    public String goal() { return goal; }
    public String systemPrompt() { return systemPrompt; }
    public List<String> enabledTools() { return enabledTools; }
    public String defaultInput() { return defaultInput; }
    public Instant createdAt() { return createdAt; }
    public Instant updatedAt() { return updatedAt; }
}
