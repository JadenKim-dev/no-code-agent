import { render, screen } from "@testing-library/react";
import App from "../App";

it("renders the app shell with sidebar and tabs", () => {
  render(<App />);
  expect(screen.getByTestId("agent-sidebar")).toBeInTheDocument();
  expect(screen.getByRole("tab", { name: /build/i })).toBeInTheDocument();
  expect(screen.getByRole("tab", { name: /run/i })).toBeInTheDocument();
});
