import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AgentForm } from "./AgentForm";

it("submits agent definition fields", async () => {
  const onSubmit = vi.fn();
  render(
    <AgentForm
      initialValues={{
        name: "",
        description: "",
        type: "custom",
        goal: "",
        systemPrompt: "",
        enabledTools: ["currentTime"],
        defaultInput: ""
      }}
      onSubmit={onSubmit}
    />
  );

  await userEvent.type(screen.getByLabelText(/name/i), "Planner");
  await userEvent.click(screen.getByRole("button", { name: /save agent/i }));

  expect(onSubmit).toHaveBeenCalled();
});
