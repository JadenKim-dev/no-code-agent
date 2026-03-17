package com.nocodeagent.platform.schedule;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nocodeagent.platform.config.AppProperties;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Repository;

@Repository
public class FileScheduleRepository implements ScheduleRepository {

    private final ObjectMapper objectMapper;
    private final Path file;

    public FileScheduleRepository(ObjectMapper objectMapper, AppProperties properties) {
        this.objectMapper = objectMapper;
        this.file = properties.getStorage().getSchedulesFile();
    }

    @Override
    public synchronized ScheduleEntry addSchedule(String title, String scheduledFor) {
        ScheduleState state = readState();
        ScheduleEntry entry = new ScheduleEntry(UUID.randomUUID().toString(), title, scheduledFor);
        List<ScheduleEntry> schedules = new ArrayList<>(state.schedules());
        schedules.add(entry);
        writeState(new ScheduleState(schedules, state.reminders()));
        return entry;
    }

    @Override
    public synchronized ReminderEntry addReminder(String title, String remindAt) {
        ScheduleState state = readState();
        ReminderEntry entry = new ReminderEntry(UUID.randomUUID().toString(), title, remindAt);
        List<ReminderEntry> reminders = new ArrayList<>(state.reminders());
        reminders.add(entry);
        writeState(new ScheduleState(state.schedules(), reminders));
        return entry;
    }

    @Override
    public synchronized List<ScheduleEntry> listSchedules() {
        return List.copyOf(readState().schedules());
    }

    @Override
    public synchronized List<ReminderEntry> listReminders() {
        return List.copyOf(readState().reminders());
    }

    private ScheduleState readState() {
        if (!Files.exists(file)) {
            return ScheduleState.empty();
        }
        try {
            return objectMapper.readValue(file.toFile(), ScheduleState.class);
        }
        catch (IOException exception) {
            return ScheduleState.empty();
        }
    }

    private void writeState(ScheduleState state) {
        try {
            Files.createDirectories(file.getParent());
            Path temp = Files.createTempFile(file.getParent(), "schedules", ".tmp");
            objectMapper.writeValue(temp.toFile(), state);
            Files.move(temp, file, StandardCopyOption.REPLACE_EXISTING, StandardCopyOption.ATOMIC_MOVE);
        }
        catch (IOException exception) {
            throw new UncheckedIOException("Failed to write schedule state", exception);
        }
    }
}
