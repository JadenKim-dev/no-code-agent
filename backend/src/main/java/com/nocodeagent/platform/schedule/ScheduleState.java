package com.nocodeagent.platform.schedule;

import java.util.List;

public record ScheduleState(List<ScheduleEntry> schedules, List<ReminderEntry> reminders) {

    public static ScheduleState empty() {
        return new ScheduleState(List.of(), List.of());
    }
}
