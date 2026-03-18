package com.nocodeagent.platform.agent;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/agents")
public class AgentDefinitionController {

    private final AgentDefinitionService service;

    public AgentDefinitionController(AgentDefinitionService service) {
        this.service = service;
    }

    @GetMapping
    public List<AgentDefinition> list() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public AgentDefinition get(@PathVariable String id) {
        return service.getById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AgentDefinition create(@Valid @RequestBody CreateAgentRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    public AgentDefinition update(@PathVariable String id, @Valid @RequestBody UpdateAgentRequest request) {
        return service.update(id, request);
    }
}
