package com.nocodeagent.platform.schedule;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "reminder_entry")
public class ReminderEntry {

    @Id
    private String id;
    private String title;
    private String remindAt;

    protected ReminderEntry() {}

    public ReminderEntry(String id, String title, String remindAt) {
        this.id = id;
        this.title = title;
        this.remindAt = remindAt;
    }

    public String id() { return id; }
    public String title() { return title; }
    public String remindAt() { return remindAt; }
}
