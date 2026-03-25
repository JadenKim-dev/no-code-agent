import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AgentForm } from './AgentForm';

const defaultValues = {
  name: '',
  description: '',
  type: 'custom',
  goal: '',
  systemPrompt: '',
  enabledTools: ['currentTime'],
  defaultInput: '',
};

it('does not call onSubmit when name is empty', async () => {
  const onSubmit = vi.fn();
  render(<AgentForm initialValues={defaultValues} onSubmit={onSubmit} />);

  await userEvent.click(screen.getByRole('button', { name: /save agent/i }));

  expect(onSubmit).not.toHaveBeenCalled();
});

it('calls onSubmit when all required fields are filled', async () => {
  const onSubmit = vi.fn();
  render(
    <AgentForm
      initialValues={{
        ...defaultValues,
        name: 'My Agent',
        goal: 'Do things',
        systemPrompt: 'You are...',
      }}
      onSubmit={onSubmit}
    />,
  );

  await userEvent.click(screen.getByRole('button', { name: /save agent/i }));

  expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ name: 'My Agent' }));
});

it('reflects initial values in form fields', () => {
  render(
    <AgentForm
      initialValues={{ ...defaultValues, name: 'Prefilled Agent', goal: 'Do things' }}
      onSubmit={vi.fn()}
    />,
  );

  expect(screen.getByLabelText(/name/i)).toHaveValue('Prefilled Agent');
  expect(screen.getByLabelText(/goal/i)).toHaveValue('Do things');
});

it('toggles tool checkbox and includes updated selection in onSubmit', async () => {
  const onSubmit = vi.fn();
  render(
    <AgentForm
      initialValues={{
        ...defaultValues,
        name: 'Agent',
        goal: 'Do things',
        systemPrompt: 'You are...',
        enabledTools: [],
      }}
      onSubmit={onSubmit}
    />,
  );

  await userEvent.click(screen.getByRole('checkbox', { name: /currentTime/i }));
  await userEvent.click(screen.getByRole('button', { name: /save agent/i }));

  expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ enabledTools: ['currentTime'] }));
});

it('does not call onSubmit when goal is empty', async () => {
  const onSubmit = vi.fn();
  render(
    <AgentForm
      initialValues={{ ...defaultValues, name: 'Agent', systemPrompt: 'You are...' }}
      onSubmit={onSubmit}
    />,
  );
  await userEvent.click(screen.getByRole('button', { name: /save agent/i }));
  expect(onSubmit).not.toHaveBeenCalled();
});

it('does not call onSubmit when systemPrompt is empty', async () => {
  const onSubmit = vi.fn();
  render(
    <AgentForm
      initialValues={{ ...defaultValues, name: 'Agent', goal: 'Do things' }}
      onSubmit={onSubmit}
    />,
  );
  await userEvent.click(screen.getByRole('button', { name: /save agent/i }));
  expect(onSubmit).not.toHaveBeenCalled();
});

it('shows required field error message after field is touched and left empty', async () => {
  render(<AgentForm initialValues={defaultValues} onSubmit={vi.fn()} />);
  // blur name 필드 — touched 상태가 되면서 에러 메시지 노출
  await userEvent.click(screen.getByLabelText(/name/i));
  await userEvent.tab();
  expect(screen.getByText('This field is required.')).toBeInTheDocument();
});
