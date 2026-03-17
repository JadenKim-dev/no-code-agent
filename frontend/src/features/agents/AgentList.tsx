import { Clock3 } from "lucide-react";
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
    <ScrollArea className="max-h-[320px]">
      <div className="grid gap-3 pr-1">
        {agents.map((agent) => (
          <button
            key={agent.id}
            type="button"
            className={cn(
              "rounded-2xl border px-4 py-3 text-left transition",
              selectedAgentId === agent.id
                ? "border-slate-900 bg-slate-950 text-white shadow-sm"
                : "border-slate-200 bg-white text-slate-900 hover:border-slate-300 hover:bg-slate-50"
            )}
            onClick={() => onSelect(agent)}
          >
            <div className="mb-2 flex items-center justify-between gap-3">
              <strong className="text-sm font-semibold">{agent.name}</strong>
              {selectedAgentId === agent.id ? <Badge className="border-white/20 bg-white/10 text-white" variant="default">Active</Badge> : null}
            </div>
            <p className={cn("line-clamp-2 text-sm leading-6", selectedAgentId === agent.id ? "text-slate-300" : "text-slate-500")}>
              {agent.goal}
            </p>
            <div className={cn("mt-3 flex items-center gap-2 text-xs", selectedAgentId === agent.id ? "text-slate-400" : "text-slate-400")}>
              <Clock3 className="h-3.5 w-3.5" />
              <span>{agent.type}</span>
            </div>
          </button>
        ))}
      </div>
    </ScrollArea>
  );
}
