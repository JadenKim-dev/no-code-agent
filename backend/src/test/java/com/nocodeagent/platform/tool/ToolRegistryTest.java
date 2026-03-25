package com.nocodeagent.platform.tool;

import static org.assertj.core.api.Assertions.assertThat;

import com.nocodeagent.platform.schedule.ReminderEntryRepository;
import com.nocodeagent.platform.schedule.ScheduleEntryRepository;
import com.nocodeagent.platform.stream.ExecutionEvent;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.ai.tool.ToolCallback;

@ExtendWith(MockitoExtension.class)
class ToolRegistryTest {

  @Mock ScheduleEntryRepository scheduleEntryRepository;

  @Mock ReminderEntryRepository reminderEntryRepository;

  ToolRegistry registry;

  @BeforeEach
  void setUp() {
    DateTimeTools dateTimeTools = new DateTimeTools();
    ScheduleTools scheduleTools =
        new ScheduleTools(scheduleEntryRepository, reminderEntryRepository);
    registry = new ToolRegistry(dateTimeTools, scheduleTools);
  }

  @Test
  void supportedToolNames_includesAllRegisteredTools() {
    List<String> names = registry.supportedToolNames();

    assertThat(names).contains("currentTime", "createSchedule", "createReminder", "listSchedules");
  }

  @Test
  void resolve_returnsOnlyRequestedTools() {
    List<ExecutionEvent> events = new ArrayList<>();
    List<ToolCallback> callbacks = registry.resolve(List.of("currentTime"), events::add);

    assertThat(callbacks).hasSize(1);
    assertThat(callbacks.get(0).getToolDefinition().name()).isEqualTo("currentTime");
  }

  @Test
  void resolve_filtersOutUnknownToolNames() {
    List<ExecutionEvent> events = new ArrayList<>();
    List<ToolCallback> callbacks =
        registry.resolve(List.of("unknownTool", "currentTime"), events::add);

    assertThat(callbacks).hasSize(1);
    assertThat(callbacks.get(0).getToolDefinition().name()).isEqualTo("currentTime");
  }

  @Test
  void resolve_deduplicatesToolNames() {
    List<ExecutionEvent> events = new ArrayList<>();
    List<ToolCallback> callbacks =
        registry.resolve(List.of("currentTime", "currentTime"), events::add);

    assertThat(callbacks).hasSize(1);
  }

  @Test
  void get_returnsNullForUnknownTool() {
    List<ExecutionEvent> events = new ArrayList<>();

    assertThat(registry.get("unknownTool", events::add)).isNull();
  }
}
