import { useEffect, useState, useTransition } from 'react';
import type { AgentDefinition, AgentFormValues, AgentTemplate } from './types';
import type { RunEvent } from '../run-console/types';
import {
  createAgent,
  fetchAgents,
  fetchTemplates,
  streamAgentRun,
  updateAgent,
} from '../../lib/api';

type Tab = 'build' | 'run';

const blankFormValues: AgentFormValues = {
  name: '',
  description: '',
  type: 'custom',
  goal: '',
  systemPrompt: '',
  enabledTools: ['currentTime'],
  defaultInput: '',
};

function toFormValues(agent: AgentDefinition): AgentFormValues {
  return {
    name: agent.name,
    description: agent.description,
    type: agent.type,
    goal: agent.goal,
    systemPrompt: agent.systemPrompt,
    enabledTools: agent.enabledTools,
    defaultInput: agent.defaultInput,
  };
}

export function useAgentWorkspace() {
  const [templates, setTemplates] = useState<AgentTemplate[]>([]);
  const [agents, setAgents] = useState<AgentDefinition[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<AgentDefinition | null>(null);
  const [formValues, setFormValues] = useState<AgentFormValues>(blankFormValues);
  const [events, setEvents] = useState<RunEvent[]>([]);
  const [runInput, setRunInput] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('build');
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

  function handleSelectTemplate(template: AgentTemplate) {
    setSelectedAgent(null);
    setFormValues({
      name: template.name,
      description: template.description,
      type: template.type,
      goal: template.goal,
      systemPrompt: template.systemPrompt,
      enabledTools: template.enabledTools,
      defaultInput: template.defaultInput,
    });
    setRunInput(template.defaultInput);
    setActiveTab('build');
  }

  function handleSelectAgent(agent: AgentDefinition) {
    setSelectedAgent(agent);
    setFormValues(toFormValues(agent));
    setRunInput(agent.defaultInput);
    setActiveTab('build');
  }

  function handleNewAgent() {
    setSelectedAgent(null);
    setFormValues(blankFormValues);
    setActiveTab('build');
  }

  async function handleSave(values: AgentFormValues) {
    let saved: AgentDefinition;
    try {
      saved = selectedAgent
        ? await updateAgent(selectedAgent.id, values)
        : await createAgent(values);
    } catch {
      return;
    }

    startTransition(() => {
      setSelectedAgent(saved);
      setFormValues(toFormValues(saved));
      setRunInput(saved.defaultInput);
      setAgents((current) => [saved, ...current.filter((agent) => agent.id !== saved.id)]);
      setActiveTab('run');
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

  return {
    templates,
    agents,
    selectedAgent,
    formValues,
    events,
    runInput,
    setRunInput,
    isPending,
    activeTab,
    setActiveTab,
    handleSelectTemplate,
    handleSelectAgent,
    handleNewAgent,
    handleSave,
    handleRun,
  };
}
