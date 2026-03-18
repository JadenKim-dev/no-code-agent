package com.nocodeagent.platform.agent;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "agent_definition")
@Getter
@NoArgsConstructor(access = lombok.AccessLevel.PROTECTED)
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
}
