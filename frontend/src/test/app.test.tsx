import { render, screen } from "@testing-library/react";
import App from "../App";

it("renders the app shell", () => {
  render(<App />);
  expect(screen.getByRole("heading", { name: /agent operations console/i })).toBeInTheDocument();
  expect(screen.getByRole("region", { name: /resource rail/i })).toBeInTheDocument();
  expect(screen.getByRole("region", { name: /builder workspace/i })).toBeInTheDocument();
  expect(screen.getByRole("region", { name: /run workspace/i })).toBeInTheDocument();
});
