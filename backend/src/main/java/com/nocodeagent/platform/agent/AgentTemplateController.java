package com.nocodeagent.platform.agent;

import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/templates")
public class AgentTemplateController {

    private final AgentTemplateProvider provider;

    public AgentTemplateController(AgentTemplateProvider provider) {
        this.provider = provider;
    }

    @GetMapping
    public List<AgentTemplate> list() {
        return provider.listTemplates();
    }
}
