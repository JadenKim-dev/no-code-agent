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

## Docker

### Development

Runs Vite and Spring Boot in separate containers with source mounts.

```bash
bash scripts/dev-up.sh
```

Direct compose command:

```bash
docker compose -f docker-compose.dev.yml up --build
```

Access:

- frontend: `http://localhost:5173`
- backend: `http://localhost:8080`

### Production-like local run

Builds the frontend into an Nginx image and the backend into a packaged Spring Boot image.

```bash
bash scripts/prod-up.sh
```

Direct compose command:

```bash
docker compose -f docker-compose.prod.yml up --build
```

Access:

- app: `http://localhost`

### Environment variables

Docker uses the same runtime variables as direct local execution:

- `OPENAI_API_KEY`
- `OPENAI_MODEL`

You can place them in a root `.env` file before starting Compose. If `OPENAI_API_KEY` is not provided, the app falls back to `demo-key`, which keeps the local deterministic runner path available.

### Persistence

Backend file data is mounted into a Docker volume so saved agents and schedules survive container recreation in both development and production modes.

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

### Docker config validation

```bash
docker compose -f docker-compose.dev.yml config
docker compose -f docker-compose.prod.yml config
```

## Demo path

1. Open the React app.
2. Pick `Scheduler & Reminder Assistant` or start from `Blank Custom Agent`.
3. Save the agent.
4. Select the saved agent.
5. Run it with an input like `What time is it and what is on my schedule today?`
6. Inspect streamed tool events in the execution console.
