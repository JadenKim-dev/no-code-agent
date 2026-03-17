import type { AgentDefinition, AgentFormValues, AgentTemplate } from "../features/agents/types";
import type { RunEvent } from "../features/run-console/types";

const JSON_HEADERS = {
  "Content-Type": "application/json"
};

export async function fetchTemplates(): Promise<AgentTemplate[]> {
  const response = await fetch("/api/templates");
  return response.json();
}

export async function fetchAgents(): Promise<AgentDefinition[]> {
  const response = await fetch("/api/agents");
  return response.json();
}

export async function createAgent(values: AgentFormValues): Promise<AgentDefinition> {
  const response = await fetch("/api/agents", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(values)
  });
  return response.json();
}

export async function updateAgent(id: string, values: AgentFormValues): Promise<AgentDefinition> {
  const response = await fetch(`/api/agents/${id}`, {
    method: "PUT",
    headers: JSON_HEADERS,
    body: JSON.stringify(values)
  });
  return response.json();
}

export async function streamAgentRun(
  agentId: string,
  input: string,
  onEvent: (event: RunEvent) => void
): Promise<void> {
  const response = await fetch(`/api/agents/${agentId}/runs/stream`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ input })
  });

  if (!response.body) {
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n\n");
    buffer = parts.pop() ?? "";

    for (const part of parts) {
      const event = parseSseEvent(part);
      if (event) {
        onEvent(event);
      }
    }
  }
}

export function parseSseEvent(rawEvent: string): RunEvent | null {
  const lines = rawEvent.split("\n");
  const eventType = lines.find((line) => line.startsWith("event:"))?.replace("event:", "").trim();
  const dataLine = lines.find((line) => line.startsWith("data:"))?.replace("data:", "").trim();

  if (!eventType || !dataLine) {
    return null;
  }

  return JSON.parse(dataLine) as RunEvent;
}
