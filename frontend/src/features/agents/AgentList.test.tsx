import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

it("calls onSelect with the agent when clicked", async () => {
  const onSelect = vi.fn();
  render(<AgentList agents={[agent]} selectedAgentId={null} onSelect={onSelect} />);
  await userEvent.click(screen.getByRole("button", { name: /Planner/i }));
  expect(onSelect).toHaveBeenCalledWith(agent);
});

it("shows +N badge when agent has more than 2 tools", () => {
  const manyTools = { ...agent, enabledTools: ["currentTime", "listSchedules", "createSchedule"] };
  render(<AgentList agents={[manyTools]} selectedAgentId={null} onSelect={() => {}} />);
  expect(screen.getByText("+1")).toBeInTheDocument();
});

it("applies selected style when selectedAgentId matches", () => {
  render(<AgentList agents={[agent]} selectedAgentId="1" onSelect={() => {}} />);
  const button = screen.getByRole("button", { name: /Planner/i });
  expect(button.className).toMatch(/bg-slate-800/);
});
