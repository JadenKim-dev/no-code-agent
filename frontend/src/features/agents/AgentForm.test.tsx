import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AgentForm } from "./AgentForm";

it("submits agent definition fields", async () => {
  const onSubmit = vi.fn();
  render(
    <AgentForm
      initialValues={{
        name: "Planner",
        description: "",
        type: "custom",
        goal: "Plan things",
        systemPrompt: "You are a planner.",
        enabledTools: ["currentTime"],
        defaultInput: ""
      }}
      onSubmit={onSubmit}
    />
  );

  await userEvent.click(screen.getByRole("button", { name: /save agent/i }));

  expect(onSubmit).toHaveBeenCalledWith(
    expect.objectContaining({
      name: "Planner",
      goal: "Plan things",
      systemPrompt: "You are a planner.",
      enabledTools: ["currentTime"]
    })
  );
});
