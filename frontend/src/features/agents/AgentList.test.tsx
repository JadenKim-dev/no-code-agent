import { render, screen } from "@testing-library/react";
import { AgentList } from "./AgentList";

const agent = {
  id: "1",
  name: "Planner",
  description: "",
  type: "custom",
  goal: "help users",
  systemPrompt: "",
  enabledTools: ["currentTime", "listSchedules"],
  defaultInput: "",
  createdAt: "",
  updatedAt: ""
};

it("renders saved agents", () => {
  render(<AgentList agents={[agent]} selectedAgentId={null} onSelect={() => {}} />);
  expect(screen.getByText("Planner")).toBeInTheDocument();
});

it("renders tool badges for each enabled tool", () => {
  render(<AgentList agents={[agent]} selectedAgentId={null} onSelect={() => {}} />);
  expect(screen.getByText("currentTime")).toBeInTheDocument();
  expect(screen.getByText("listSchedules")).toBeInTheDocument();
});
