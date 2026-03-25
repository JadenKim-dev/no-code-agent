package com.nocodeagent.platform.tool;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.nocodeagent.platform.schedule.ReminderEntry;
import com.nocodeagent.platform.schedule.ReminderEntryRepository;
import com.nocodeagent.platform.schedule.ScheduleEntry;
import com.nocodeagent.platform.schedule.ScheduleEntryRepository;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ScheduleToolsTest {

  @Mock ScheduleEntryRepository scheduleEntryRepository;

  @Mock ReminderEntryRepository reminderEntryRepository;

  ScheduleTools tools;

  @BeforeEach
  void setUp() {
    tools = new ScheduleTools(scheduleEntryRepository, reminderEntryRepository);
  }

  @Test
  void createSchedule_savesEntryAndReturnsConfirmation() {
    when(scheduleEntryRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

    String result = tools.createSchedule("Team sync", "2026-03-18T10:00:00");

    assertThat(result).contains("Team sync");
    assertThat(result).contains("2026-03-18T10:00:00");
    verify(scheduleEntryRepository).save(any(ScheduleEntry.class));
  }

  @Test
  void createReminder_savesEntryAndReturnsConfirmation() {
    when(reminderEntryRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

    String result = tools.createReminder("Submit report", "2026-03-18T08:30:00");

    assertThat(result).contains("Submit report");
    assertThat(result).contains("2026-03-18T08:30:00");
    verify(reminderEntryRepository).save(any(ReminderEntry.class));
  }

  @Test
  void listSchedules_returnsFormattedList() {
    when(scheduleEntryRepository.findAll())
        .thenReturn(
            List.of(
                new ScheduleEntry("id-1", "Team sync", "2026-03-18T10:00:00"),
                new ScheduleEntry("id-2", "1:1 with manager", "2026-03-18T14:00:00")));

    String result = tools.listSchedules();

    assertThat(result).contains("Team sync");
    assertThat(result).contains("1:1 with manager");
  }

  @Test
  void listSchedules_whenEmpty_returnsNoSchedulesMessage() {
    when(scheduleEntryRepository.findAll()).thenReturn(List.of());

    String result = tools.listSchedules();

    assertThat(result).contains("No schedules found");
  }
}
