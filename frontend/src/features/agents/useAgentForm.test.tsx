import { act, renderHook } from '@testing-library/react';
import { useAgentForm } from './useAgentForm';

const defaultValues = {
  name: '',
  description: '',
  type: 'custom',
  goal: '',
  systemPrompt: '',
  enabledTools: ['currentTime'],
  defaultInput: '',
};

it('initializes with provided values', () => {
  const { result } = renderHook(() => useAgentForm(defaultValues));

  expect(result.current.values).toEqual(defaultValues);
});

it('isValid is false when required fields are empty', () => {
  const { result } = renderHook(() => useAgentForm(defaultValues));

  expect(result.current.isValid).toBe(false);
});

it('isValid is true when all required fields are filled', () => {
  const { result } = renderHook(() =>
    useAgentForm({
      ...defaultValues,
      name: 'Agent',
      goal: 'Do things',
      systemPrompt: 'You are...',
    }),
  );

  expect(result.current.isValid).toBe(true);
});

it('hasFieldError returns true after markTouched on an empty required field, false before', () => {
  const { result } = renderHook(() => useAgentForm(defaultValues));

  expect(result.current.hasFieldError('name')).toBe(false);

  act(() => {
    result.current.markTouched('name');
  });

  expect(result.current.hasFieldError('name')).toBe(true);
});

it('hasFieldError returns false for a filled touched field', () => {
  const { result } = renderHook(() => useAgentForm(defaultValues));

  act(() => {
    result.current.setValues({ ...result.current.values, name: 'Agent' });
    result.current.markTouched('name');
  });

  expect(result.current.hasFieldError('name')).toBe(false);
});

it('markAllTouched marks all required fields as touched', () => {
  const { result } = renderHook(() => useAgentForm(defaultValues));

  act(() => {
    result.current.markAllTouched();
  });

  expect(result.current.hasFieldError('name')).toBe(true);
  expect(result.current.hasFieldError('goal')).toBe(true);
  expect(result.current.hasFieldError('systemPrompt')).toBe(true);
});

it('resets values and touched state when initialValues changes', () => {
  const { result, rerender } = renderHook(({ initial }) => useAgentForm(initial), {
    initialProps: { initial: defaultValues },
  });

  act(() => {
    result.current.markTouched('name');
  });

  rerender({ initial: { ...defaultValues, name: 'New Agent' } });

  expect(result.current.values.name).toBe('New Agent');
  expect(result.current.hasFieldError('name')).toBe(false);
});

it('setValues updates values independently', () => {
  const { result } = renderHook(() => useAgentForm(defaultValues));

  act(() => {
    result.current.setValues({ ...result.current.values, name: 'Updated' });
  });

  expect(result.current.values.name).toBe('Updated');
});

it('does not reset when initialValues reference changes but content is identical', () => {
  const { result, rerender } = renderHook(({ initial }) => useAgentForm(initial), {
    initialProps: { initial: defaultValues },
  });

  act(() => {
    result.current.markTouched('name');
  });

  rerender({ initial: { ...defaultValues } });

  expect(result.current.hasFieldError('name')).toBe(true);
});
