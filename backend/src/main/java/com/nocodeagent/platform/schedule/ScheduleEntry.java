package com.nocodeagent.platform.schedule;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "schedule_entry")
public class ScheduleEntry {

    @Id
    private String id;
    private String title;
    private String scheduledFor;

    protected ScheduleEntry() {}

    public ScheduleEntry(String id, String title, String scheduledFor) {
        this.id = id;
        this.title = title;
        this.scheduledFor = scheduledFor;
    }

    @JsonProperty public String id() { return id; }
    @JsonProperty public String title() { return title; }
    @JsonProperty public String scheduledFor() { return scheduledFor; }
}
