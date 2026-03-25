package com.nocodeagent.platform.agent.execution;

import com.nocodeagent.platform.agent.definition.AgentDefinition;
import com.nocodeagent.platform.stream.ExecutionEvent;
import com.nocodeagent.platform.tool.ToolRegistry;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.tool.ToolCallback;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;

@Component
@RequiredArgsConstructor
public class SpringAiAgentRunner implements AgentRunner {

  private final ChatClient.Builder chatClientBuilder;
  private final ToolRegistry toolRegistry;

  @Override
  public Flux<ExecutionEvent> run(AgentDefinition definition, String input) {
    return Flux.create(
        sink -> {
          List<ToolCallback> callbacks =
              toolRegistry.resolve(definition.getEnabledTools(), sink::next);
          chatClientBuilder
              .build()
              .prompt()
              .system(definition.getSystemPrompt())
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
