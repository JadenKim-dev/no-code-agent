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
