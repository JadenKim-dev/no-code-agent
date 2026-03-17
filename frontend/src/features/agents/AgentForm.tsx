import { useEffect, useState } from "react";
import type { AgentFormValues } from "./types";

const TOOL_OPTIONS = [
  "currentTime",
  "listSchedules",
  "createSchedule",
  "createReminder"
] as const;

type AgentFormProps = {
  initialValues: AgentFormValues;
  onSubmit: (values: AgentFormValues) => void | Promise<void>;
};

export function AgentForm({ initialValues, onSubmit }: AgentFormProps) {
  const [values, setValues] = useState(initialValues);

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  return (
    <form
      className="panel agent-form"
      onSubmit={(event) => {
        event.preventDefault();
        void onSubmit(values);
      }}
    >
      <div className="section-heading">
        <p className="eyebrow">Agent Builder</p>
        <h2>Define The Runtime Contract</h2>
      </div>
      <label>
        Name
        <input
          aria-label="Name"
          value={values.name}
          onChange={(event) => setValues({ ...values, name: event.target.value })}
        />
      </label>
      <label>
        Description
        <textarea
          aria-label="Description"
          value={values.description}
          onChange={(event) => setValues({ ...values, description: event.target.value })}
        />
      </label>
      <label>
        Goal
        <textarea
          aria-label="Goal"
          value={values.goal}
          onChange={(event) => setValues({ ...values, goal: event.target.value })}
        />
      </label>
      <label>
        System Prompt
        <textarea
          aria-label="System Prompt"
          value={values.systemPrompt}
          onChange={(event) => setValues({ ...values, systemPrompt: event.target.value })}
        />
      </label>
      <label>
        Default Input
        <input
          aria-label="Default Input"
          value={values.defaultInput}
          onChange={(event) => setValues({ ...values, defaultInput: event.target.value })}
        />
      </label>
      <fieldset>
        <legend>Enabled Tools</legend>
        <div className="tool-grid">
          {TOOL_OPTIONS.map((tool) => (
            <label key={tool} className="tool-pill">
              <input
                checked={values.enabledTools.includes(tool)}
                type="checkbox"
                onChange={() =>
                  setValues((current) => ({
                    ...current,
                    enabledTools: current.enabledTools.includes(tool)
                      ? current.enabledTools.filter((item) => item !== tool)
                      : [...current.enabledTools, tool]
                  }))
                }
              />
              <span>{tool}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <button className="primary-button" type="submit">
        Save Agent
      </button>
    </form>
  );
}
