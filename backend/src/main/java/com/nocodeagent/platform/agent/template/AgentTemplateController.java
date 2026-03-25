package com.nocodeagent.platform.agent.template;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/templates")
@RequiredArgsConstructor
public class AgentTemplateController {

  private final AgentTemplateProvider provider;

  @GetMapping
  public List<AgentTemplate> list() {
    return provider.listTemplates();
  }
}
