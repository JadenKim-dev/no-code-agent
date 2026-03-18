package com.nocodeagent.platform.tool;

import com.nocodeagent.platform.stream.ExecutionEvent;
import java.util.function.Consumer;
import org.springframework.ai.chat.model.ToolContext;
import org.springframework.ai.tool.ToolCallback;
import org.springframework.ai.tool.definition.ToolDefinition;
import org.springframework.ai.tool.metadata.ToolMetadata;

/**
 * A decorator that wraps a {@link ToolCallback} to observe tool execution.
 * <p>
 * Publishes {@link ExecutionEvent}s at each stage of tool execution — start, result, and error —
 * enabling real-time streaming of execution state to clients via SSE or similar mechanisms.
 * </p>
 */
public class ObservedToolCallback implements ToolCallback {

    private final ToolCallback delegate;
    private final Consumer<ExecutionEvent> eventConsumer;

    public ObservedToolCallback(ToolCallback delegate, Consumer<ExecutionEvent> eventConsumer) {
        this.delegate = delegate;
        this.eventConsumer = eventConsumer;
    }

    @Override
    public ToolDefinition getToolDefinition() {
        return delegate.getToolDefinition();
    }

    @Override
    public ToolMetadata getToolMetadata() {
        return delegate.getToolMetadata();
    }

    @Override
    public String call(String toolInput) {
        eventConsumer.accept(ExecutionEvent.toolCallStart(getToolDefinition().name(), toolInput));
        try {
            String result = delegate.call(toolInput);
            eventConsumer.accept(ExecutionEvent.toolCallResult(getToolDefinition().name(), result));
            return result;
        }
        catch (RuntimeException exception) {
            eventConsumer.accept(ExecutionEvent.error(exception.getMessage()));
            throw exception;
        }
    }

    @Override
    public String call(String toolInput, ToolContext toolContext) {
        eventConsumer.accept(ExecutionEvent.toolCallStart(getToolDefinition().name(), toolInput));
        try {
            String result = delegate.call(toolInput, toolContext);
            eventConsumer.accept(ExecutionEvent.toolCallResult(getToolDefinition().name(), result));
            return result;
        }
        catch (RuntimeException exception) {
            eventConsumer.accept(ExecutionEvent.error(exception.getMessage()));
            throw exception;
        }
    }
}
