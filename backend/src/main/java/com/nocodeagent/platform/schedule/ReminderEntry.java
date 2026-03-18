package com.nocodeagent.platform.schedule;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "reminder_entry")
@Getter
@NoArgsConstructor(access = lombok.AccessLevel.PROTECTED)
public class ReminderEntry {

    @Id
    private String id;
    private String title;
    private String remindAt;

    public ReminderEntry(String id, String title, String remindAt) {
        this.id = id;
        this.title = title;
        this.remindAt = remindAt;
    }
}
