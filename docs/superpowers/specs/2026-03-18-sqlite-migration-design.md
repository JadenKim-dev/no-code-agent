# SQLite Migration Design

**Date:** 2026-03-18
**Scope:** Replace File I/O based repositories with Spring Data JPA + SQLite

---

## Problem

`FileAgentDefinitionRepository` and `FileScheduleRepository` use direct file I/O (JSON files) for persistence. This causes:

- No transactional guarantees
- No query capability (filtering/sorting done in memory)
- Concurrent access risks
- Scattered storage config (`agents-dir`, `schedules-file` as separate paths)

---

## Approach

Spring Data JPA with SQLite via `sqlite-jdbc` and `hibernate-community-dialects`. Domain records converted to JPA `@Entity` classes. File-based repositories deleted entirely. No data migration from existing JSON files.

---

## Dependencies (pom.xml)

Add three dependencies:

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

---

## Configuration

### application.yml

Remove `app.storage.agents-dir` and `app.storage.schedules-file`. Add:

```yaml
spring:
  datasource:
    url: jdbc:sqlite:${app.storage.data-dir:./data}/agents.db
    driver-class-name: org.sqlite.JDBC
  jpa:
    database-platform: org.hibernate.community.dialect.SQLiteDialect
    hibernate:
      ddl-auto: update  # SQLite only supports ADD COLUMN/RENAME; column removals/renames are silently ignored
    open-in-view: false

app:
  storage:
    data-dir: ./data
```

### AppProperties.java

Replace `agentsDir` and `schedulesFile` fields in `Storage` with a single `dataDir` field:

```java
public static class Storage {
    private Path dataDir = Path.of("./data");
    public Path getDataDir() { return dataDir; }
    public void setDataDir(Path dataDir) { this.dataDir = dataDir; }
}
```

---

## Entity Classes

### AgentDefinition.java

Convert from `record` to `@Entity` class. All 10 fields with their JPA annotations:

| Field | Type | Annotation |
|-------|------|------------|
| `id` | `String` | `@Id` |
| `name` | `String` | — |
| `description` | `String` | — |
| `type` | `String` | — |
| `goal` | `String` | — |
| `systemPrompt` | `String` | `@Column(columnDefinition = "TEXT")` |
| `enabledTools` | `List<String>` | `@Convert(converter = StringListConverter.class)` |
| `defaultInput` | `String` | — |
| `createdAt` | `Instant` | — (stored as epoch millis by SQLite dialect automatically) |
| `updatedAt` | `Instant` | — (stored as epoch millis by SQLite dialect automatically) |

Additional notes:
- `protected` no-arg constructor for JPA
- Full-arg constructor preserved for compatibility with `AgentDefinitionService`
- Getters only (no setters) to preserve immutability intent

### ScheduleEntry.java

Convert from `record` to `@Entity` class:
- `@Table(name = "schedule_entry")`
- Fields: `id`, `title`, `scheduledFor`
- `protected` no-arg constructor + full-arg constructor
- Getters only

### ReminderEntry.java

Convert from `record` to `@Entity` class:
- `@Table(name = "reminder_entry")`
- Fields: `id`, `title`, `remindAt`
- `protected` no-arg constructor + full-arg constructor
- Getters only

### StringListConverter.java (new)

`@Converter` implementing `AttributeConverter<List<String>, String>`. Serializes `List<String>` as comma-separated string in DB column.

```java
@Converter
public class StringListConverter implements AttributeConverter<List<String>, String> {
    public String convertToDatabaseColumn(List<String> list) { /* join with "," */ }
    public List<String> convertToEntityAttribute(String value) { /* split by "," */ }
}
```

**Edge case:** When `value` is null or blank, `convertToEntityAttribute` must return `List.of()` rather than splitting — `"".split(",")` returns `[""]` not `[]`.

---

## Repository Interfaces

### AgentDefinitionRepository.java

Replace existing interface with `JpaRepository` extension:

```java
public interface AgentDefinitionRepository extends JpaRepository<AgentDefinition, String> {
    List<AgentDefinition> findAllByOrderByUpdatedAtDesc();
}
```

Note: `findAllByOrderByUpdatedAtDesc()` relies on `updatedAt` being a mapped persistent field on the entity. See entity table above.

The existing `AgentDefinitionRepository.java` (plain custom interface) is replaced wholesale — not extended — with the `JpaRepository` extension above.

`FileAgentDefinitionRepository.java` → **deleted**

### ScheduleEntryRepository.java (new)

```java
public interface ScheduleEntryRepository extends JpaRepository<ScheduleEntry, String> {}
```

### ReminderEntryRepository.java (new)

```java
public interface ReminderEntryRepository extends JpaRepository<ReminderEntry, String> {}
```

`ScheduleRepository.java`, `FileScheduleRepository.java`, `ScheduleState.java` → **deleted**

---

## Service / Tool Changes

### AgentDefinitionService.java

One-line change: `repository.findAll()` → `repository.findAllByOrderByUpdatedAtDesc()`

No other changes needed. `JpaRepository` provides `save(S) → S`, `findById(ID) → Optional<T>`, and `findAll() → List<T>` with signatures compatible with the existing service code. `JpaRepository` also provides `deleteById` and `delete` out of the box; these are not currently called anywhere.

### ScheduleTools.java

Inject `ScheduleEntryRepository` and `ReminderEntryRepository` instead of `ScheduleRepository`. Replace method calls:

| Before | After |
|--------|-------|
| `repository.addSchedule(title, scheduledFor)` | `scheduleEntryRepository.save(new ScheduleEntry(UUID.randomUUID().toString(), title, scheduledFor))` |
| `repository.addReminder(title, remindAt)` | `reminderEntryRepository.save(new ReminderEntry(UUID.randomUUID().toString(), title, remindAt))` |
| `repository.listSchedules()` | `scheduleEntryRepository.findAll()` |

Entity getters are named using record-accessor style (`title()`, `scheduledFor()`, `remindAt()`) for call-site compatibility — no changes needed at call sites.

Note: `listReminders` is declared on `ScheduleRepository` but is not currently called from `ScheduleTools` — no mapping needed.

---

## Files Changed

### Production

| Action | File |
|--------|------|
| Modify | `pom.xml` |
| Modify | `application.yml` |
| Modify | `AppProperties.java` |
| Modify → class | `AgentDefinition.java` |
| Modify → class | `ScheduleEntry.java` |
| Modify → class | `ReminderEntry.java` |
| New | `StringListConverter.java` |
| Modify | `AgentDefinitionRepository.java` |
| New | `ScheduleEntryRepository.java` |
| New | `ReminderEntryRepository.java` |
| Modify | `AgentDefinitionService.java` |
| Modify | `ScheduleTools.java` |
| Delete | `FileAgentDefinitionRepository.java` |
| Delete | `FileScheduleRepository.java` |
| Delete | `ScheduleRepository.java` |
| Delete | `ScheduleState.java` |

### Test

| Action | File |
|--------|------|
| Delete | `FileAgentDefinitionRepositoryTest.java` |
| Delete | `FileScheduleRepositoryTest.java` |
| Modify | `AgentDefinitionControllerTest.java` — replace `@DynamicPropertySource` (which sets `app.storage.agents-dir` and `app.storage.schedules-file`) with `spring.datasource.url=jdbc:sqlite::memory:` |
| Modify | `ApplicationContextTest.java` — add `spring.datasource.url=jdbc:sqlite::memory:` to `@SpringBootTest(properties = ...)` to prevent context load failure |

---

## Out of Scope

- Data migration from existing JSON files (existing data discarded)
- Schema version management (Flyway/Liquibase)
- `delete` operation on `AgentDefinitionRepository` (not currently in use)
