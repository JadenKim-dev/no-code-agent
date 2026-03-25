import { cn } from '../../lib/utils';
import type { AgentDefinition } from './types';

type AgentListProps = {
  agents: AgentDefinition[];
  selectedAgentId: string | null;
  onSelect: (agent: AgentDefinition) => void;
};

export function AgentList({ agents, selectedAgentId, onSelect }: AgentListProps) {
  return (
    <div className="grid gap-2">
      {agents.map((agent) => (
        <button
          key={agent.id}
          type="button"
          className={cn(
            'w-full overflow-hidden rounded-xl border px-3 py-2.5 text-left transition',
            selectedAgentId === agent.id
              ? 'border-slate-700 bg-slate-800 text-white'
              : 'border-slate-800 bg-transparent text-slate-300 hover:border-slate-700 hover:bg-slate-900',
          )}
          onClick={() => onSelect(agent)}
        >
          <strong className="mb-1 block text-sm font-semibold truncate">{agent.name}</strong>
          {(agent.enabledTools ?? []).length > 0 ? (
            <div className="flex items-center gap-1 overflow-hidden">
              {(agent.enabledTools ?? []).slice(0, 2).map((tool) => (
                <span
                  key={tool}
                  className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium bg-slate-900 text-slate-400 border border-slate-700 truncate max-w-[80px]"
                >
                  {tool}
                </span>
              ))}
              {(agent.enabledTools ?? []).length > 2 ? (
                <span className="shrink-0 text-[10px] text-slate-500">
                  +{(agent.enabledTools ?? []).length - 2}
                </span>
              ) : null}
            </div>
          ) : null}
        </button>
      ))}
    </div>
  );
}
