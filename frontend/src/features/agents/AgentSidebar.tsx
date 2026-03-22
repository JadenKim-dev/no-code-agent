import { useState } from "react";
import { AgentList } from "./AgentList";
import type { AgentDefinition } from "./types";

type AgentSidebarProps = {
  agents: AgentDefinition[];
  selectedAgentId: string | null;
  onSelect: (agent: AgentDefinition) => void;
  onNew: () => void;
};

export function AgentSidebar({ agents, selectedAgentId, onSelect, onNew }: AgentSidebarProps) {
  const [query, setQuery] = useState("");

  const filteredAgents = query.trim()
    ? agents.filter((agent) => agent.name.toLowerCase().includes(query.toLowerCase()))
    : agents;

  return (
    <aside
      data-testid="agent-sidebar"
      className="w-[240px] flex-shrink-0 bg-slate-950 flex flex-col h-screen sticky top-0"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-5 pb-3">
        <div>
          <div className="text-sm font-semibold text-slate-100">No-Code Agent</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Spring AI Platform</div>
        </div>
        <button
          type="button"
          className="rounded-md bg-blue-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-blue-500 transition"
          onClick={onNew}
        >
          + New
        </button>
      </div>

      {/* Search */}
      <div className="px-3 pb-3">
        <input
          type="text"
          placeholder="에이전트 검색..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-1.5 text-xs text-slate-300 placeholder:text-slate-500 focus:outline-none focus:border-slate-600"
        />
      </div>

      {/* Agent list label */}
      <div className="px-4 pb-2">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
          Saved Agents
        </span>
      </div>

      {/* Agent list */}
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {filteredAgents.length === 0 ? (
          <p className="px-2 py-3 text-xs text-slate-600">
            {query ? "검색 결과 없음" : "저장된 에이전트 없음"}
          </p>
        ) : (
          <AgentList
            agents={filteredAgents}
            selectedAgentId={selectedAgentId}
            onSelect={onSelect}
          />
        )}
      </div>
    </aside>
  );
}
