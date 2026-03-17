# Spring AI No-Code Agent Platform MVP

Educational MVP for building and running saved agent definitions with Spring AI and React.

## Structure

- `backend`: Spring Boot API, file persistence, tool registry, SSE execution stream
- `frontend`: React UI for template selection, agent editing, saved agent list, run console

## Run

### Backend

```bash
cd backend
mvn spring-boot:run
```

The backend starts on `http://localhost:8080`.

If `OPENAI_API_KEY` is set, the app attempts Spring AI model execution. If it is not set, the app falls back to a deterministic local runner so the demo still works.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend starts on `http://localhost:5173` and proxies `/api` requests to the backend.

## Verify

### Backend tests

```bash
cd backend
mvn test
```

### Frontend tests and build

```bash
cd frontend
npm test
npm run build
```

## Demo path

1. Open the React app.
2. Pick `Scheduler & Reminder Assistant` or start from `Blank Custom Agent`.
3. Save the agent.
4. Select the saved agent.
5. Run it with an input like `What time is it and what is on my schedule today?`
6. Inspect streamed tool events in the execution console.
