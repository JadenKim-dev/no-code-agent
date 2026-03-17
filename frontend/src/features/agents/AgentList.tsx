import type { AgentDefinition } from "./types";

type AgentListProps = {
  agents: AgentDefinition[];
  selectedAgentId: string | null;
  onSelect: (agent: AgentDefinition) => void;
};

export function AgentList({ agents, selectedAgentId, onSelect }: AgentListProps) {
  return (
    <section className="panel">
      <div className="section-heading">
        <p className="eyebrow">Saved Agents</p>
        <h2>Reusable Definitions</h2>
      </div>
      <div className="agent-list">
        {agents.map((agent) => (
          <button
            key={agent.id}
            type="button"
            className={selectedAgentId === agent.id ? "agent-card active" : "agent-card"}
            onClick={() => onSelect(agent)}
          >
            <strong>{agent.name}</strong>
            <span>{agent.goal}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
