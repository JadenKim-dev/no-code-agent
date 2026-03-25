package com.nocodeagent.platform.agent.definition;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AgentDefinitionRepository extends JpaRepository<AgentDefinition, String> {

  List<AgentDefinition> findAllByOrderByUpdatedAtDesc();
}
