import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AgentSidebar } from "./AgentSidebar";
import type { AgentDefinition } from "./types";

const agents: AgentDefinition[] = [
  {
    id: "1",
    name: "Scheduler",
    description: "Manages schedules",
    type: "custom",
    goal: "",
    systemPrompt: "",
    enabledTools: ["currentTime"],
    defaultInput: "",
    createdAt: "",
    updatedAt: ""
  },
  {
    id: "2",
    name: "Reminder Bot",
    description: "Sends reminders",
    type: "custom",
    goal: "",
    systemPrompt: "",
    enabledTools: [],
    defaultInput: "",
    createdAt: "",
    updatedAt: ""
  }
];

it("renders sidebar with data-testid", () => {
  render(<AgentSidebar agents={agents} selectedAgentId={null} onSelect={vi.fn()} onNew={vi.fn()} />);
  expect(screen.getByTestId("agent-sidebar")).toBeInTheDocument();
});

it("renders all agent names", () => {
  render(<AgentSidebar agents={agents} selectedAgentId={null} onSelect={vi.fn()} onNew={vi.fn()} />);
  expect(screen.getByText("Scheduler")).toBeInTheDocument();
  expect(screen.getByText("Reminder Bot")).toBeInTheDocument();
});

it("filters agents by search query", async () => {
  render(<AgentSidebar agents={agents} selectedAgentId={null} onSelect={vi.fn()} onNew={vi.fn()} />);
  await userEvent.type(screen.getByPlaceholderText(/Search agents/i), "Sched");
  expect(screen.getByText("Scheduler")).toBeInTheDocument();
  expect(screen.queryByText("Reminder Bot")).not.toBeInTheDocument();
});

it("shows empty message when no agents match search", async () => {
  render(<AgentSidebar agents={agents} selectedAgentId={null} onSelect={vi.fn()} onNew={vi.fn()} />);
  await userEvent.type(screen.getByPlaceholderText(/Search agents/i), "zzz");
  expect(screen.getByText("No results found")).toBeInTheDocument();
});

it("calls onNew when + New button is clicked", async () => {
  const onNew = vi.fn();
  render(<AgentSidebar agents={agents} selectedAgentId={null} onSelect={vi.fn()} onNew={onNew} />);
  await userEvent.click(screen.getByRole("button", { name: /\+ New/i }));
  expect(onNew).toHaveBeenCalledOnce();
});
