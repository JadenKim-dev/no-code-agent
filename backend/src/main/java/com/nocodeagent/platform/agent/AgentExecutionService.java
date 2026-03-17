package com.nocodeagent.platform.agent;

import com.nocodeagent.platform.stream.ExecutionEvent;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

@Service
public class AgentExecutionService {

    private final AgentDefinitionService agentDefinitionService;
    private final SpringAiAgentRunner springAiAgentRunner;
    private final FallbackAgentRunner fallbackAgentRunner;
    private final boolean demoMode;

    public AgentExecutionService(
        AgentDefinitionService agentDefinitionService,
        SpringAiAgentRunner springAiAgentRunner,
        FallbackAgentRunner fallbackAgentRunner,
        @Value("${spring.ai.openai.api-key:demo-key}") String apiKey
    ) {
        this.agentDefinitionService = agentDefinitionService;
        this.springAiAgentRunner = springAiAgentRunner;
        this.fallbackAgentRunner = fallbackAgentRunner;
        this.demoMode = "demo-key".equals(apiKey);
    }

    public Flux<ExecutionEvent> run(String agentId, String input) {
        AgentDefinition definition = agentDefinitionService.get(agentId);
        AgentRunner runner = demoMode ? fallbackAgentRunner : springAiAgentRunner;
        return runner.run(definition, input);
    }
}
