import type { AgentTemplate } from "./types";

type TemplateGalleryProps = {
  templates: AgentTemplate[];
  onSelect: (template: AgentTemplate) => void;
};

export function TemplateGallery({ templates, onSelect }: TemplateGalleryProps) {
  return (
    <section className="panel">
      <div className="section-heading">
        <p className="eyebrow">Templates</p>
        <h2>Start From A Known Flow</h2>
      </div>
      <div className="template-grid">
        <button className="template-card" type="button" onClick={() => onSelect(blankTemplate)}>
          <strong>Blank Custom Agent</strong>
          <span>Start with a generic agent and choose your own tools.</span>
        </button>
        {templates.map((template) => (
          <button key={template.key} className="template-card" type="button" onClick={() => onSelect(template)}>
            <strong>{template.name}</strong>
            <span>{template.description}</span>
          </button>
        ))}
      </div>
    </section>
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
