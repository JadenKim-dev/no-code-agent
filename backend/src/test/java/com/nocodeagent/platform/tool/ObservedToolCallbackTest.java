package com.nocodeagent.platform.tool;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import com.nocodeagent.platform.stream.ExecutionEvent;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.ai.tool.ToolCallback;
import org.springframework.ai.tool.definition.ToolDefinition;

@ExtendWith(MockitoExtension.class)
class ObservedToolCallbackTest {

    @Mock
    ToolCallback delegate;

    @Mock
    ToolDefinition toolDefinition;

    List<ExecutionEvent> emittedEvents;
    ObservedToolCallback callback;

    @BeforeEach
    void setUp() {
        emittedEvents = new ArrayList<>();
        when(delegate.getToolDefinition()).thenReturn(toolDefinition);
        when(toolDefinition.name()).thenReturn("currentTime");
        callback = new ObservedToolCallback(delegate, emittedEvents::add);
    }

    @Test
    void call_emitsToolCallStartEvent() {
        when(delegate.call("{}")).thenReturn("2026-03-18T10:00:00");

        callback.call("{}");

        assertThat(emittedEvents).anyMatch(event -> "tool-call-start".equals(event.type()));
    }

    @Test
    void call_emitsToolCallResultEvent() {
        when(delegate.call("{}")).thenReturn("2026-03-18T10:00:00");

        callback.call("{}");

        assertThat(emittedEvents).anyMatch(event -> "tool-call-result".equals(event.type()));
    }

    @Test
    void call_onFailure_emitsErrorEvent() {
        when(delegate.call("{}")).thenThrow(new RuntimeException("tool error"));

        assertThatThrownBy(() -> callback.call("{}"))
            .isInstanceOf(RuntimeException.class);

        assertThat(emittedEvents).anyMatch(event -> "error".equals(event.type()));
    }

    @Test
    void call_returnsDelegate結果() {
        when(delegate.call("{}")).thenReturn("2026-03-18T10:00:00");

        String result = callback.call("{}");

        assertThat(result).isEqualTo("2026-03-18T10:00:00");
    }
}
