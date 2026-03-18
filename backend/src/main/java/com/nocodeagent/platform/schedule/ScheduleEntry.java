package com.nocodeagent.platform.schedule;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "schedule_entry")
@Getter
@NoArgsConstructor(access = lombok.AccessLevel.PROTECTED)
public class ScheduleEntry {

    @Id
    private String id;
    private String title;
    private String scheduledFor;

    public ScheduleEntry(String id, String title, String scheduledFor) {
        this.id = id;
        this.title = title;
        this.scheduledFor = scheduledFor;
    }
}
