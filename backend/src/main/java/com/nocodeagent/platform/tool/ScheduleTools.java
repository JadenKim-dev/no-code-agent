package com.nocodeagent.platform.tool;

import com.nocodeagent.platform.schedule.ScheduleRepository;
import java.util.stream.Collectors;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.stereotype.Component;

@Component
public class ScheduleTools {

    private final ScheduleRepository repository;

    public ScheduleTools(ScheduleRepository repository) {
        this.repository = repository;
    }

    @Tool(description = "Create a schedule entry with title and ISO-8601 datetime")
    public String createSchedule(String title, String scheduledFor) {
        var entry = repository.addSchedule(title, scheduledFor);
        return "Scheduled '" + entry.title() + "' for " + entry.scheduledFor();
    }

    @Tool(description = "Create a reminder with title and ISO-8601 datetime")
    public String createReminder(String title, String remindAt) {
        var entry = repository.addReminder(title, remindAt);
        return "Reminder '" + entry.title() + "' set for " + entry.remindAt();
    }

    @Tool(description = "List all current schedules")
    public String listSchedules() {
        var schedules = repository.listSchedules();
        if (schedules.isEmpty()) {
            return "No schedules found.";
        }
        return schedules.stream()
            .map(entry -> "- %s at %s".formatted(entry.title(), entry.scheduledFor()))
            .collect(Collectors.joining("\n"));
    }
}
