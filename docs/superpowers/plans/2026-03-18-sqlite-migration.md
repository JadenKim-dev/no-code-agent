# SQLite Migration Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace file-based JSON repositories with Spring Data JPA + SQLite for transactional, queryable persistence.

**Architecture:** Convert `AgentDefinition`, `ScheduleEntry`, `ReminderEntry` records to JPA `@Entity` classes; replace `FileAgentDefinitionRepository` and `FileScheduleRepository` with Spring Data `JpaRepository` interfaces; delete all file-I/O repository code.

**Tech Stack:** Spring Boot 3.4.3, Spring Data JPA, SQLite via `sqlite-jdbc` 3.47.0.0, `hibernate-community-dialects` (SQLiteDialect)

---

## File Map

| Action | Path |
|--------|------|
| Modify | `backend/pom.xml` |
| Modify | `backend/src/main/resources/application.yml` |
| Modify | `backend/src/main/java/com/nocodeagent/platform/config/AppProperties.java` |
| New    | `backend/src/main/java/com/nocodeagent/platform/agent/StringListConverter.java` |
| Modify | `backend/src/main/java/com/nocodeagent/platform/agent/AgentDefinition.java` |
| Modify | `backend/src/main/java/com/nocodeagent/platform/agent/AgentDefinitionRepository.java` |
| Delete | `backend/src/main/java/com/nocodeagent/platform/agent/FileAgentDefinitionRepository.java` |
| Modify | `backend/src/main/java/com/nocodeagent/platform/agent/AgentDefinitionService.java` |
| Modify | `backend/src/main/java/com/nocodeagent/platform/schedule/ScheduleEntry.java` |
| Modify | `backend/src/main/java/com/nocodeagent/platform/schedule/ReminderEntry.java` |
| New    | `backend/src/main/java/com/nocodeagent/platform/schedule/ScheduleEntryRepository.java` |
| New    | `backend/src/main/java/com/nocodeagent/platform/schedule/ReminderEntryRepository.java` |
| Delete | `backend/src/main/java/com/nocodeagent/platform/schedule/ScheduleRepository.java` |
| Delete | `backend/src/main/java/com/nocodeagent/platform/schedule/FileScheduleRepository.java` |
| Delete | `backend/src/main/java/com/nocodeagent/platform/schedule/ScheduleState.java` |
| Modify | `backend/src/main/java/com/nocodeagent/platform/tool/ScheduleTools.java` |
| Delete | `backend/src/test/java/com/nocodeagent/platform/agent/FileAgentDefinitionRepositoryTest.java` |
| Delete | `backend/src/test/java/com/nocodeagent/platform/schedule/FileScheduleRepositoryTest.java` |
| Modify | `backend/src/test/java/com/nocodeagent/platform/agent/AgentDefinitionControllerTest.java` |
| Modify | `backend/src/test/java/com/nocodeagent/platform/ApplicationContextTest.java` |

---

### Task 1: Add dependencies and configure datasource

**Files:**
- Modify: `backend/pom.xml`
- Modify: `backend/src/main/resources/application.yml`
- Modify: `backend/src/main/java/com/nocodeagent/platform/config/AppProperties.java`

- [ ] **Step 1: Add JPA + SQLite dependencies to pom.xml**

In `backend/pom.xml`, add inside `<dependencies>`:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
<dependency>
    <groupId>org.xerial</groupId>
    <artifactId>sqlite-jdbc</artifactId>
    <version>3.47.0.0</version>
</dependency>
<dependency>
    <groupId>org.hibernate.orm</groupId>
    <artifactId>hibernate-community-dialects</artifactId>
</dependency>
```

- [ ] **Step 2: Update application.yml**

Replace the `app.storage` block and add Spring datasource/JPA config. Final `application.yml`:

```yaml
spring:
  application:
    name: no-code-agent-backend
  ai:
    openai:
      api-key: ${OPENAI_API_KEY:demo-key}
      chat:
        options:
          model: ${OPENAI_MODEL:gpt-4o-mini}
  datasource:
    url: jdbc:sqlite:${app.storage.data-dir:./data}/agents.db
    driver-class-name: org.sqlite.JDBC
  jpa:
    database-platform: org.hibernate.community.dialect.SQLiteDialect
    hibernate:
      ddl-auto: update
    open-in-view: false

app:
  storage:
    data-dir: ./data
  cors:
    allowed-origins: http://localhost:5173
```

- [ ] **Step 3: Simplify AppProperties.Storage**

Replace the contents of `AppProperties.java`. The `Storage` inner class should have only `dataDir`:

```java
package com.nocodeagent.platform.config;

import java.nio.file.Path;
import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
public class AppProperties {

    private final Storage storage = new Storage();
    private final Cors cors = new Cors();

    public Storage getStorage() {
        return storage;
    }

    public Cors getCors() {
        return cors;
    }

    public static class Storage {
        private Path dataDir = Path.of("./data");

        public Path getDataDir() {
            return dataDir;
        }

        public void setDataDir(Path dataDir) {
            this.dataDir = dataDir;
        }
    }

    public static class Cors {
        private List<String> allowedOrigins = List.of("http://localhost:5173");

        public List<String> getAllowedOrigins() {
            return allowedOrigins;
        }

        public void setAllowedOrigins(List<String> allowedOrigins) {
            this.allowedOrigins = allowedOrigins;
        }
    }
}
```

- [ ] **Step 4: Verify compile**

```bash
cd backend && ./mvnw compile -q
```

Expected: BUILD SUCCESS (compile errors are expected later until entities are updated — if there are only errors about `agentsDir`/`schedulesFile` references, that is acceptable at this stage)

- [ ] **Step 5: Commit**

```bash
cd backend
git add pom.xml src/main/resources/application.yml src/main/java/com/nocodeagent/platform/config/AppProperties.java
git commit -m "chore: add spring-data-jpa and sqlite dependencies, simplify storage config"
```

---

### Task 2: Add StringListConverter

**Files:**
- Create: `backend/src/main/java/com/nocodeagent/platform/agent/StringListConverter.java`

- [ ] **Step 1: Write the test**

Create `backend/src/test/java/com/nocodeagent/platform/agent/StringListConverterTest.java`:

```java
package com.nocodeagent.platform.agent;

import java.util.List;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

class StringListConverterTest {

    private final StringListConverter converter = new StringListConverter();

    @Test
    void convertToDatabaseColumn_joinWithComma() {
        assertThat(converter.convertToDatabaseColumn(List.of("web_search", "calculator")))
            .isEqualTo("web_search,calculator");
    }

    @Test
    void convertToDatabaseColumn_emptyList_returnsEmptyString() {
        assertThat(converter.convertToDatabaseColumn(List.of())).isEqualTo("");
    }

    @Test
    void convertToDatabaseColumn_null_returnsNull() {
        assertThat(converter.convertToDatabaseColumn(null)).isNull();
    }

    @Test
    void convertToEntityAttribute_splitByComma() {
        assertThat(converter.convertToEntityAttribute("web_search,calculator"))
            .containsExactly("web_search", "calculator");
    }

    @Test
    void convertToEntityAttribute_emptyString_returnsEmptyList() {
        assertThat(converter.convertToEntityAttribute("")).isEmpty();
    }

    @Test
    void convertToEntityAttribute_null_returnsEmptyList() {
        assertThat(converter.convertToEntityAttribute(null)).isEmpty();
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd backend && ./mvnw test -pl . -Dtest=StringListConverterTest -q 2>&1 | tail -5
```

Expected: FAIL — `StringListConverter` does not exist yet

- [ ] **Step 3: Implement StringListConverter**

Create `backend/src/main/java/com/nocodeagent/platform/agent/StringListConverter.java`:

```java
package com.nocodeagent.platform.agent;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import java.util.Arrays;
import java.util.List;

@Converter
public class StringListConverter implements AttributeConverter<List<String>, String> {

    @Override
    public String convertToDatabaseColumn(List<String> list) {
        if (list == null) {
            return null;
        }
        return String.join(",", list);
    }

    @Override
    public List<String> convertToEntityAttribute(String value) {
        if (value == null || value.isBlank()) {
            return List.of();
        }
        return Arrays.stream(value.split(","))
            .filter(s -> !s.isBlank())
            .toList();
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd backend && ./mvnw test -pl . -Dtest=StringListConverterTest -q 2>&1 | tail -5
```

Expected: BUILD SUCCESS, 1 test class, 6 tests passed

- [ ] **Step 5: Commit**

```bash
cd backend
git add src/main/java/com/nocodeagent/platform/agent/StringListConverter.java \
        src/test/java/com/nocodeagent/platform/agent/StringListConverterTest.java
git commit -m "feat: add StringListConverter for List<String> JPA column mapping"
```

---

### Task 3: Convert AgentDefinition record to JPA entity

**Files:**
- Modify: `backend/src/main/java/com/nocodeagent/platform/agent/AgentDefinition.java`

- [ ] **Step 1: Replace AgentDefinition record with @Entity class**

Overwrite `backend/src/main/java/com/nocodeagent/platform/agent/AgentDefinition.java`:

```java
package com.nocodeagent.platform.agent;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.List;

@Entity
@Table(name = "agent_definition")
public class AgentDefinition {

    @Id
    private String id;
    private String name;
    private String description;
    private String type;
    private String goal;
    @Column(columnDefinition = "TEXT")
    private String systemPrompt;
    @Convert(converter = StringListConverter.class)
    private List<String> enabledTools;
    private String defaultInput;
    private Instant createdAt;
    private Instant updatedAt;

    protected AgentDefinition() {}

    public AgentDefinition(String id, String name, String description, String type, String goal,
                           String systemPrompt, List<String> enabledTools, String defaultInput,
                           Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.type = type;
        this.goal = goal;
        this.systemPrompt = systemPrompt;
        this.enabledTools = enabledTools;
        this.defaultInput = defaultInput;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public String id() { return id; }
    public String name() { return name; }
    public String description() { return description; }
    public String type() { return type; }
    public String goal() { return goal; }
    public String systemPrompt() { return systemPrompt; }
    public List<String> enabledTools() { return enabledTools; }
    public String defaultInput() { return defaultInput; }
    public Instant createdAt() { return createdAt; }
    public Instant updatedAt() { return updatedAt; }
}
```

Note: getters use `id()` / `name()` style (matching record accessor names) so `AgentDefinitionService` and other callers compile without changes.

- [ ] **Step 2: Verify compile**

```bash
cd backend && ./mvnw compile -q 2>&1 | grep -E "ERROR|WARNING|BUILD"
```

Expected: BUILD SUCCESS (or only errors in File*Repository classes which will be deleted)

- [ ] **Step 3: Commit**

```bash
cd backend
git add src/main/java/com/nocodeagent/platform/agent/AgentDefinition.java
git commit -m "feat: convert AgentDefinition record to JPA entity"
```

---

### Task 4: Convert ScheduleEntry and ReminderEntry records to JPA entities

**Files:**
- Modify: `backend/src/main/java/com/nocodeagent/platform/schedule/ScheduleEntry.java`
- Modify: `backend/src/main/java/com/nocodeagent/platform/schedule/ReminderEntry.java`

- [ ] **Step 1: Replace ScheduleEntry record with @Entity class**

Overwrite `backend/src/main/java/com/nocodeagent/platform/schedule/ScheduleEntry.java`:

```java
package com.nocodeagent.platform.schedule;

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

    public String id() { return id; }
    public String title() { return title; }
    public String scheduledFor() { return scheduledFor; }
}
```

- [ ] **Step 2: Replace ReminderEntry record with @Entity class**

Overwrite `backend/src/main/java/com/nocodeagent/platform/schedule/ReminderEntry.java`:

```java
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
```

- [ ] **Step 3: Verify compile**

```bash
cd backend && ./mvnw compile -q 2>&1 | grep -E "ERROR|WARNING|BUILD"
```

Expected: BUILD SUCCESS (or only errors in File*Repository classes)

- [ ] **Step 4: Commit**

```bash
cd backend
git add src/main/java/com/nocodeagent/platform/schedule/ScheduleEntry.java \
        src/main/java/com/nocodeagent/platform/schedule/ReminderEntry.java
git commit -m "feat: convert ScheduleEntry and ReminderEntry records to JPA entities"
```

---

### Task 5: Replace AgentDefinitionRepository with JpaRepository

**Files:**
- Modify: `backend/src/main/java/com/nocodeagent/platform/agent/AgentDefinitionRepository.java`
- Delete: `backend/src/main/java/com/nocodeagent/platform/agent/FileAgentDefinitionRepository.java`
- Modify: `backend/src/main/java/com/nocodeagent/platform/agent/AgentDefinitionService.java`

- [ ] **Step 1: Replace AgentDefinitionRepository interface**

Overwrite `backend/src/main/java/com/nocodeagent/platform/agent/AgentDefinitionRepository.java`:

```java
package com.nocodeagent.platform.agent;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AgentDefinitionRepository extends JpaRepository<AgentDefinition, String> {

    List<AgentDefinition> findAllByOrderByUpdatedAtDesc();
}
```

- [ ] **Step 2: Delete FileAgentDefinitionRepository**

```bash
rm backend/src/main/java/com/nocodeagent/platform/agent/FileAgentDefinitionRepository.java
```

- [ ] **Step 3: Update AgentDefinitionService — replace findAll() call**

In `backend/src/main/java/com/nocodeagent/platform/agent/AgentDefinitionService.java`, change line 56:

```java
// Before
return repository.findAll();

// After
return repository.findAllByOrderByUpdatedAtDesc();
```

- [ ] **Step 4: Verify compile**

```bash
cd backend && ./mvnw compile -q 2>&1 | grep -E "ERROR|WARNING|BUILD"
```

Expected: BUILD SUCCESS (schedule-related compile errors are acceptable until Task 6)

- [ ] **Step 5: Commit**

```bash
cd backend
git add src/main/java/com/nocodeagent/platform/agent/AgentDefinitionRepository.java \
        src/main/java/com/nocodeagent/platform/agent/AgentDefinitionService.java
git rm src/main/java/com/nocodeagent/platform/agent/FileAgentDefinitionRepository.java
git commit -m "feat: replace FileAgentDefinitionRepository with Spring Data JPA"
```

---

### Task 6: Replace ScheduleRepository with JpaRepository interfaces

**Files:**
- New: `backend/src/main/java/com/nocodeagent/platform/schedule/ScheduleEntryRepository.java`
- New: `backend/src/main/java/com/nocodeagent/platform/schedule/ReminderEntryRepository.java`
- Delete: `backend/src/main/java/com/nocodeagent/platform/schedule/ScheduleRepository.java`
- Delete: `backend/src/main/java/com/nocodeagent/platform/schedule/FileScheduleRepository.java`
- Delete: `backend/src/main/java/com/nocodeagent/platform/schedule/ScheduleState.java`
- Modify: `backend/src/main/java/com/nocodeagent/platform/tool/ScheduleTools.java`

- [ ] **Step 1: Create ScheduleEntryRepository**

Create `backend/src/main/java/com/nocodeagent/platform/schedule/ScheduleEntryRepository.java`:

```java
package com.nocodeagent.platform.schedule;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ScheduleEntryRepository extends JpaRepository<ScheduleEntry, String> {}
```

- [ ] **Step 2: Create ReminderEntryRepository**

Create `backend/src/main/java/com/nocodeagent/platform/schedule/ReminderEntryRepository.java`:

```java
package com.nocodeagent.platform.schedule;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ReminderEntryRepository extends JpaRepository<ReminderEntry, String> {}
```

- [ ] **Step 3: Rewrite ScheduleTools to use new repositories**

Overwrite `backend/src/main/java/com/nocodeagent/platform/tool/ScheduleTools.java`:

```java
package com.nocodeagent.platform.tool;

import com.nocodeagent.platform.schedule.ReminderEntry;
import com.nocodeagent.platform.schedule.ReminderEntryRepository;
import com.nocodeagent.platform.schedule.ScheduleEntry;
import com.nocodeagent.platform.schedule.ScheduleEntryRepository;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.stereotype.Component;

@Component
public class ScheduleTools {

    private final ScheduleEntryRepository scheduleEntryRepository;
    private final ReminderEntryRepository reminderEntryRepository;

    public ScheduleTools(ScheduleEntryRepository scheduleEntryRepository,
                         ReminderEntryRepository reminderEntryRepository) {
        this.scheduleEntryRepository = scheduleEntryRepository;
        this.reminderEntryRepository = reminderEntryRepository;
    }

    @Tool(description = "Create a schedule entry with title and ISO-8601 datetime")
    public String createSchedule(String title, String scheduledFor) {
        var entry = scheduleEntryRepository.save(
            new ScheduleEntry(UUID.randomUUID().toString(), title, scheduledFor));
        return "Scheduled '" + entry.title() + "' for " + entry.scheduledFor();
    }

    @Tool(description = "Create a reminder with title and ISO-8601 datetime")
    public String createReminder(String title, String remindAt) {
        var entry = reminderEntryRepository.save(
            new ReminderEntry(UUID.randomUUID().toString(), title, remindAt));
        return "Reminder '" + entry.title() + "' set for " + entry.remindAt();
    }

    @Tool(description = "List all current schedules")
    public String listSchedules() {
        var schedules = scheduleEntryRepository.findAll();
        if (schedules.isEmpty()) {
            return "No schedules found.";
        }
        return schedules.stream()
            .map(entry -> "- %s at %s".formatted(entry.title(), entry.scheduledFor()))
            .collect(Collectors.joining("\n"));
    }
}
```

- [ ] **Step 4: Delete old schedule files**

```bash
rm backend/src/main/java/com/nocodeagent/platform/schedule/ScheduleRepository.java
rm backend/src/main/java/com/nocodeagent/platform/schedule/FileScheduleRepository.java
rm backend/src/main/java/com/nocodeagent/platform/schedule/ScheduleState.java
```

- [ ] **Step 5: Verify full compile**

```bash
cd backend && ./mvnw compile -q 2>&1 | grep -E "ERROR|WARNING|BUILD"
```

Expected: BUILD SUCCESS with no errors

- [ ] **Step 6: Commit**

```bash
cd backend
git add src/main/java/com/nocodeagent/platform/schedule/ScheduleEntryRepository.java \
        src/main/java/com/nocodeagent/platform/schedule/ReminderEntryRepository.java \
        src/main/java/com/nocodeagent/platform/tool/ScheduleTools.java
git rm src/main/java/com/nocodeagent/platform/schedule/ScheduleRepository.java \
       src/main/java/com/nocodeagent/platform/schedule/FileScheduleRepository.java \
       src/main/java/com/nocodeagent/platform/schedule/ScheduleState.java
git commit -m "feat: replace FileScheduleRepository with Spring Data JPA repositories"
```

---

### Task 7: Fix tests

**Files:**
- Delete: `backend/src/test/java/com/nocodeagent/platform/agent/FileAgentDefinitionRepositoryTest.java`
- Delete: `backend/src/test/java/com/nocodeagent/platform/schedule/FileScheduleRepositoryTest.java`
- Modify: `backend/src/test/java/com/nocodeagent/platform/agent/AgentDefinitionControllerTest.java`
- Modify: `backend/src/test/java/com/nocodeagent/platform/ApplicationContextTest.java`

- [ ] **Step 1: Delete file-repository test classes**

```bash
rm backend/src/test/java/com/nocodeagent/platform/agent/FileAgentDefinitionRepositoryTest.java
rm backend/src/test/java/com/nocodeagent/platform/schedule/FileScheduleRepositoryTest.java
```

- [ ] **Step 2: Fix AgentDefinitionControllerTest — replace @DynamicPropertySource with in-memory SQLite**

In `backend/src/test/java/com/nocodeagent/platform/agent/AgentDefinitionControllerTest.java`:

Remove the `@DynamicPropertySource` method and add `spring.datasource.url=jdbc:sqlite::memory:` to the `@SpringBootTest` annotation:

```java
@SpringBootTest(properties = {
    "spring.ai.openai.api-key=demo-key",
    "spring.datasource.url=jdbc:sqlite::memory:"
})
@AutoConfigureMockMvc
class AgentDefinitionControllerTest {

    @Autowired
    MockMvc mockMvc;

    // @DynamicPropertySource method removed entirely
```

Remove the `import org.springframework.test.context.DynamicPropertyRegistry;` and `import org.springframework.test.context.DynamicPropertySource;` imports as well.

- [ ] **Step 3: Fix ApplicationContextTest — add in-memory SQLite property**

In `backend/src/test/java/com/nocodeagent/platform/ApplicationContextTest.java`:

```java
@SpringBootTest(properties = {
    "spring.ai.openai.api-key=test-key",
    "spring.datasource.url=jdbc:sqlite::memory:"
})
class ApplicationContextTest {

    @Test
    void contextLoads() {
    }
}
```

- [ ] **Step 4: Run all tests**

```bash
cd backend && ./mvnw test -q 2>&1 | tail -20
```

Expected: BUILD SUCCESS, all tests pass. If `AgentDefinitionControllerTest` fails with context load error, verify the `@SpringBootTest` properties array contains both `spring.ai.openai.api-key` and `spring.datasource.url`.

- [ ] **Step 5: Commit**

```bash
cd backend
git rm src/test/java/com/nocodeagent/platform/agent/FileAgentDefinitionRepositoryTest.java \
       src/test/java/com/nocodeagent/platform/schedule/FileScheduleRepositoryTest.java
git add src/test/java/com/nocodeagent/platform/agent/AgentDefinitionControllerTest.java \
        src/test/java/com/nocodeagent/platform/ApplicationContextTest.java
git commit -m "test: update tests for SQLite migration — remove file repo tests, fix context config"
```
