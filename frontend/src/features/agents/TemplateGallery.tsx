import { Blocks, Sparkles } from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import type { AgentTemplate } from "./types";

type TemplateGalleryProps = {
  templates: AgentTemplate[];
  onSelect: (template: AgentTemplate) => void;
};

export function TemplateGallery({ templates, onSelect }: TemplateGalleryProps) {
  return (
    <div className="grid gap-3">
      <Card
        className="cursor-pointer border-slate-200 bg-linear-to-br from-white to-slate-50 transition hover:border-slate-300"
        onClick={() => onSelect(blankTemplate)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Badge variant="accent">Custom Start</Badge>
            <Blocks className="h-4 w-4 text-slate-400" />
          </div>
          <CardTitle>Blank Custom Agent</CardTitle>
          <CardDescription>Start from a controlled blank slate and decide the runtime shape yourself.</CardDescription>
        </CardHeader>
      </Card>
      <div className="grid gap-3">
        {templates.map((template) => (
          <Card
            key={template.key}
            className="cursor-pointer border-sky-100 bg-linear-to-br from-sky-50/80 to-white transition hover:border-sky-200"
            onClick={() => onSelect(template)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Badge variant="accent">Template</Badge>
                <Sparkles className="h-4 w-4 text-sky-500" />
              </div>
              <CardTitle>{template.name}</CardTitle>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {template.enabledTools.map((tool) => (
                <Badge key={tool} variant="default">
                  {tool}
                </Badge>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

const blankTemplate: AgentTemplate = {
  key: "blank",
  name: "Blank Custom Agent",
  description: "Start from a blank agent definition.",
  type: "custom",
  goal: "",
  systemPrompt: "",
  enabledTools: ["currentTime"],
  defaultInput: ""
};
