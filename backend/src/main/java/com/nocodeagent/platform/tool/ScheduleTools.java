package com.nocodeagent.platform.tool;

import com.nocodeagent.platform.schedule.ReminderEntry;
import com.nocodeagent.platform.schedule.ReminderEntryRepository;
import com.nocodeagent.platform.schedule.ScheduleEntry;
import com.nocodeagent.platform.schedule.ScheduleEntryRepository;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.stereotype.Component;

@Component
public class ScheduleTools {

    private final ScheduleEntryRepository scheduleEntryRepository;
    private final ReminderEntryRepository reminderEntryRepository;

    public ScheduleTools(ScheduleEntryRepository scheduleEntryRepository,
                         ReminderEntryRepository reminderEntryRepository) {
        this.scheduleEntryRepository = scheduleEntryRepository;
        this.reminderEntryRepository = reminderEntryRepository;
    }

    @Tool(description = "Create a schedule entry with title and ISO-8601 datetime")
    public String createSchedule(String title, String scheduledFor) {
        var entry = scheduleEntryRepository.save(
            new ScheduleEntry(UUID.randomUUID().toString(), title, scheduledFor));
        return "Scheduled '" + entry.title() + "' for " + entry.scheduledFor();
    }

    @Tool(description = "Create a reminder with title and ISO-8601 datetime")
    public String createReminder(String title, String remindAt) {
        var entry = reminderEntryRepository.save(
            new ReminderEntry(UUID.randomUUID().toString(), title, remindAt));
        return "Reminder '" + entry.title() + "' set for " + entry.remindAt();
    }

    @Tool(description = "List all current schedules")
    public String listSchedules() {
        var schedules = scheduleEntryRepository.findAll();
        if (schedules.isEmpty()) {
            return "No schedules found.";
        }
        return schedules.stream()
            .map(entry -> "- %s at %s".formatted(entry.title(), entry.scheduledFor()))
            .collect(Collectors.joining("\n"));
    }
}
