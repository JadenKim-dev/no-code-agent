import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

it('renders the app shell with sidebar and tabs', () => {
  render(<App />);
  expect(screen.getByTestId('agent-sidebar')).toBeInTheDocument();
  expect(screen.getByRole('tab', { name: /build/i })).toBeInTheDocument();
  expect(screen.getByRole('tab', { name: /run/i })).toBeInTheDocument();
});

it('shows Build tab content by default', () => {
  render(<App />);
  expect(screen.getByRole('tab', { name: /build/i })).toHaveAttribute('aria-selected', 'true');
  expect(screen.getByRole('tab', { name: /run/i })).toHaveAttribute('aria-selected', 'false');
});

it('switches to Run tab when clicked', async () => {
  render(<App />);
  await userEvent.click(screen.getByRole('tab', { name: /run/i }));
  expect(screen.getByRole('tab', { name: /run/i })).toHaveAttribute('aria-selected', 'true');
  expect(screen.getByRole('tab', { name: /build/i })).toHaveAttribute('aria-selected', 'false');
});

it("shows 'New agent' label when no agent is selected", () => {
  render(<App />);
  expect(screen.getByText('New agent')).toBeInTheDocument();
});
