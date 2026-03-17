package com.nocodeagent.platform.schedule;

import java.util.List;

public interface ScheduleRepository {

    ScheduleEntry addSchedule(String title, String scheduledFor);

    ReminderEntry addReminder(String title, String remindAt);

    List<ScheduleEntry> listSchedules();

    List<ReminderEntry> listReminders();
}
