import { useState } from "react";
import { AgentForm } from "./AgentForm";
import { TemplateAccordion } from "./TemplateAccordion";
import type { AgentFormValues, AgentTemplate } from "./types";

type BuildTabProps = {
  templates: AgentTemplate[];
  formValues: AgentFormValues;
  onSelectTemplate: (template: AgentTemplate) => void;
  onSave: (values: AgentFormValues) => Promise<void>;
};

export function BuildTab({ templates, formValues, onSelectTemplate, onSave }: BuildTabProps) {
  const [accordionOpen, setAccordionOpen] = useState(false);

  function handleSelectTemplate(template: AgentTemplate) {
    onSelectTemplate(template);
    setAccordionOpen(false);
  }

  return (
    <div className="flex flex-col gap-4 p-6">
      {templates.length > 0 ? (
        <TemplateAccordion
          templates={templates}
          onSelect={handleSelectTemplate}
          open={accordionOpen}
          onOpenChange={setAccordionOpen}
        />
      ) : null}
      <AgentForm initialValues={formValues} onSubmit={onSave} />
    </div>
  );
}
