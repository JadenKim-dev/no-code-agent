package com.nocodeagent.platform.agent.execution;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nocodeagent.platform.agent.definition.AgentDefinition;
import com.nocodeagent.platform.stream.ExecutionEvent;
import com.nocodeagent.platform.tool.ToolRegistry;
import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.ai.tool.ToolCallback;

@ExtendWith(MockitoExtension.class)
class FallbackAgentRunnerTest {

    @Mock
    ToolRegistry toolRegistry;

    FallbackAgentRunner runner;

    AgentDefinition definition;

    @BeforeEach
    void setUp() {
        runner = new FallbackAgentRunner(toolRegistry, new ObjectMapper());
        definition = new AgentDefinition(
            "id-1", "Planner", "", "custom", "help users", "be helpful",
            List.of("currentTime", "listSchedules"), "", Instant.now(), Instant.now()
        );
    }

    @Test
    void run_alwaysEndsWithCompletedEvent() {
        List<ExecutionEvent> events = runner.run(definition, "hello").collectList().block();

        assertThat(events).isNotNull();
        assertThat(events).last().extracting(ExecutionEvent::type).isEqualTo("completed");
    }

    @Test
    void run_withTimeKeyword_includesTimeResultInOutput() {
        ToolCallback mockCallback = mockToolCallback("2026-03-18T10:00:00");
        when(toolRegistry.get(eq("currentTime"), any())).thenReturn(mockCallback);

        List<ExecutionEvent> events = runner.run(definition, "what time is it?").collectList().block();

        assertThat(events).isNotNull();
        boolean hasTimeContent = events.stream()
            .filter(e -> "message-token".equals(e.type()))
            .anyMatch(e -> e.content().contains("2026-03-18T10:00:00"));
        assertThat(hasTimeContent).isTrue();
    }

    @Test
    void run_withScheduleKeyword_includesScheduleResultInOutput() {
        ToolCallback mockCallback = mockToolCallback("No schedules found.");
        when(toolRegistry.get(eq("listSchedules"), any())).thenReturn(mockCallback);

        List<ExecutionEvent> events = runner.run(definition, "show my schedule").collectList().block();

        assertThat(events).isNotNull();
        boolean hasScheduleContent = events.stream()
            .filter(e -> "message-token".equals(e.type()))
            .anyMatch(e -> e.content().contains("No schedules found"));
        assertThat(hasScheduleContent).isTrue();
    }

    @Test
    void run_withNoMatchingKeyword_returnsHelpMessageInstead() {
        List<ExecutionEvent> events = runner.run(definition, "something unrelated").collectList().block();

        assertThat(events).isNotNull();
        boolean hasToolCallStart = events.stream().anyMatch(e -> "tool-call-start".equals(e.type()));
        assertThat(hasToolCallStart).isFalse();

        boolean hasHelpMessage = events.stream()
            .filter(e -> "message-token".equals(e.type()))
            .anyMatch(e -> e.content().contains("No deterministic"));
        assertThat(hasHelpMessage).isTrue();
    }

    private ToolCallback mockToolCallback(String result) {
        ToolCallback callback = org.mockito.Mockito.mock(ToolCallback.class);
        when(callback.call(any())).thenReturn(result);
        return callback;
    }
}
