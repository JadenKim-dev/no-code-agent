package com.nocodeagent.platform.tool;

import com.nocodeagent.platform.stream.ExecutionEvent;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.function.Consumer;
import java.util.stream.Collectors;
import org.springframework.ai.support.ToolCallbacks;
import org.springframework.ai.tool.ToolCallback;
import org.springframework.stereotype.Component;

@Component
public class ToolRegistry {

    private final Map<String, ToolCallback> callbacks;

    public ToolRegistry(DateTimeTools dateTimeTools, ScheduleTools scheduleTools) {
        this.callbacks = Arrays.stream(ToolCallbacks.from(dateTimeTools, scheduleTools))
            .collect(Collectors.toMap(callback -> callback.getToolDefinition().name(), callback -> callback));
    }

    public List<String> supportedToolNames() {
        return callbacks.keySet().stream().sorted().toList();
    }

    public List<ToolCallback> resolve(List<String> names, Consumer<ExecutionEvent> eventConsumer) {
        return names.stream()
            .distinct()
            .map(name -> callbacks.get(name))
            .filter(callback -> callback != null)
            .map(callback -> (ToolCallback) new ObservedToolCallback(callback, eventConsumer))
            .toList();
    }

    public ToolCallback get(String name, Consumer<ExecutionEvent> eventConsumer) {
        ToolCallback callback = callbacks.get(name);
        return callback == null ? null : new ObservedToolCallback(callback, eventConsumer);
    }
}
