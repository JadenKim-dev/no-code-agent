import { Badge } from "../../components/ui/badge";
import { ScrollArea } from "../../components/ui/scroll-area";
import { cn } from "../../lib/utils";
import type { AgentDefinition } from "./types";

type AgentListProps = {
  agents: AgentDefinition[];
  selectedAgentId: string | null;
  onSelect: (agent: AgentDefinition) => void;
};

export function AgentList({ agents, selectedAgentId, onSelect }: AgentListProps) {
  return (
    <ScrollArea className="max-h-[calc(100vh-200px)]">
      <div className="grid gap-2 pr-1">
        {agents.map((agent) => (
          <button
            key={agent.id}
            type="button"
            className={cn(
              "rounded-xl border px-3 py-2.5 text-left transition",
              selectedAgentId === agent.id
                ? "border-slate-700 bg-slate-800 text-white"
                : "border-slate-800 bg-transparent text-slate-300 hover:border-slate-700 hover:bg-slate-900"
            )}
            onClick={() => onSelect(agent)}
          >
            <div className="mb-1 flex items-center justify-between gap-2">
              <strong className="text-sm font-semibold truncate">{agent.name}</strong>
              {selectedAgentId === agent.id ? (
                <Badge className="border-white/20 bg-white/10 text-white shrink-0" variant="default">
                  Active
                </Badge>
              ) : null}
            </div>
            {agent.description ? (
              <p className={cn("line-clamp-2 text-xs leading-5 mb-2", selectedAgentId === agent.id ? "text-slate-300" : "text-slate-500")}>
                {agent.description}
              </p>
            ) : null}
            {agent.enabledTools.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {agent.enabledTools.slice(0, 3).map((tool) => (
                  <span
                    key={tool}
                    className="inline-block rounded px-1.5 py-0.5 text-[10px] font-medium bg-slate-900 text-slate-400 border border-slate-700"
                  >
                    {tool}
                  </span>
                ))}
                {agent.enabledTools.length > 3 ? (
                  <span className="inline-block rounded px-1.5 py-0.5 text-[10px] text-slate-500">
                    +{agent.enabledTools.length - 3}
                  </span>
                ) : null}
              </div>
            ) : null}
          </button>
        ))}
      </div>
    </ScrollArea>
  );
}
