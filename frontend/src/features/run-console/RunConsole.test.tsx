import { render, screen } from "@testing-library/react";
import { RunConsole } from "./RunConsole";

it("renders tool and token events", () => {
  render(
    <RunConsole
      events={[
        { type: "tool-call-start", content: "currentTime" },
        { type: "message-token", content: "Hello" }
      ]}
    />
  );

  expect(screen.getByText(/currentTime/i)).toBeInTheDocument();
  expect(screen.getByText(/Hello/i)).toBeInTheDocument();
});

it("shows empty state message when events array is empty", () => {
  render(<RunConsole events={[]} />);
  expect(screen.getByText(/No run started/i)).toBeInTheDocument();
});

it("renders formatted timestamp when event has timestamp field", () => {
  render(
    <RunConsole
      events={[{ type: "message-token", content: "Hi", timestamp: "2024-01-01T12:34:56Z" }]}
    />
  );
  // formatTimestamp renders HH:MM:SS — just verify something time-like appears
  expect(screen.getByText(/\d{2}:\d{2}:\d{2}/)).toBeInTheDocument();
});

it("renders badge for each event type variant", () => {
  render(
    <RunConsole
      events={[
        { type: "message-token", content: "a" },
        { type: "completed", content: "b" },
        { type: "tool-call-start", content: "c" },
        { type: "error", content: "d" },
        { type: "unknown-type", content: "e" }
      ]}
    />
  );

  expect(screen.getByText("message-token")).toBeInTheDocument();
  expect(screen.getByText("completed")).toBeInTheDocument();
  expect(screen.getByText("tool-call-start")).toBeInTheDocument();
  expect(screen.getByText("error")).toBeInTheDocument();
  expect(screen.getByText("unknown-type")).toBeInTheDocument();
});
