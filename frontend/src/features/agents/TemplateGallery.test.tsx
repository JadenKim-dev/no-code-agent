import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TemplateGallery } from "./TemplateGallery";
import type { AgentTemplate } from "./types";

const schedulerTemplate: AgentTemplate = {
  key: "scheduler-template",
  name: "Scheduler & Reminder Assistant",
  description: "Helps users inspect schedules, create events, and register reminders.",
  type: "scheduler-template",
  goal: "Help users manage schedules and reminders accurately.",
  systemPrompt: "You are a scheduling assistant.",
  enabledTools: ["currentTime", "createSchedule", "createReminder", "listSchedules"],
  defaultInput: "What is on my schedule today?"
};

it("renders the blank custom agent option", () => {
  render(<TemplateGallery templates={[]} onSelect={vi.fn()} />);

  expect(screen.getByText(/blank custom agent/i)).toBeInTheDocument();
});

it("renders provided templates", () => {
  render(<TemplateGallery templates={[schedulerTemplate]} onSelect={vi.fn()} />);

  expect(screen.getByText("Scheduler & Reminder Assistant")).toBeInTheDocument();
  expect(screen.getByText(/currentTime/i)).toBeInTheDocument();
});

it("calls onSelect with blank template when Custom Start is clicked", async () => {
  const onSelect = vi.fn();
  render(<TemplateGallery templates={[]} onSelect={onSelect} />);

  await userEvent.click(screen.getByText(/blank custom agent/i));

  expect(onSelect).toHaveBeenCalledWith(
    expect.objectContaining({ key: "blank", type: "custom" })
  );
});

it("calls onSelect with the chosen template when a template card is clicked", async () => {
  const onSelect = vi.fn();
  render(<TemplateGallery templates={[schedulerTemplate]} onSelect={onSelect} />);

  await userEvent.click(screen.getByText("Scheduler & Reminder Assistant"));

  expect(onSelect).toHaveBeenCalledWith(
    expect.objectContaining({ key: "scheduler-template" })
  );
});

it("shows all enabled tools for a template", () => {
  render(<TemplateGallery templates={[schedulerTemplate]} onSelect={vi.fn()} />);

  expect(screen.getByText("listSchedules")).toBeInTheDocument();
  expect(screen.getByText("createReminder")).toBeInTheDocument();
});
