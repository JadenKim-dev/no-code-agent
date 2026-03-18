# Backend Package Restructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `agent` 패키지를 `definition/execution/template` 3개 서브패키지로 분리하고, `StringListConverter`를 `common` 패키지로 이동하며, 테스트 파일명 불일치를 수정한다.

**Architecture:** 현재 15개 파일이 단일 `agent` 패키지에 혼재되어 있다. 도메인 역할(정의 관리, 실행, 템플릿)과 공통 인프라(JPA 컨버터)를 패키지 레벨에서 분리하여 응집도를 높인다. `stream` 패키지는 `ExecutionStreamController`가 `AgentRunRequest`를 import하는 레이어 위반이 있으나 이번 범위에서는 패키지 이동 없이 현행 유지한다.

**Tech Stack:** Java 21, Spring Boot 3, Jakarta Persistence, Lombok, JUnit 5, AssertJ

---

## File Structure After Refactoring

### 신규 패키지 구조

```
com.nocodeagent.platform
├── agent
│   ├── common
│   │   └── StringListConverter.java          (이동)
│   ├── definition
│   │   ├── AgentDefinition.java              (이동)
│   │   ├── AgentDefinitionController.java    (이동)
│   │   ├── AgentDefinitionRepository.java    (이동)
│   │   ├── AgentDefinitionService.java       (이동)
│   │   ├── CreateAgentRequest.java           (이동)
│   │   └── UpdateAgentRequest.java           (이동)
│   ├── execution
│   │   ├── AgentExecutionService.java        (이동)
│   │   ├── AgentRunRequest.java              (이동)
│   │   ├── AgentRunner.java                  (이동)
│   │   ├── FallbackAgentRunner.java          (이동)
│   │   └── SpringAiAgentRunner.java          (이동)
│   └── template
│       ├── AgentTemplate.java                (이동)
│       ├── AgentTemplateController.java      (이동)
│       └── AgentTemplateProvider.java        (이동)
├── config/...                                (변경 없음)
├── schedule/...                              (변경 없음)
├── stream/...                                (변경 없음)
└── tool/...                                  (변경 없음)
```

### 테스트 파일

```
src/test/java/com/nocodeagent/platform
├── agent
│   ├── common
│   │   └── StringListConverterTest.java      (이동)
│   ├── definition
│   │   ├── AgentDefinitionControllerTest.java (이동)
│   │   └── AgentDefinitionServiceTest.java    (이동)
│   ├── execution
│   │   └── FallbackAgentRunnerTest.java       (이동)
│   └── template
│       └── AgentTemplateProviderTest.java     (rename + 이동)
└── stream/...                                 (변경 없음)
```

---

## Task 1: `common` 패키지 — StringListConverter 이동

**Files:**
- Create: `backend/src/main/java/com/nocodeagent/platform/agent/common/StringListConverter.java`
- Create: `backend/src/test/java/com/nocodeagent/platform/agent/common/StringListConverterTest.java`
- Delete: `backend/src/main/java/com/nocodeagent/platform/agent/StringListConverter.java`
- Delete: `backend/src/test/java/com/nocodeagent/platform/agent/StringListConverterTest.java`

- [ ] **Step 1: 새 경로에 StringListConverter 생성**

```java
// backend/src/main/java/com/nocodeagent/platform/agent/common/StringListConverter.java
package com.nocodeagent.platform.agent.common;

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

- [ ] **Step 2: 새 경로에 StringListConverterTest 생성**

```java
// backend/src/test/java/com/nocodeagent/platform/agent/common/StringListConverterTest.java
package com.nocodeagent.platform.agent.common;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import org.junit.jupiter.api.Test;

class StringListConverterTest {

    private final StringListConverter converter = new StringListConverter();

    @Test
    void convertsListToCommaSeparatedString() {
        assertThat(converter.convertToDatabaseColumn(List.of("a", "b", "c"))).isEqualTo("a,b,c");
    }

    @Test
    void convertsNullListToNull() {
        assertThat(converter.convertToDatabaseColumn(null)).isNull();
    }

    @Test
    void convertsCommaSeparatedStringToList() {
        assertThat(converter.convertToEntityAttribute("a,b,c")).containsExactly("a", "b", "c");
    }

    @Test
    void convertsNullStringToEmptyList() {
        assertThat(converter.convertToEntityAttribute(null)).isEmpty();
    }

    @Test
    void convertsBlankStringToEmptyList() {
        assertThat(converter.convertToEntityAttribute("")).isEmpty();
    }
}
```

- [ ] **Step 3: 테스트 실행하여 통과 확인**

```bash
cd backend && ./gradlew test --tests "com.nocodeagent.platform.agent.common.StringListConverterTest" -i
```

Expected: BUILD SUCCESSFUL, 5 tests passed

- [ ] **Step 4: 기존 StringListConverter.java 및 테스트 파일 삭제**

```bash
rm backend/src/main/java/com/nocodeagent/platform/agent/StringListConverter.java
rm backend/src/test/java/com/nocodeagent/platform/agent/StringListConverterTest.java
```

- [ ] **Step 5: 전체 빌드 확인 (컴파일 에러 없는지)**

```bash
cd backend && ./gradlew compileJava compileTestJava
```

Expected: BUILD SUCCESSFUL

- [ ] **Step 6: Commit**

```bash
git add backend/src/main/java/com/nocodeagent/platform/agent/common/
git add backend/src/test/java/com/nocodeagent/platform/agent/common/
git add backend/src/main/java/com/nocodeagent/platform/agent/StringListConverter.java
git add backend/src/test/java/com/nocodeagent/platform/agent/StringListConverterTest.java
git commit -m "refactor: move StringListConverter to agent.common package"
```

---

## Task 2: `definition` 패키지 — Agent 정의 관리 클래스 이동

**Files:**
- Create: `backend/src/main/java/com/nocodeagent/platform/agent/definition/AgentDefinition.java`
- Create: `backend/src/main/java/com/nocodeagent/platform/agent/definition/AgentDefinitionRepository.java`
- Create: `backend/src/main/java/com/nocodeagent/platform/agent/definition/AgentDefinitionService.java`
- Create: `backend/src/main/java/com/nocodeagent/platform/agent/definition/AgentDefinitionController.java`
- Create: `backend/src/main/java/com/nocodeagent/platform/agent/definition/CreateAgentRequest.java`
- Create: `backend/src/main/java/com/nocodeagent/platform/agent/definition/UpdateAgentRequest.java`
- Create: `backend/src/test/java/com/nocodeagent/platform/agent/definition/AgentDefinitionControllerTest.java`
- Create: `backend/src/test/java/com/nocodeagent/platform/agent/definition/AgentDefinitionServiceTest.java`
- Delete: 기존 6개 파일 (agent 패키지)

- [ ] **Step 1: AgentDefinition.java 생성**

```java
// backend/src/main/java/com/nocodeagent/platform/agent/definition/AgentDefinition.java
package com.nocodeagent.platform.agent.definition;

import com.nocodeagent.platform.agent.common.StringListConverter;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "agent_definition")
@Getter
@NoArgsConstructor(access = lombok.AccessLevel.PROTECTED)
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
}
```

- [ ] **Step 2: AgentDefinitionRepository.java 생성**

```java
// backend/src/main/java/com/nocodeagent/platform/agent/definition/AgentDefinitionRepository.java
package com.nocodeagent.platform.agent.definition;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AgentDefinitionRepository extends JpaRepository<AgentDefinition, String> {

    List<AgentDefinition> findAllByOrderByUpdatedAtDesc();
}
```

- [ ] **Step 3: CreateAgentRequest.java 및 UpdateAgentRequest.java 생성**

```java
// backend/src/main/java/com/nocodeagent/platform/agent/definition/CreateAgentRequest.java
package com.nocodeagent.platform.agent.definition;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public record CreateAgentRequest(
    @NotBlank String name,
    String description,
    @NotBlank String type,
    @NotBlank String goal,
    @NotBlank String systemPrompt,
    List<String> enabledTools,
    String defaultInput
) {
}
```

```java
// backend/src/main/java/com/nocodeagent/platform/agent/definition/UpdateAgentRequest.java
package com.nocodeagent.platform.agent.definition;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public record UpdateAgentRequest(
    @NotBlank String name,
    String description,
    @NotBlank String goal,
    @NotBlank String systemPrompt,
    List<String> enabledTools,
    String defaultInput
) {
}
```

- [ ] **Step 4: AgentDefinitionService.java 생성**

```java
// backend/src/main/java/com/nocodeagent/platform/agent/definition/AgentDefinitionService.java
package com.nocodeagent.platform.agent.definition;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AgentDefinitionService {

    private final AgentDefinitionRepository repository;

    public AgentDefinition create(CreateAgentRequest request) {
        validateTools(request.enabledTools());
        Instant now = Instant.now();
        AgentDefinition definition = new AgentDefinition(
            UUID.randomUUID().toString(),
            request.name().trim(),
            normalize(request.description()),
            request.type().trim(),
            request.goal().trim(),
            request.systemPrompt().trim(),
            normalizeTools(request.enabledTools()),
            normalize(request.defaultInput()),
            now,
            now
        );
        return repository.save(definition);
    }

    public AgentDefinition update(String id, UpdateAgentRequest request) {
        AgentDefinition existing = getById(id);
        validateTools(request.enabledTools());
        AgentDefinition updated = new AgentDefinition(
            existing.getId(),
            request.name().trim(),
            normalize(existing.getDescription()),
            existing.getType(),
            request.goal().trim(),
            request.systemPrompt().trim(),
            normalizeTools(request.enabledTools()),
            normalize(request.defaultInput()),
            existing.getCreatedAt(),
            Instant.now()
        );
        return repository.save(updated);
    }

    public List<AgentDefinition> findAll() {
        return repository.findAllByOrderByUpdatedAtDesc();
    }

    public AgentDefinition getById(String id) {
        return repository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Agent not found: " + id));
    }

    private void validateTools(List<String> enabledTools) {
        if (enabledTools == null || enabledTools.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "At least one tool must be enabled");
        }
    }

    private List<String> normalizeTools(List<String> enabledTools) {
        return enabledTools == null ? List.of() : enabledTools.stream().distinct().toList();
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim();
    }
}
```

- [ ] **Step 5: AgentDefinitionController.java 생성**

```java
// backend/src/main/java/com/nocodeagent/platform/agent/definition/AgentDefinitionController.java
package com.nocodeagent.platform.agent.definition;

import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/agents")
@RequiredArgsConstructor
public class AgentDefinitionController {

    private final AgentDefinitionService service;

    @GetMapping
    public List<AgentDefinition> list() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public AgentDefinition get(@PathVariable String id) {
        return service.getById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AgentDefinition create(@Valid @RequestBody CreateAgentRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    public AgentDefinition update(@PathVariable String id, @Valid @RequestBody UpdateAgentRequest request) {
        return service.update(id, request);
    }
}
```

- [ ] **Step 6: 기존 테스트 파일을 새 패키지로 이동**

기존 `AgentDefinitionControllerTest.java`와 `AgentDefinitionServiceTest.java`를 읽고, `package` 선언만 `com.nocodeagent.platform.agent.definition`으로 변경하여 새 경로에 생성한 뒤 기존 파일은 삭제한다.

```bash
# 확인용 — 기존 테스트 내용을 먼저 읽어 package/import를 파악한다
cat backend/src/test/java/com/nocodeagent/platform/agent/AgentDefinitionControllerTest.java
cat backend/src/test/java/com/nocodeagent/platform/agent/AgentDefinitionServiceTest.java
```

- [ ] **Step 7: 컴파일 확인**

```bash
cd backend && ./gradlew compileJava compileTestJava
```

Expected: BUILD SUCCESSFUL (이 시점에서는 execution 클래스들이 아직 old package를 참조하여 실패할 수 있음 — Task 3 완료 후 전체 빌드)

> ⚠️ **주의:** Task 2 완료 후 `./gradlew test`를 실행하지 말 것. Task 5에서 old 파일을 삭제하기 전까지는 Spring 컨텍스트에 동일한 빈이 두 패키지에 중복 존재하며, `ExecutionStreamControllerTest`의 import도 아직 업데이트되지 않은 상태다. Task 5 완료 후 전체 테스트를 실행한다.

- [ ] **Step 8: 기존 파일 삭제 (Task 3 완료 후 함께 처리)**

Task 3, 4 완료 이후 한 번에 삭제 및 커밋한다.

---

## Task 3: `execution` 패키지 — Agent 실행 클래스 이동

**Files:**
- Create: `backend/src/main/java/com/nocodeagent/platform/agent/execution/AgentRunner.java`
- Create: `backend/src/main/java/com/nocodeagent/platform/agent/execution/SpringAiAgentRunner.java`
- Create: `backend/src/main/java/com/nocodeagent/platform/agent/execution/FallbackAgentRunner.java`
- Create: `backend/src/main/java/com/nocodeagent/platform/agent/execution/AgentExecutionService.java`
- Create: `backend/src/main/java/com/nocodeagent/platform/agent/execution/AgentRunRequest.java`
- Create: `backend/src/test/java/com/nocodeagent/platform/agent/execution/FallbackAgentRunnerTest.java`

> **참고:** `ExecutionStreamController`(stream 패키지)가 `AgentRunRequest`와 `AgentExecutionService`를 import한다. 이 Task에서 함께 import 경로를 업데이트한다.

- [ ] **Step 1: AgentRunRequest.java 생성**

```java
// backend/src/main/java/com/nocodeagent/platform/agent/execution/AgentRunRequest.java
package com.nocodeagent.platform.agent.execution;

import jakarta.validation.constraints.NotBlank;

public record AgentRunRequest(@NotBlank String input) {
}
```

- [ ] **Step 2: AgentRunner.java 생성**

```java
// backend/src/main/java/com/nocodeagent/platform/agent/execution/AgentRunner.java
package com.nocodeagent.platform.agent.execution;

import com.nocodeagent.platform.agent.definition.AgentDefinition;
import com.nocodeagent.platform.stream.ExecutionEvent;
import reactor.core.publisher.Flux;

public interface AgentRunner {

    Flux<ExecutionEvent> run(AgentDefinition definition, String input);
}
```

- [ ] **Step 3: SpringAiAgentRunner.java 생성**

```java
// backend/src/main/java/com/nocodeagent/platform/agent/execution/SpringAiAgentRunner.java
package com.nocodeagent.platform.agent.execution;

import com.nocodeagent.platform.agent.definition.AgentDefinition;
import com.nocodeagent.platform.stream.ExecutionEvent;
import com.nocodeagent.platform.tool.ToolRegistry;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.tool.ToolCallback;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;

@Component
@RequiredArgsConstructor
public class SpringAiAgentRunner implements AgentRunner {

    private final ChatClient.Builder chatClientBuilder;
    private final ToolRegistry toolRegistry;

    @Override
    public Flux<ExecutionEvent> run(AgentDefinition definition, String input) {
        return Flux.create(sink -> {
            List<ToolCallback> callbacks = toolRegistry.resolve(definition.getEnabledTools(), sink::next);
            chatClientBuilder.build()
                .prompt()
                .system(definition.getSystemPrompt())
                .user(input)
                .toolCallbacks(callbacks)
                .stream()
                .content()
                .map(ExecutionEvent::messageToken)
                .doOnComplete(() -> sink.next(ExecutionEvent.completed("Run completed")))
                .doOnError(error -> sink.next(ExecutionEvent.error(error.getMessage())))
                .subscribe(sink::next, sink::error, sink::complete);
        });
    }
}
```

- [ ] **Step 4: FallbackAgentRunner.java 생성**

```java
// backend/src/main/java/com/nocodeagent/platform/agent/execution/FallbackAgentRunner.java
package com.nocodeagent.platform.agent.execution;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nocodeagent.platform.agent.definition.AgentDefinition;
import com.nocodeagent.platform.stream.ExecutionEvent;
import com.nocodeagent.platform.tool.ToolRegistry;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.tool.ToolCallback;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;

@Component
@RequiredArgsConstructor
public class FallbackAgentRunner implements AgentRunner {

    private final ToolRegistry toolRegistry;
    private final ObjectMapper objectMapper;

    @Override
    public Flux<ExecutionEvent> run(AgentDefinition definition, String input) {
        List<ExecutionEvent> events = new ArrayList<>();
        events.add(ExecutionEvent.messageToken("Running fallback agent for "));
        events.add(ExecutionEvent.messageToken(definition.getName() + ". "));
        String lowerInput = input.toLowerCase();

        if (containsAny(lowerInput, "schedule", "일정")) {
            ToolCallback callback = toolRegistry.get("listSchedules", events::add);
            if (callback != null) {
                String result = callback.call("{}");
                events.add(ExecutionEvent.messageToken("Current schedules:\n" + result + "\n"));
            }
        }

        if (containsAny(lowerInput, "time", "시간", "today", "지금")) {
            ToolCallback callback = toolRegistry.get("currentTime", events::add);
            if (callback != null) {
                String result = callback.call("{}");
                events.add(ExecutionEvent.messageToken("Current time is " + result + ". "));
            }
        }

        if (containsAny(lowerInput, "reminder", "리마인더")) {
            ToolCallback callback = toolRegistry.get("createReminder", events::add);
            if (callback != null) {
                String result = callback.call(json("title", "Follow up", "remindAt", "2026-03-18T09:00:00"));
                events.add(ExecutionEvent.messageToken(result + ". "));
            }
        }

        if (containsAny(lowerInput, "create schedule", "add meeting", "등록")) {
            ToolCallback callback = toolRegistry.get("createSchedule", events::add);
            if (callback != null) {
                String result = callback.call(json("title", "Team sync", "scheduledFor", "2026-03-18T10:00:00"));
                events.add(ExecutionEvent.messageToken(result + ". "));
            }
        }

        if (events.stream().noneMatch(event -> "tool-call-start".equals(event.type()))) {
            events.add(ExecutionEvent.messageToken("""
                No deterministic tool path matched the request.
                Add OPENAI_API_KEY to use Spring AI model execution, or ask about current time / schedules / reminders.
                """.strip()));
        }

        events.add(ExecutionEvent.completed("Run completed"));
        return Flux.fromIterable(events);
    }

    private boolean containsAny(String value, String... candidates) {
        for (String candidate : candidates) {
            if (value.contains(candidate)) {
                return true;
            }
        }
        return false;
    }

    private String json(String key1, String value1, String key2, String value2) {
        try {
            return objectMapper.writeValueAsString(java.util.Map.of(key1, value1, key2, value2));
        }
        catch (JsonProcessingException exception) {
            throw new IllegalStateException(exception);
        }
    }
}
```

- [ ] **Step 5: AgentExecutionService.java 생성**

```java
// backend/src/main/java/com/nocodeagent/platform/agent/execution/AgentExecutionService.java
package com.nocodeagent.platform.agent.execution;

import com.nocodeagent.platform.agent.definition.AgentDefinition;
import com.nocodeagent.platform.agent.definition.AgentDefinitionService;
import com.nocodeagent.platform.stream.ExecutionEvent;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

@Service
public class AgentExecutionService {

    private final AgentDefinitionService agentDefinitionService;
    private final SpringAiAgentRunner springAiAgentRunner;
    private final FallbackAgentRunner fallbackAgentRunner;
    private final boolean demoMode;

    public AgentExecutionService(
        AgentDefinitionService agentDefinitionService,
        SpringAiAgentRunner springAiAgentRunner,
        FallbackAgentRunner fallbackAgentRunner,
        @Value("${spring.ai.openai.api-key:demo-key}") String apiKey
    ) {
        this.agentDefinitionService = agentDefinitionService;
        this.springAiAgentRunner = springAiAgentRunner;
        this.fallbackAgentRunner = fallbackAgentRunner;
        this.demoMode = "demo-key".equals(apiKey);
    }

    public Flux<ExecutionEvent> run(String agentId, String input) {
        AgentDefinition definition = agentDefinitionService.getById(agentId);
        AgentRunner runner = demoMode ? fallbackAgentRunner : springAiAgentRunner;
        return runner.run(definition, input);
    }
}
```

- [ ] **Step 6: ExecutionStreamController의 import 경로 업데이트**

`backend/src/main/java/com/nocodeagent/platform/stream/ExecutionStreamController.java`에서 아래 두 import를 수정한다:

```java
// 변경 전
import com.nocodeagent.platform.agent.AgentExecutionService;
import com.nocodeagent.platform.agent.AgentRunRequest;

// 변경 후
import com.nocodeagent.platform.agent.execution.AgentExecutionService;
import com.nocodeagent.platform.agent.execution.AgentRunRequest;
```

- [ ] **Step 7: ExecutionStreamControllerTest의 import 경로 업데이트**

`backend/src/test/java/com/nocodeagent/platform/stream/ExecutionStreamControllerTest.java`에서 아래 두 import를 수정한다:

```java
// 변경 전
import com.nocodeagent.platform.agent.AgentDefinitionService;
import com.nocodeagent.platform.agent.CreateAgentRequest;

// 변경 후
import com.nocodeagent.platform.agent.definition.AgentDefinitionService;
import com.nocodeagent.platform.agent.definition.CreateAgentRequest;
```

- [ ] **Step 8: 기존 테스트 FallbackAgentRunnerTest를 새 패키지로 이동**

기존 `FallbackAgentRunnerTest.java`를 읽어 `package`와 `import`를 수정한 뒤 새 경로에 생성:
```
backend/src/test/java/com/nocodeagent/platform/agent/execution/FallbackAgentRunnerTest.java
```

- [ ] **Step 9: 전체 컴파일 확인**

```bash
cd backend && ./gradlew compileJava compileTestJava
```

Expected: BUILD SUCCESSFUL

---

## Task 4: `template` 패키지 — Agent 템플릿 클래스 이동

**Files:**
- Create: `backend/src/main/java/com/nocodeagent/platform/agent/template/AgentTemplate.java`
- Create: `backend/src/main/java/com/nocodeagent/platform/agent/template/AgentTemplateController.java`
- Create: `backend/src/main/java/com/nocodeagent/platform/agent/template/AgentTemplateProvider.java`
- Create: `backend/src/test/java/com/nocodeagent/platform/agent/template/AgentTemplateProviderTest.java`  ← 파일명 변경 포함
- Delete: 기존 3개 파일 및 `SchedulerTemplateProviderTest.java`

- [ ] **Step 1: AgentTemplate.java 생성**

```java
// backend/src/main/java/com/nocodeagent/platform/agent/template/AgentTemplate.java
package com.nocodeagent.platform.agent.template;

import java.util.List;

public record AgentTemplate(
    String key,
    String name,
    String description,
    String type,
    String goal,
    String systemPrompt,
    List<String> enabledTools,
    String defaultInput
) {
}
```

- [ ] **Step 2: AgentTemplateProvider.java 생성**

```java
// backend/src/main/java/com/nocodeagent/platform/agent/template/AgentTemplateProvider.java
package com.nocodeagent.platform.agent.template;

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
```

- [ ] **Step 3: AgentTemplateController.java 생성**

```java
// backend/src/main/java/com/nocodeagent/platform/agent/template/AgentTemplateController.java
package com.nocodeagent.platform.agent.template;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/templates")
@RequiredArgsConstructor
public class AgentTemplateController {

    private final AgentTemplateProvider provider;

    @GetMapping
    public List<AgentTemplate> list() {
        return provider.listTemplates();
    }
}
```

- [ ] **Step 4: AgentTemplateProviderTest.java 생성 (SchedulerTemplateProviderTest → AgentTemplateProviderTest 파일명 수정)**

```java
// backend/src/test/java/com/nocodeagent/platform/agent/template/AgentTemplateProviderTest.java
package com.nocodeagent.platform.agent.template;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class AgentTemplateProviderTest {

    private final AgentTemplateProvider provider = new AgentTemplateProvider();

    @Test
    void returnsSchedulerTemplateWithExpectedTools() {
        AgentTemplate template = provider.listTemplates().get(0);

        assertThat(template.enabledTools()).containsExactlyInAnyOrder(
            "currentTime", "createSchedule", "createReminder", "listSchedules"
        );
    }
}
```

- [ ] **Step 5: 테스트 실행**

```bash
cd backend && ./gradlew test --tests "com.nocodeagent.platform.agent.template.AgentTemplateProviderTest" -i
```

Expected: BUILD SUCCESSFUL, 1 test passed

- [ ] **Step 6: 전체 빌드 및 테스트**

기존 파일 삭제 전 전체 테스트가 통과하는지 확인:
```bash
cd backend && ./gradlew test
```

Expected: BUILD SUCCESSFUL, all tests passed

---

## Task 5: 기존 파일 일괄 삭제 및 최종 검증

- [ ] **Step 1: 기존 agent 패키지 파일 모두 삭제**

```bash
rm backend/src/main/java/com/nocodeagent/platform/agent/AgentDefinition.java
rm backend/src/main/java/com/nocodeagent/platform/agent/AgentDefinitionController.java
rm backend/src/main/java/com/nocodeagent/platform/agent/AgentDefinitionRepository.java
rm backend/src/main/java/com/nocodeagent/platform/agent/AgentDefinitionService.java
rm backend/src/main/java/com/nocodeagent/platform/agent/AgentExecutionService.java
rm backend/src/main/java/com/nocodeagent/platform/agent/AgentRunner.java
rm backend/src/main/java/com/nocodeagent/platform/agent/AgentRunRequest.java
rm backend/src/main/java/com/nocodeagent/platform/agent/AgentTemplate.java
rm backend/src/main/java/com/nocodeagent/platform/agent/AgentTemplateController.java
rm backend/src/main/java/com/nocodeagent/platform/agent/AgentTemplateProvider.java
rm backend/src/main/java/com/nocodeagent/platform/agent/CreateAgentRequest.java
rm backend/src/main/java/com/nocodeagent/platform/agent/FallbackAgentRunner.java
rm backend/src/main/java/com/nocodeagent/platform/agent/SpringAiAgentRunner.java
rm backend/src/main/java/com/nocodeagent/platform/agent/UpdateAgentRequest.java
```

- [ ] **Step 2: 기존 테스트 파일 삭제**

```bash
rm backend/src/test/java/com/nocodeagent/platform/agent/AgentDefinitionControllerTest.java
rm backend/src/test/java/com/nocodeagent/platform/agent/AgentDefinitionServiceTest.java
rm backend/src/test/java/com/nocodeagent/platform/agent/FallbackAgentRunnerTest.java
rm backend/src/test/java/com/nocodeagent/platform/agent/SchedulerTemplateProviderTest.java
```

- [ ] **Step 3: 전체 빌드 및 테스트 최종 확인**

```bash
cd backend && ./gradlew clean test
```

Expected: BUILD SUCCESSFUL, all tests passed

- [ ] **Step 4: 최종 Commit**

```bash
git add -A backend/src/
git commit -m "refactor: split agent package into definition, execution, template sub-packages

- agent.definition: AgentDefinition entity, repository, service, controller, DTOs
- agent.execution: AgentRunner interface, SpringAiAgentRunner, FallbackAgentRunner, AgentExecutionService, AgentRunRequest
- agent.template: AgentTemplate, AgentTemplateProvider, AgentTemplateController
- agent.common: StringListConverter (JPA converter)
- Rename SchedulerTemplateProviderTest -> AgentTemplateProviderTest"
```
