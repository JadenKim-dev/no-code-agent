package com.nocodeagent.platform.agent.template;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class AgentTemplateProviderTest {

    private final AgentTemplateProvider provider = new AgentTemplateProvider();

    @Test
    void listTemplates_returnsExactlyOneTemplate() {
        assertThat(provider.listTemplates()).hasSize(1);
    }

    @Test
    void schedulerTemplate_hasExpectedEnabledTools() {
        AgentTemplate template = provider.listTemplates().stream()
            .filter(t -> "scheduler-template".equals(t.key()))
            .findFirst()
            .orElseThrow(() -> new AssertionError("scheduler-template not found"));

        assertThat(template.enabledTools()).containsExactlyInAnyOrder(
            "currentTime", "createSchedule", "createReminder", "listSchedules"
        );
    }
}
