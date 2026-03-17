import { render, screen } from "@testing-library/react";
import { AgentList } from "./AgentList";

it("renders saved agents", () => {
  render(
    <AgentList
      agents={[
        {
          id: "1",
          name: "Planner",
          description: "",
          type: "custom",
          goal: "help users",
          systemPrompt: "",
          enabledTools: ["currentTime"],
          defaultInput: "",
          createdAt: "",
          updatedAt: ""
        }
      ]}
      selectedAgentId={null}
      onSelect={() => {}}
    />
  );

  expect(screen.getByText("Planner")).toBeInTheDocument();
});
