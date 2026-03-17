package com.nocodeagent.platform.agent;

import com.nocodeagent.platform.stream.ExecutionEvent;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

@Service
public class AgentExecutionService {

    private final AgentDefinitionService agentDefinitionService;
    private final SpringAiAgentRunner springAiAgentRunner;
    private final FallbackAgentRunner fallbackAgentRunner;

    public AgentExecutionService(
        AgentDefinitionService agentDefinitionService,
        ObjectProvider<SpringAiAgentRunner> springAiAgentRunner,
        FallbackAgentRunner fallbackAgentRunner
    ) {
        this.agentDefinitionService = agentDefinitionService;
        this.springAiAgentRunner = springAiAgentRunner.getIfAvailable();
        this.fallbackAgentRunner = fallbackAgentRunner;
    }

    public Flux<ExecutionEvent> run(String agentId, String input) {
        AgentDefinition definition = agentDefinitionService.get(agentId);
        Flux<ExecutionEvent> springAiResult = springAiAgentRunner == null ? Flux.empty() : springAiAgentRunner.run(definition, input);
        return springAiResult.switchIfEmpty(fallbackAgentRunner.run(definition, input));
    }
}
