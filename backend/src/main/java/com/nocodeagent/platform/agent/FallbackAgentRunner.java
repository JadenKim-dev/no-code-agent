package com.nocodeagent.platform.agent;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nocodeagent.platform.stream.ExecutionEvent;
import com.nocodeagent.platform.tool.ToolRegistry;
import java.util.ArrayList;
import java.util.List;
import org.springframework.ai.tool.ToolCallback;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;

@Component
public class FallbackAgentRunner implements AgentRunner {

    private final ToolRegistry toolRegistry;
    private final ObjectMapper objectMapper;
    private final String apiKey;

    public FallbackAgentRunner(
        ToolRegistry toolRegistry,
        ObjectMapper objectMapper,
        @Value("${spring.ai.openai.api-key:demo-key}") String apiKey
    ) {
        this.toolRegistry = toolRegistry;
        this.objectMapper = objectMapper;
        this.apiKey = apiKey;
    }

    @Override
    public Flux<ExecutionEvent> run(AgentDefinition definition, String input) {
        if (!"demo-key".equals(apiKey)) {
            return Flux.empty();
        }

        List<ExecutionEvent> events = new ArrayList<>();
        events.add(ExecutionEvent.messageToken("Running fallback agent for "));
        events.add(ExecutionEvent.messageToken(definition.name() + ". "));
        String lowerInput = input.toLowerCase();

        if (containsAny(lowerInput, "schedule", "일정")) {
            ToolCallback callback = toolRegistry.get("listSchedules", events::add);
            if (callback != null) {
                String result = callback.call("{}");
                events.add(ExecutionEvent.messageToken("Current schedules:\n" + result + "\n"));
            }
        }

        if (containsAny(lowerInput, "time", "시간", "today", "지금")) {
            ToolCallback callback = toolRegistry.get("currentTime", events::add);
            if (callback != null) {
                String result = callback.call("{}");
                events.add(ExecutionEvent.messageToken("Current time is " + result + ". "));
            }
        }

        if (containsAny(lowerInput, "reminder", "리마인더")) {
            ToolCallback callback = toolRegistry.get("createReminder", events::add);
            if (callback != null) {
                String result = callback.call(json("title", "Follow up", "remindAt", "2026-03-18T09:00:00"));
                events.add(ExecutionEvent.messageToken(result + ". "));
            }
        }

        if (containsAny(lowerInput, "create schedule", "add meeting", "등록")) {
            ToolCallback callback = toolRegistry.get("createSchedule", events::add);
            if (callback != null) {
                String result = callback.call(json("title", "Team sync", "scheduledFor", "2026-03-18T10:00:00"));
                events.add(ExecutionEvent.messageToken(result + ". "));
            }
        }

        if (events.stream().noneMatch(event -> "tool-call-start".equals(event.type()))) {
            events.add(ExecutionEvent.messageToken("""
                No deterministic tool path matched the request.
                Add OPENAI_API_KEY to use Spring AI model execution, or ask about current time / schedules / reminders.
                """.strip()));
        }

        events.add(ExecutionEvent.completed("Run completed"));
        return Flux.fromIterable(events);
    }

    private boolean containsAny(String value, String... candidates) {
        for (String candidate : candidates) {
            if (value.contains(candidate)) {
                return true;
            }
        }
        return false;
    }

    private String json(String key1, String value1, String key2, String value2) {
        try {
            return objectMapper.writeValueAsString(java.util.Map.of(key1, value1, key2, value2));
        }
        catch (JsonProcessingException exception) {
            throw new IllegalStateException(exception);
        }
    }
}
