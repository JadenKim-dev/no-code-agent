import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { Badge } from "../../components/ui/badge";
import type { AgentTemplate } from "./types";

type TemplateAccordionProps = {
  templates: AgentTemplate[];
  onSelect: (template: AgentTemplate) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function TemplateAccordion({ templates, onSelect, open: controlledOpen, onOpenChange }: TemplateAccordionProps) {
  const open = controlledOpen ?? false;

  function toggle() {
    if (onOpenChange) onOpenChange(!open);
  }

  function handleSelect(template: AgentTemplate) {
    onSelect(template);
    if (onOpenChange) onOpenChange(false);
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <button
        type="button"
        aria-label="템플릿으로 시작하기"
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50 transition"
        onClick={toggle}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-sky-500" />
          <span className="text-sm font-semibold text-slate-900">템플릿으로 시작하기</span>
          <span className="text-xs text-slate-400">— {templates.length}개</span>
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 text-slate-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-slate-400" />
        )}
      </button>

      {open ? (
        <div className="border-t border-slate-100 p-3 grid gap-2">
          {templates.map((template) => (
            <button
              key={template.key}
              type="button"
              className="rounded-lg border border-sky-100 bg-sky-50/80 px-3 py-2.5 text-left hover:border-sky-200 transition"
              onClick={() => handleSelect(template)}
            >
              <div className="text-sm font-semibold text-slate-900 mb-1">{template.name}</div>
              <div className="text-xs text-slate-500 mb-2 line-clamp-2">{template.description}</div>
              <div className="flex flex-wrap gap-1">
                {template.enabledTools.map((tool) => (
                  <Badge key={tool} variant="default" className="text-[10px] px-1.5 py-0">
                    {tool}
                  </Badge>
                ))}
              </div>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
