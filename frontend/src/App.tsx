import { useEffect, useState, useTransition } from "react";
import { Activity, Bot, LayoutPanelLeft, PlayCircle, Sparkles } from "lucide-react";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Separator } from "./components/ui/separator";
import { Textarea } from "./components/ui/textarea";
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
    <main className="mx-auto min-h-screen max-w-[1600px] px-4 py-6 md:px-6 xl:px-8">
      <section className="mb-6 rounded-[28px] border border-slate-200 bg-white/85 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur md:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-4">
            <Badge variant="accent" className="w-fit">
              Spring AI Workspace
            </Badge>
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">Agent Operations Console</h1>
              <p className="max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
                Build a controlled agent definition, persist it, and observe tool-aware runtime behavior from a single operational workspace.
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <MetricCard icon={<Sparkles className="h-4 w-4" />} label="Templates" value={String(templates.length + 1)} />
            <MetricCard icon={<Bot className="h-4 w-4" />} label="Saved agents" value={String(agents.length)} />
            <MetricCard icon={<Activity className="h-4 w-4" />} label="Stream events" value={String(events.length)} />
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)_420px]">
        <section aria-label="Resource Rail" className="grid gap-6 self-start">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 text-slate-500">
                <LayoutPanelLeft className="h-4 w-4" />
                <Badge variant="default">Select</Badge>
              </div>
              <CardTitle>Resource Rail</CardTitle>
              <CardDescription>Choose a starting template or reopen a saved agent definition before editing.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="space-y-3">
                <div>
                  <h2 className="text-sm font-semibold text-slate-950">Templates</h2>
                  <p className="text-sm text-slate-500">Fast entry points for common tool and prompt combinations.</p>
                </div>
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
              </div>
              <Separator />
              <div className="space-y-3">
                <div>
                  <h2 className="text-sm font-semibold text-slate-950">Saved Agents</h2>
                  <p className="text-sm text-slate-500">Resume a previous configuration and move straight into execution.</p>
                </div>
                <AgentList
                  agents={agents}
                  selectedAgentId={selectedAgent?.id ?? null}
                  onSelect={(agent) => {
                    setSelectedAgent(agent);
                    setFormValues(toFormValues(agent));
                    setRunInput(agent.defaultInput);
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </section>

        <section aria-label="Builder Workspace" className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <Badge variant="accent">Builder</Badge>
            <span className="text-sm text-slate-500">
              {selectedAgent ? `Editing saved agent: ${selectedAgent.name}` : "Editing a draft definition"}
            </span>
          </div>
          <AgentForm
            initialValues={formValues}
            onSubmit={async (values) => {
              await handleSave(values);
            }}
          />
        </section>

        <section aria-label="Run Workspace" className="grid gap-6 self-start">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 text-slate-500">
                <PlayCircle className="h-4 w-4" />
                <Badge variant="warning">Runtime</Badge>
              </div>
              <CardTitle>Run Workspace</CardTitle>
              <CardDescription>
                Execute the selected definition and inspect the live event stream without leaving the current workspace.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-950">Active Definition</h2>
                    <p className="text-sm text-slate-500">
                      {selectedAgent ? selectedAgent.name : "Select or save an agent to enable streaming"}
                    </p>
                  </div>
                  <Badge variant={selectedAgent ? "success" : "default"}>{selectedAgent ? "Ready" : "Pending"}</Badge>
                </div>
              </div>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Run Input
                <Textarea
                  aria-label="Run Input"
                  className="min-h-[160px]"
                  value={runInput}
                  onChange={(event) => setRunInput(event.target.value)}
                />
              </label>
              <Button type="button" size="lg" onClick={() => void handleRun()} disabled={!selectedAgent || isPending}>
                <PlayCircle className="h-4 w-4" />
                Stream Run
              </Button>
            </CardContent>
          </Card>

          <RunConsole events={events} />
        </section>
      </div>
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

function MetricCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="mb-2 flex items-center gap-2 text-slate-500">
        {icon}
        <span className="text-xs font-medium uppercase tracking-[0.14em]">{label}</span>
      </div>
      <div className="text-2xl font-semibold tracking-tight text-slate-950">{value}</div>
    </div>
  );
}
