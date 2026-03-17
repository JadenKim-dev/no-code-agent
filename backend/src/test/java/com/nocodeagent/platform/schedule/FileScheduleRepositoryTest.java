package com.nocodeagent.platform.schedule;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nocodeagent.platform.config.AppProperties;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

class FileScheduleRepositoryTest {

    @TempDir
    java.nio.file.Path tempDir;

    @Test
    void storesAndListsScheduleEntries() {
        AppProperties properties = new AppProperties();
        properties.getStorage().setSchedulesFile(tempDir.resolve("schedules.json"));
        FileScheduleRepository repository = new FileScheduleRepository(new ObjectMapper().findAndRegisterModules(), properties);

        repository.addSchedule("team sync", "2026-03-17T09:00:00");

        assertThat(repository.listSchedules()).hasSize(1);
    }
}
