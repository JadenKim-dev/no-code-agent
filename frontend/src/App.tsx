import { useEffect, useState, useTransition } from "react";
import { AgentForm } from "./features/agents/AgentForm";
import { AgentList } from "./features/agents/AgentList";
import { TemplateGallery } from "./features/agents/TemplateGallery";
import type { AgentDefinition, AgentFormValues, AgentTemplate } from "./features/agents/types";
import { RunConsole } from "./features/run-console/RunConsole";
import type { RunEvent } from "./features/run-console/types";
import { createAgent, fetchAgents, fetchTemplates, streamAgentRun, updateAgent } from "./lib/api";

const blankFormValues: AgentFormValues = {
  name: "",
  description: "",
  type: "custom",
  goal: "",
  systemPrompt: "",
  enabledTools: ["currentTime"],
  defaultInput: ""
};

export default function App() {
  const [templates, setTemplates] = useState<AgentTemplate[]>([]);
  const [agents, setAgents] = useState<AgentDefinition[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<AgentDefinition | null>(null);
  const [formValues, setFormValues] = useState<AgentFormValues>(blankFormValues);
  const [events, setEvents] = useState<RunEvent[]>([]);
  const [runInput, setRunInput] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    void Promise.all([fetchTemplates(), fetchAgents()]).then(([loadedTemplates, loadedAgents]) => {
      setTemplates(loadedTemplates);
      setAgents(loadedAgents);
      if (loadedAgents[0]) {
        setSelectedAgent(loadedAgents[0]);
        setFormValues(toFormValues(loadedAgents[0]));
        setRunInput(loadedAgents[0].defaultInput);
      }
    });
  }, []);

  async function handleSave(values: AgentFormValues) {
    const saved = selectedAgent
      ? await updateAgent(selectedAgent.id, values)
      : await createAgent(values);

    startTransition(() => {
      setSelectedAgent(saved);
      setFormValues(toFormValues(saved));
      setRunInput(saved.defaultInput);
      setAgents((current) => [saved, ...current.filter((agent) => agent.id !== saved.id)]);
    });
  }

  async function handleRun() {
    if (!selectedAgent) {
      return;
    }
    setEvents([]);
    await streamAgentRun(selectedAgent.id, runInput || selectedAgent.defaultInput, (event) => {
      startTransition(() => {
        setEvents((current) => [...current, event]);
      });
    });
  }

  return (
    <main className="app-shell">
      <section className="hero panel">
        <p className="eyebrow">Spring AI MVP</p>
        <h1>No-Code Agent Studio</h1>
        <p className="hero-copy">
          Build a saved agent definition, enable bounded tools, and watch model or fallback execution stream in real time.
        </p>
      </section>

      <TemplateGallery
        templates={templates}
        onSelect={(template) => {
          const nextValues = {
            name: template.name,
            description: template.description,
            type: template.type,
            goal: template.goal,
            systemPrompt: template.systemPrompt,
            enabledTools: template.enabledTools,
            defaultInput: template.defaultInput
          };
          setSelectedAgent(null);
          setFormValues(nextValues);
          setRunInput(template.defaultInput);
        }}
      />

      <div className="content-grid">
        <AgentForm
          initialValues={formValues}
          onSubmit={async (values) => {
            await handleSave(values);
          }}
        />

        <div className="stack">
          <AgentList
            agents={agents}
            selectedAgentId={selectedAgent?.id ?? null}
            onSelect={(agent) => {
              setSelectedAgent(agent);
              setFormValues(toFormValues(agent));
              setRunInput(agent.defaultInput);
            }}
          />

          <section className="panel">
            <div className="section-heading">
              <p className="eyebrow">Run Agent</p>
              <h2>Execute Selected Definition</h2>
            </div>
            <textarea
              aria-label="Run Input"
              value={runInput}
              onChange={(event) => setRunInput(event.target.value)}
            />
            <button className="primary-button" type="button" onClick={() => void handleRun()} disabled={!selectedAgent || isPending}>
              Stream Run
            </button>
          </section>
        </div>
      </div>

      <RunConsole events={events} />
    </main>
  );
}

function toFormValues(agent: AgentDefinition): AgentFormValues {
  return {
    name: agent.name,
    description: agent.description,
    type: agent.type,
    goal: agent.goal,
    systemPrompt: agent.systemPrompt,
    enabledTools: agent.enabledTools,
    defaultInput: agent.defaultInput
  };
}
