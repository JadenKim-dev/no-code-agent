export type AgentDefinition = {
  id: string;
  name: string;
  description: string;
  type: string;
  goal: string;
  systemPrompt: string;
  enabledTools: string[];
  defaultInput: string;
  createdAt: string;
  updatedAt: string;
};

export type AgentTemplate = {
  key: string;
  name: string;
  description: string;
  type: string;
  goal: string;
  systemPrompt: string;
  enabledTools: string[];
  defaultInput: string;
};

export type AgentFormValues = {
  name: string;
  description: string;
  type: string;
  goal: string;
  systemPrompt: string;
  enabledTools: string[];
  defaultInput: string;
};
