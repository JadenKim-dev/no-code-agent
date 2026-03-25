package com.nocodeagent.platform.agent.execution;

import com.nocodeagent.platform.agent.definition.AgentDefinition;
import com.nocodeagent.platform.stream.ExecutionEvent;
import reactor.core.publisher.Flux;

public interface AgentRunner {

  Flux<ExecutionEvent> run(AgentDefinition definition, String input);
}
