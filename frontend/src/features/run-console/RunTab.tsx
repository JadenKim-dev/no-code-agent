import { PlayCircle } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import { RunConsole } from "./RunConsole";
import type { RunEvent } from "./types";
import type { AgentDefinition } from "../agents/types";

type RunTabProps = {
  selectedAgent: AgentDefinition | null;
  runInput: string;
  onRunInputChange: (value: string) => void;
  events: RunEvent[];
  isPending: boolean;
  onRun: () => void;
};

export function RunTab({ selectedAgent, runInput, onRunInputChange, events, isPending, onRun }: RunTabProps) {
  return (
    <div className="flex flex-col gap-4 p-6 h-full">
      {/* Input section */}
      <div className="flex-shrink-0 rounded-xl border border-slate-200 bg-white p-4">
        {!selectedAgent ? (
          <p className="mb-3 text-xs text-slate-400">
            에이전트를 선택하거나 저장하면 실행할 수 있습니다
          </p>
        ) : null}
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Run Input
          <Textarea
            aria-label="Run Input"
            className="min-h-[100px]"
            value={runInput}
            onChange={(e) => onRunInputChange(e.target.value)}
          />
        </label>
        <div className="mt-3 flex justify-end">
          <Button
            type="button"
            size="lg"
            onClick={onRun}
            disabled={!selectedAgent || isPending}
          >
            <PlayCircle className="h-4 w-4" />
            Stream Run
          </Button>
        </div>
      </div>

      {/* Stream section */}
      <div className="flex-1 min-h-0">
        <RunConsole events={events} />
      </div>
    </div>
  );
}
