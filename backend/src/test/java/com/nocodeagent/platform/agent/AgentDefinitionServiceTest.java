package com.nocodeagent.platform.agent;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class AgentDefinitionServiceTest {

    @Mock
    AgentDefinitionRepository repository;

    AgentDefinitionService service;

    @BeforeEach
    void setUp() {
        service = new AgentDefinitionService(repository);
    }

    @Test
    void create_savesAgentAndReturnsDefinition() {
        when(repository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        AgentDefinition result = service.create(new CreateAgentRequest(
            "Planner", "desc", "custom", "help users", "be helpful",
            List.of("currentTime"), "what time is it?"
        ));

        assertThat(result.getName()).isEqualTo("Planner");
        assertThat(result.getEnabledTools()).containsExactly("currentTime");
        verify(repository).save(any());
    }

    @Test
    void create_trimsWhitespaceFromNameAndGoal() {
        when(repository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        AgentDefinition result = service.create(new CreateAgentRequest(
            "  Planner  ", "desc", "custom", "  help users  ", "be helpful",
            List.of("currentTime"), ""
        ));

        assertThat(result.getName()).isEqualTo("Planner");
        assertThat(result.getGoal()).isEqualTo("help users");
    }

    @Test
    void create_rejectsEmptyEnabledTools() {
        assertThatThrownBy(() -> service.create(new CreateAgentRequest(
            "Planner", "desc", "custom", "help users", "be helpful",
            List.of(), "input"
        ))).isInstanceOf(ResponseStatusException.class);
    }

    @Test
    void create_rejectsNullEnabledTools() {
        assertThatThrownBy(() -> service.create(new CreateAgentRequest(
            "Planner", "desc", "custom", "help users", "be helpful",
            null, "input"
        ))).isInstanceOf(ResponseStatusException.class);
    }

    @Test
    void create_deduplicatesEnabledTools() {
        when(repository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        AgentDefinition result = service.create(new CreateAgentRequest(
            "Planner", "", "custom", "help", "prompt",
            List.of("currentTime", "currentTime"), ""
        ));

        assertThat(result.getEnabledTools()).hasSize(1);
    }

    @Test
    void get_throwsNotFoundForUnknownId() {
        when(repository.findById("missing-id")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getById("missing-id"))
            .isInstanceOf(ResponseStatusException.class);
    }

    @Test
    void get_returnsAgentForKnownId() {
        AgentDefinition definition = new AgentDefinition(
            "id-1", "Planner", "", "custom", "help", "prompt",
            List.of("currentTime"), "", Instant.now(), Instant.now()
        );
        when(repository.findById("id-1")).thenReturn(Optional.of(definition));

        AgentDefinition result = service.getById("id-1");

        assertThat(result.getId()).isEqualTo("id-1");
    }

    @Test
    void update_savesUpdatedAgentAndReturnsDefinition() {
        AgentDefinition existing = new AgentDefinition(
            "id-1", "Old Name", "", "custom", "old goal", "old prompt",
            List.of("currentTime"), "", Instant.now(), Instant.now()
        );
        when(repository.findById("id-1")).thenReturn(Optional.of(existing));
        when(repository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        AgentDefinition result = service.update("id-1", new UpdateAgentRequest(
            "New Name", "", "new goal", "new prompt", List.of("listSchedules"), ""
        ));

        assertThat(result.getName()).isEqualTo("New Name");
        assertThat(result.getGoal()).isEqualTo("new goal");
        assertThat(result.getEnabledTools()).containsExactly("listSchedules");
    }
}
