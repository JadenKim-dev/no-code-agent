# Spring AI No-Code Agent Platform MVP Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an educational MVP that lets users create, save, and run Spring AI agents from a React UI with file persistence, tool calling, and SSE streaming.

**Architecture:** Use a separated React frontend and Spring Boot backend. The backend owns agent definition persistence, template loading, execution orchestration, tool registration, and SSE streaming; the frontend owns template selection, form editing, agent browsing, and streamed run visualization.

**Tech Stack:** Java 21, Spring Boot, Spring AI, Spring Web, React, TypeScript, Vite, JSON file persistence, JUnit, Vitest, React Testing Library

---

## File Structure

Expected structure for this MVP:

- `backend/build.gradle` or `backend/pom.xml`
- `backend/src/main/java/.../agent/`
- `backend/src/main/java/.../tool/`
- `backend/src/main/java/.../schedule/`
- `backend/src/main/java/.../stream/`
- `backend/src/main/resources/`
- `backend/data/agents/`
- `backend/data/schedules/`
- `backend/src/test/java/...`
- `frontend/package.json`
- `frontend/src/app/`
- `frontend/src/features/agents/`
- `frontend/src/features/run-console/`
- `frontend/src/lib/`
- `frontend/src/test/`

Each package or folder should have one clear responsibility. Avoid large “misc” utility files.

## Chunk 1: Project Skeleton

### Task 1: Create backend project skeleton

**Files:**
- Create: `backend/build.gradle` or `backend/pom.xml`
- Create: `backend/settings.gradle` if Gradle is used
- Create: `backend/src/main/java/<package>/Application.java`
- Create: `backend/src/main/resources/application.yml`
- Test: `backend/src/test/java/<package>/ApplicationContextTest.java`

- [ ] **Step 1: Write the failing backend context test**

```java
@SpringBootTest
class ApplicationContextTest {
    @Test
    void contextLoads() {
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && ./gradlew test --tests '*ApplicationContextTest'`
Expected: FAIL because the project files do not exist yet.

- [ ] **Step 3: Add minimal Spring Boot application setup**

```java
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd backend && ./gradlew test --tests '*ApplicationContextTest'`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend
git commit -m "chore: scaffold spring boot backend"
```

### Task 2: Create frontend project skeleton

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/vite.config.ts`
- Create: `frontend/src/main.tsx`
- Create: `frontend/src/App.tsx`
- Create: `frontend/src/test/app.test.tsx`

- [ ] **Step 1: Write the failing frontend smoke test**

```tsx
import { render, screen } from "@testing-library/react";
import App from "../App";

it("renders the app shell", () => {
  render(<App />);
  expect(screen.getByText(/agent/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npm test -- --runInBand`
Expected: FAIL because the frontend app does not exist yet.

- [ ] **Step 3: Add minimal React app shell**

```tsx
export default function App() {
  return <main>No-Code Agent Platform</main>;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd frontend && npm test -- --runInBand`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend
git commit -m "chore: scaffold react frontend"
```

## Chunk 2: Agent Definition Persistence

### Task 3: Define the backend agent model and repository

**Files:**
- Create: `backend/src/main/java/<package>/agent/AgentDefinition.java`
- Create: `backend/src/main/java/<package>/agent/AgentDefinitionRepository.java`
- Create: `backend/src/main/java/<package>/agent/FileAgentDefinitionRepository.java`
- Test: `backend/src/test/java/<package>/agent/FileAgentDefinitionRepositoryTest.java`

- [ ] **Step 1: Write the failing repository test**

```java
@Test
void savesAndLoadsAgentDefinition() {
    AgentDefinition definition = new AgentDefinition(
        "agent-1", "Planner", "desc", "custom",
        "help users", "You are helpful", List.of("currentTime"), "default input"
    );

    repository.save(definition);

    assertThat(repository.findById("agent-1")).isPresent();
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && ./gradlew test --tests '*FileAgentDefinitionRepositoryTest'`
Expected: FAIL because repository classes do not exist.

- [ ] **Step 3: Implement minimal file repository with JSON serialization**

```java
public interface AgentDefinitionRepository {
    AgentDefinition save(AgentDefinition definition);
    Optional<AgentDefinition> findById(String id);
    List<AgentDefinition> findAll();
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd backend && ./gradlew test --tests '*FileAgentDefinitionRepositoryTest'`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/java backend/src/test/java
git commit -m "feat: add file-backed agent repository"
```

### Task 4: Expose agent CRUD API

**Files:**
- Create: `backend/src/main/java/<package>/agent/AgentDefinitionService.java`
- Create: `backend/src/main/java/<package>/agent/AgentDefinitionController.java`
- Test: `backend/src/test/java/<package>/agent/AgentDefinitionControllerTest.java`

- [ ] **Step 1: Write the failing API test**

```java
@Test
void createsAgentDefinition() throws Exception {
    mockMvc.perform(post("/api/agents")
        .contentType(MediaType.APPLICATION_JSON)
        .content("""
            {"name":"Planner","type":"custom","goal":"help users","systemPrompt":"prompt","enabledTools":["currentTime"]}
        """))
        .andExpect(status().isCreated());
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && ./gradlew test --tests '*AgentDefinitionControllerTest'`
Expected: FAIL because the controller does not exist.

- [ ] **Step 3: Implement service validation and CRUD endpoints**

```java
@RestController
@RequestMapping("/api/agents")
class AgentDefinitionController {
    @PostMapping
    ResponseEntity<AgentDefinition> create(@RequestBody CreateAgentRequest request) { ... }

    @GetMapping
    List<AgentDefinition> list() { ... }

    @GetMapping("/{id}")
    AgentDefinition get(@PathVariable String id) { ... }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd backend && ./gradlew test --tests '*AgentDefinitionControllerTest'`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/java backend/src/test/java
git commit -m "feat: add agent definition api"
```

## Chunk 3: Templates and Schedule Storage

### Task 5: Add scheduler template provider

**Files:**
- Create: `backend/src/main/java/<package>/agent/AgentTemplate.java`
- Create: `backend/src/main/java/<package>/agent/AgentTemplateController.java`
- Create: `backend/src/main/java/<package>/agent/SchedulerTemplateProvider.java`
- Test: `backend/src/test/java/<package>/agent/SchedulerTemplateProviderTest.java`

- [ ] **Step 1: Write the failing template test**

```java
@Test
void returnsSchedulerTemplateWithExpectedTools() {
    AgentTemplate template = provider.getSchedulerTemplate();
    assertThat(template.enabledTools()).containsExactlyInAnyOrder(
        "currentTime", "createSchedule", "createReminder", "listSchedules"
    );
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && ./gradlew test --tests '*SchedulerTemplateProviderTest'`
Expected: FAIL because the provider does not exist.

- [ ] **Step 3: Implement template model and API**

```java
public record AgentTemplate(
    String key,
    String name,
    String description,
    String goal,
    String systemPrompt,
    List<String> enabledTools
) {}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd backend && ./gradlew test --tests '*SchedulerTemplateProviderTest'`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/java backend/src/test/java
git commit -m "feat: add scheduler template"
```

### Task 6: Add file-backed schedule and reminder storage

**Files:**
- Create: `backend/src/main/java/<package>/schedule/ScheduleEntry.java`
- Create: `backend/src/main/java/<package>/schedule/ReminderEntry.java`
- Create: `backend/src/main/java/<package>/schedule/ScheduleRepository.java`
- Create: `backend/src/main/java/<package>/schedule/FileScheduleRepository.java`
- Test: `backend/src/test/java/<package>/schedule/FileScheduleRepositoryTest.java`

- [ ] **Step 1: Write the failing storage test**

```java
@Test
void storesAndListsScheduleEntries() {
    repository.addSchedule(new ScheduleEntry("sched-1", "team sync", "2026-03-17T09:00:00"));
    assertThat(repository.listSchedules()).hasSize(1);
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && ./gradlew test --tests '*FileScheduleRepositoryTest'`
Expected: FAIL because the repository does not exist.

- [ ] **Step 3: Implement JSON-backed schedule repository**

```java
public interface ScheduleRepository {
    void addSchedule(ScheduleEntry entry);
    void addReminder(ReminderEntry entry);
    List<ScheduleEntry> listSchedules();
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd backend && ./gradlew test --tests '*FileScheduleRepositoryTest'`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/java backend/src/test/java
git commit -m "feat: add schedule storage"
```

## Chunk 4: Tool Registry and Execution

### Task 7: Implement tool services

**Files:**
- Create: `backend/src/main/java/<package>/tool/DateTimeTools.java`
- Create: `backend/src/main/java/<package>/tool/ScheduleTools.java`
- Test: `backend/src/test/java/<package>/tool/ScheduleToolsTest.java`

- [ ] **Step 1: Write the failing tool test**

```java
@Test
void createsReminderThroughTool() {
    String result = tools.createReminder("Submit report", "2026-03-18T08:30:00");
    assertThat(result).contains("Submit report");
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && ./gradlew test --tests '*ScheduleToolsTest'`
Expected: FAIL because the tool classes do not exist.

- [ ] **Step 3: Implement declarative Spring AI tools**

```java
class DateTimeTools {
    @Tool(description = "Get the current date and time")
    String currentTime() { ... }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd backend && ./gradlew test --tests '*ScheduleToolsTest'`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/java backend/src/test/java
git commit -m "feat: add scheduler tools"
```

### Task 8: Implement agent execution service with allowlisted tools

**Files:**
- Create: `backend/src/main/java/<package>/agent/AgentExecutionService.java`
- Create: `backend/src/main/java/<package>/tool/ToolRegistry.java`
- Test: `backend/src/test/java/<package>/agent/AgentExecutionServiceTest.java`

- [ ] **Step 1: Write the failing execution test**

```java
@Test
void onlyRegistersEnabledToolsForExecution() {
    AgentDefinition definition = fixture.withEnabledTools(List.of("currentTime"));
    ExecutionSession session = service.prepare(definition);
    assertThat(session.toolNames()).containsExactly("currentTime");
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && ./gradlew test --tests '*AgentExecutionServiceTest'`
Expected: FAIL because the execution service does not exist.

- [ ] **Step 3: Implement execution preparation around ChatClient**

```java
class AgentExecutionService {
    ExecutionSession prepare(AgentDefinition definition) {
        List<ToolCallback> callbacks = registry.resolve(definition.enabledTools());
        return new ExecutionSession(chatClient, callbacks, definition);
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd backend && ./gradlew test --tests '*AgentExecutionServiceTest'`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/java backend/src/test/java
git commit -m "feat: add agent execution service"
```

## Chunk 5: SSE Streaming API

### Task 9: Add execution stream endpoint

**Files:**
- Create: `backend/src/main/java/<package>/stream/ExecutionEvent.java`
- Create: `backend/src/main/java/<package>/stream/ExecutionStreamController.java`
- Modify: `backend/src/main/java/<package>/agent/AgentExecutionService.java`
- Test: `backend/src/test/java/<package>/stream/ExecutionStreamControllerTest.java`

- [ ] **Step 1: Write the failing stream test**

```java
@Test
void streamsExecutionEvents() throws Exception {
    mockMvc.perform(post("/api/agents/agent-1/runs/stream")
        .contentType(MediaType.APPLICATION_JSON)
        .content("""{"input":"What is on my schedule today?"}"""))
        .andExpect(status().isOk())
        .andExpect(header().string("Content-Type", containsString("text/event-stream")));
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && ./gradlew test --tests '*ExecutionStreamControllerTest'`
Expected: FAIL because the streaming endpoint does not exist.

- [ ] **Step 3: Implement SSE endpoint and event mapping**

```java
public record ExecutionEvent(String type, String content) {}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd backend && ./gradlew test --tests '*ExecutionStreamControllerTest'`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/java backend/src/test/java
git commit -m "feat: add execution streaming api"
```

## Chunk 6: React Agent Management UI

### Task 10: Build template gallery and agent form

**Files:**
- Create: `frontend/src/features/agents/TemplateGallery.tsx`
- Create: `frontend/src/features/agents/AgentForm.tsx`
- Create: `frontend/src/features/agents/types.ts`
- Create: `frontend/src/lib/api.ts`
- Test: `frontend/src/features/agents/AgentForm.test.tsx`

- [ ] **Step 1: Write the failing form test**

```tsx
it("submits agent definition fields", async () => {
  render(<AgentForm onSubmit={onSubmit} />);
  await user.type(screen.getByLabelText(/name/i), "Planner");
  await user.click(screen.getByRole("button", { name: /save/i }));
  expect(onSubmit).toHaveBeenCalled();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npm test -- AgentForm.test.tsx`
Expected: FAIL because the form does not exist.

- [ ] **Step 3: Implement template selection and form editing**

```tsx
type AgentFormValues = {
  name: string;
  description: string;
  goal: string;
  systemPrompt: string;
  enabledTools: string[];
  defaultInput: string;
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd frontend && npm test -- AgentForm.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src
git commit -m "feat: add agent creation form"
```

### Task 11: Build agent list and persistence wiring

**Files:**
- Create: `frontend/src/features/agents/AgentList.tsx`
- Modify: `frontend/src/App.tsx`
- Test: `frontend/src/features/agents/AgentList.test.tsx`

- [ ] **Step 1: Write the failing list test**

```tsx
it("renders saved agents", () => {
  render(<AgentList agents={[{ id: "1", name: "Planner" }]} />);
  expect(screen.getByText("Planner")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npm test -- AgentList.test.tsx`
Expected: FAIL because the list does not exist.

- [ ] **Step 3: Implement list rendering and load/save integration**

```tsx
<AgentList agents={agents} onSelect={setSelectedAgentId} />
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd frontend && npm test -- AgentList.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src
git commit -m "feat: add agent list view"
```

## Chunk 7: React Run Console and Streaming Integration

### Task 12: Build run console event renderer

**Files:**
- Create: `frontend/src/features/run-console/RunConsole.tsx`
- Create: `frontend/src/features/run-console/types.ts`
- Test: `frontend/src/features/run-console/RunConsole.test.tsx`

- [ ] **Step 1: Write the failing console test**

```tsx
it("renders tool and token events", () => {
  render(<RunConsole events={[
    { type: "tool-call-start", content: "currentTime" },
    { type: "message-token", content: "Hello" }
  ]} />);
  expect(screen.getByText(/currentTime/i)).toBeInTheDocument();
  expect(screen.getByText(/Hello/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npm test -- RunConsole.test.tsx`
Expected: FAIL because the console component does not exist.

- [ ] **Step 3: Implement event rendering with distinct visual states**

```tsx
type RunEvent = { type: string; content: string };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd frontend && npm test -- RunConsole.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src
git commit -m "feat: add run console"
```

### Task 13: Wire frontend to SSE execution endpoint

**Files:**
- Modify: `frontend/src/lib/api.ts`
- Modify: `frontend/src/App.tsx`
- Test: `frontend/src/test/execution-stream.test.ts`

- [ ] **Step 1: Write the failing integration test**

```tsx
it("consumes streamed execution events", async () => {
  const events = await collectExecutionEvents("agent-1", "what time is it?");
  expect(events.at(0)?.type).toBeDefined();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npm test -- execution-stream.test.ts`
Expected: FAIL because the streaming client does not exist.

- [ ] **Step 3: Implement SSE client and UI wiring**

```ts
export function streamAgentRun(agentId: string, input: string, onEvent: (event: RunEvent) => void) {
  // Use EventSource or fetch stream adapter depending on backend contract.
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd frontend && npm test -- execution-stream.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src
git commit -m "feat: wire execution streaming"
```

## Chunk 8: End-to-End Hardening

### Task 14: Add validation and corrupted-file handling

**Files:**
- Modify: `backend/src/main/java/<package>/agent/AgentDefinitionService.java`
- Modify: `backend/src/main/java/<package>/agent/FileAgentDefinitionRepository.java`
- Modify: `frontend/src/features/agents/AgentForm.tsx`
- Test: `backend/src/test/java/<package>/agent/AgentDefinitionValidationTest.java`
- Test: `frontend/src/features/agents/AgentForm.validation.test.tsx`

- [ ] **Step 1: Write the failing validation tests**

```java
@Test
void rejectsAgentWithoutName() {
    assertThatThrownBy(() -> service.create(requestWithoutName))
        .isInstanceOf(ValidationException.class);
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && ./gradlew test --tests '*AgentDefinitionValidationTest' && cd ../frontend && npm test -- AgentForm.validation.test.tsx`
Expected: FAIL because validation is incomplete.

- [ ] **Step 3: Implement mirrored frontend/backend validation and invalid-file filtering**

```java
if (request.name() == null || request.name().isBlank()) {
    throw new ValidationException("name is required");
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd backend && ./gradlew test --tests '*AgentDefinitionValidationTest' && cd ../frontend && npm test -- AgentForm.validation.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend frontend
git commit -m "feat: add validation and persistence hardening"
```

### Task 15: Verify main demo path

**Files:**
- Modify: `README.md`
- Create: `docs/demo-script.md`

- [ ] **Step 1: Write a manual verification checklist**

```md
1. Start backend
2. Start frontend
3. Create custom agent
4. Save and reload
5. Run scheduler template
6. Observe streamed tool events
```

- [ ] **Step 2: Run the full verification flow**

Run: `cd backend && ./gradlew test && cd ../frontend && npm test`
Expected: PASS

- [ ] **Step 3: Add startup and demo instructions**

```md
## Run locally

backend: ./gradlew bootRun
frontend: npm run dev
```

- [ ] **Step 4: Re-run verification**

Run: `cd backend && ./gradlew test && cd ../frontend && npm test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add README.md docs
git commit -m "docs: add demo guide and local setup"
```
