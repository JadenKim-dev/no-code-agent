package com.nocodeagent.platform.agent.definition;

import com.nocodeagent.platform.agent.common.StringListConverter;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "agent_definition")
@Getter
@NoArgsConstructor(access = lombok.AccessLevel.PROTECTED)
@AllArgsConstructor
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
}
