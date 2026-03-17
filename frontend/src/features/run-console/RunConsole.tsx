import { Badge } from "../../components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { ScrollArea } from "../../components/ui/scroll-area";
import type { RunEvent } from "./types";

type RunConsoleProps = {
  events: RunEvent[];
};

export function RunConsole({ events }: RunConsoleProps) {
  return (
    <Card className="border-slate-900 bg-slate-950 text-slate-50">
      <CardHeader>
        <CardTitle className="text-slate-50">Execution Stream</CardTitle>
        <CardDescription className="text-slate-400">
          Inspect model tokens and tool lifecycle events as they arrive from the runtime.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-[460px] min-h-[280px] pr-2">
          <div className="grid gap-3">
            {events.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/60 p-5 text-sm text-slate-400">
                No run started. Select a saved agent, enter a prompt, and stream the execution timeline here.
              </div>
            ) : null}
            {events.map((event, index) => (
              <article key={`${event.type}-${index}`} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <Badge variant={badgeVariant(event.type)}>{event.type}</Badge>
                  {event.timestamp ? <span className="text-xs text-slate-500">{formatTimestamp(event.timestamp)}</span> : null}
                </div>
                <pre className="whitespace-pre-wrap break-words font-mono text-sm leading-6 text-slate-100">{event.content}</pre>
              </article>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function badgeVariant(type: string): "accent" | "success" | "warning" | "danger" | "default" {
  if (type === "message-token") return "accent";
  if (type === "completed") return "success";
  if (type === "tool-call-start") return "warning";
  if (type === "error") return "danger";
  return "default";
}

function formatTimestamp(value: string) {
  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}
