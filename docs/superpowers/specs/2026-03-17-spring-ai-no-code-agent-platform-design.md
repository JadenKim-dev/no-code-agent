# Spring AI No-Code Agent Platform Design

## Overview

This document defines the first implementation slice for a Spring AI based no-code agent platform. The scope is intentionally limited to an educational MVP that demonstrates the core Spring AI flow end to end rather than a production-grade multi-user platform.

The MVP must let a user:
- create an agent through a form-based UI,
- choose either a generic custom agent or a built-in scheduler/reminder template,
- save agent definitions to local files,
- execute a saved agent,
- observe model output and tool activity through SSE streaming.

The following are explicitly out of scope for this slice:
- MCP integration,
- authentication and multi-user support,
- database persistence,
- RAG/vector search,
- advanced permissions and governance,
- production deployment concerns.

## Goals

- Learn Spring AI through a realistic but bounded project.
- Demonstrate `ChatClient`, tool calling, and SSE streaming in one coherent product flow.
- Keep the architecture extensible enough to add MCP and richer storage later.
- Produce a portfolio-usable demo without bloating the first milestone.

## Product Scope

### User Experience

The product is a small React web app backed by a Spring Boot API. The user journey is:

1. Open the app and browse templates or start with a blank agent.
2. Fill out an agent form with basic configuration.
3. Save the agent definition.
4. Select a saved agent and run it with an input prompt.
5. Watch streamed responses and tool invocation events in a console-like run view.

### Supported Agent Types

- Generic custom agent
- Scheduler/reminder assistant template

The template exists to guarantee a stable demo path while the custom agent preserves the no-code value proposition.

## Architecture

### Frontend

React is used for a lightweight single-page application. The UI is intentionally narrow in scope and organized around four areas:

- `TemplateGallery`: shows the scheduler/reminder template and a blank custom-agent option.
- `AgentForm`: edits the agent definition.
- `AgentList`: displays saved agents and lets the user reopen or run them.
- `RunConsole`: shows streaming model text, tool call lifecycle events, and terminal errors.

The frontend should prefer a simple state model and direct API integration over introducing heavy client-side architecture.

### Backend

Spring Boot with Spring AI provides:

- agent definition CRUD APIs,
- template API,
- execution API,
- SSE streaming endpoint,
- tool registry and execution layer,
- file-based persistence for agent and schedule data.

The runtime must cleanly separate the saved agent definition from the execution session so later features such as MCP-backed tools or alternative storage can be added without rewriting the UI contract.

## Data Model

### Agent Definition

Each agent definition should contain only the fields required for the MVP:

- `id`
- `name`
- `description`
- `type` (`custom` or `scheduler-template`)
- `goal`
- `systemPrompt`
- `enabledTools`
- `defaultInput`
- `createdAt`
- `updatedAt`

Definitions are stored as JSON files on disk.

### Scheduler Data

The scheduler/reminder template needs simple stateful tool behavior. Store schedule and reminder entries in file-based JSON as well. This data is independent from the agent definition itself.

## Tool Calling Design

The MVP demonstrates both read and write tools.

### Read Tools

- current time lookup
- schedule list lookup

### Action Tools

- schedule creation
- reminder creation

Tool execution is allowlist-based. An agent may only invoke tools explicitly enabled in its saved definition. This keeps the no-code configuration aligned with actual runtime behavior and avoids surprising tool access.

## Streaming Design

Execution results are streamed from backend to frontend over SSE.

The stream should expose discrete event types rather than only raw text so the frontend can render a meaningful execution log. Minimum event types:

- `message-token`
- `tool-call-start`
- `tool-call-result`
- `completed`
- `error`

This preserves educational value because users can observe when the model decides to use a tool and what happened next.

## Error Handling

### Validation Errors

- The frontend validates required fields before submit.
- The backend repeats validation and returns structured API errors.

### Runtime Errors

- Tool execution failures are surfaced as SSE error events.
- Invalid or corrupted stored definitions are excluded from runnable items.
- File save operations should be atomic enough to avoid partially written JSON.

## Testing Strategy

### Backend Tests

- repository tests for file persistence,
- tool unit tests,
- template loading tests,
- API tests for agent CRUD,
- execution tests for streamed event structure.

### Frontend Tests

- form serialization and validation,
- agent list rendering,
- SSE event rendering in the run console.

The goal is not exhaustive coverage. The goal is to lock down the core learning flow and prevent regressions in the main demo path.

## Implementation Boundaries

This first slice must stop once the following are working:

- create and save agent definitions,
- reload saved definitions,
- run a generic agent,
- run the scheduler/reminder template,
- execute a bounded set of tools,
- stream output and tool events to the UI.

Anything beyond that belongs in later slices.

## Recommended Technical Direction

- Backend: Spring Boot, Spring Web, Spring AI, SSE endpoint support
- Frontend: React SPA
- Persistence: local JSON files
- Execution model: Spring AI `ChatClient` with tool callbacks

This is the recommended design because it balances clarity, learning value, and implementation cost for a first Spring AI project.
