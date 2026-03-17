package com.nocodeagent.platform.agent;

import com.nocodeagent.platform.stream.ExecutionEvent;
import com.nocodeagent.platform.tool.ToolRegistry;
import java.util.List;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.tool.ToolCallback;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;

@Component
public class SpringAiAgentRunner implements AgentRunner {

    private final ChatClient.Builder chatClientBuilder;
    private final ToolRegistry toolRegistry;
    private final String apiKey;

    public SpringAiAgentRunner(
        ChatClient.Builder chatClientBuilder,
        ToolRegistry toolRegistry,
        @Value("${spring.ai.openai.api-key:demo-key}") String apiKey
    ) {
        this.chatClientBuilder = chatClientBuilder;
        this.toolRegistry = toolRegistry;
        this.apiKey = apiKey;
    }

    @Override
    public Flux<ExecutionEvent> run(AgentDefinition definition, String input) {
        if ("demo-key".equals(apiKey)) {
            return Flux.empty();
        }

        return Flux.create(sink -> {
            List<ToolCallback> callbacks = toolRegistry.resolve(definition.enabledTools(), sink::next);
            chatClientBuilder.build()
                .prompt()
                .system(definition.systemPrompt())
                .user(input)
                .toolCallbacks(callbacks)
                .stream()
                .content()
                .map(ExecutionEvent::messageToken)
                .doOnComplete(() -> sink.next(ExecutionEvent.completed("Run completed")))
                .doOnError(error -> sink.next(ExecutionEvent.error(error.getMessage())))
                .subscribe(sink::next, sink::error, sink::complete);
        });
    }
}
