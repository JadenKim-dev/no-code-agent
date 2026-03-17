package com.nocodeagent.platform.agent;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class SchedulerTemplateProviderTest {

    private final AgentTemplateProvider provider = new AgentTemplateProvider();

    @Test
    void returnsSchedulerTemplateWithExpectedTools() {
        AgentTemplate template = provider.listTemplates().get(0);

        assertThat(template.enabledTools()).containsExactlyInAnyOrder(
            "currentTime", "createSchedule", "createReminder", "listSchedules"
        );
    }
}
