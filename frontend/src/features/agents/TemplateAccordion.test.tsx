import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TemplateAccordion } from "./TemplateAccordion";
import type { AgentTemplate } from "./types";

const schedulerTemplate: AgentTemplate = {
  key: "scheduler-template",
  name: "Scheduler & Reminder Assistant",
  description: "Helps users inspect schedules.",
  type: "scheduler-template",
  goal: "Help users manage schedules.",
  systemPrompt: "You are a scheduling assistant.",
  enabledTools: ["currentTime", "listSchedules"],
  defaultInput: "What is on my schedule today?"
};

it("renders collapsed when open=false — template names not visible", () => {
  render(
    <TemplateAccordion
      templates={[schedulerTemplate]}
      onSelect={vi.fn()}
      open={false}
      onOpenChange={vi.fn()}
    />
  );
  expect(screen.queryByText("Scheduler & Reminder Assistant")).not.toBeInTheDocument();
});

it("renders expanded when open=true — template names visible", () => {
  render(
    <TemplateAccordion
      templates={[schedulerTemplate]}
      onSelect={vi.fn()}
      open={true}
      onOpenChange={vi.fn()}
    />
  );
  expect(screen.getByText("Scheduler & Reminder Assistant")).toBeInTheDocument();
});

it("calls onOpenChange(true) when header is clicked while closed", async () => {
  const onOpenChange = vi.fn();
  render(
    <TemplateAccordion
      templates={[schedulerTemplate]}
      onSelect={vi.fn()}
      open={false}
      onOpenChange={onOpenChange}
    />
  );
  await userEvent.click(screen.getByRole("button", { name: /Start from a template/i }));
  expect(onOpenChange).toHaveBeenCalledWith(true);
});

it("calls onSelect and onOpenChange(false) when a template is clicked", async () => {
  const onSelect = vi.fn();
  const onOpenChange = vi.fn();
  render(
    <TemplateAccordion
      templates={[schedulerTemplate]}
      onSelect={onSelect}
      open={true}
      onOpenChange={onOpenChange}
    />
  );
  await userEvent.click(screen.getByText("Scheduler & Reminder Assistant"));
  expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ key: "scheduler-template" }));
  expect(onOpenChange).toHaveBeenCalledWith(false);
});

it("shows tool badges when expanded", () => {
  render(
    <TemplateAccordion
      templates={[schedulerTemplate]}
      onSelect={vi.fn()}
      open={true}
      onOpenChange={vi.fn()}
    />
  );
  expect(screen.getByText("currentTime")).toBeInTheDocument();
  expect(screen.getByText("listSchedules")).toBeInTheDocument();
});
