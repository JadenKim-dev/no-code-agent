package com.nocodeagent.platform.agent;

import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class AgentTemplateProvider {

    public List<AgentTemplate> listTemplates() {
        return List.of(
            new AgentTemplate(
                "scheduler-template",
                "Scheduler & Reminder Assistant",
                "Helps users inspect schedules, create events, and register reminders.",
                "scheduler-template",
                "Help users manage schedules and reminders accurately.",
                """
                You are a scheduling assistant.
                Use the provided tools when time-sensitive or schedule-specific data is needed.
                Keep answers short and explicit about what action was taken.
                """,
                List.of("currentTime", "createSchedule", "createReminder", "listSchedules"),
                "What is on my schedule today?"
            )
        );
    }
}
