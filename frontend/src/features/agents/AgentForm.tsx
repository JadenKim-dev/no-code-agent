import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Separator } from '../../components/ui/separator';
import { Textarea } from '../../components/ui/textarea';
import { cn } from '../../lib/utils';
import type { AgentFormValues } from './types';
import { useAgentForm } from './useAgentForm';

const TOOL_OPTIONS = [
  { id: 'currentTime', description: 'Expose current date and time for time-sensitive prompts.' },
  {
    id: 'listSchedules',
    description: 'Read persisted schedule entries and summarize the current plan.',
  },
  {
    id: 'createSchedule',
    description: 'Write a schedule entry to local storage for follow-up actions.',
  },
  {
    id: 'createReminder',
    description: 'Register reminders that the agent can confirm back to the user.',
  },
] as const;

type AgentFormProps = {
  initialValues: AgentFormValues;
  onSubmit: (values: AgentFormValues) => void | Promise<void>;
};

export function AgentForm({ initialValues, onSubmit }: AgentFormProps) {
  const { values, setValues, isValid, markTouched, markAllTouched, hasFieldError } =
    useAgentForm(initialValues);

  return (
    <form
      className="grid gap-5"
      onSubmit={(event) => {
        event.preventDefault();
        if (!isValid) {
          markAllTouched();
          return;
        }
        void onSubmit(values);
      }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <Badge variant="accent">Builder</Badge>
              <CardTitle className="mt-3">Builder Workspace</CardTitle>
              <CardDescription>
                Define the runtime contract, behavior, and tool boundary for the selected agent.
              </CardDescription>
            </div>
            <Button className="self-start" type="submit" disabled={!isValid}>
              Save Agent
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-5">
          <section className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              <span>
                Name <span className="text-red-500">*</span>
              </span>
              <Input
                aria-label="Name"
                placeholder="Customer Ops Assistant"
                value={values.name}
                onChange={(event) => setValues({ ...values, name: event.target.value })}
                onBlur={() => markTouched('name')}
                className={
                  hasFieldError('name') ? 'border-red-400 focus-visible:ring-red-400/40' : ''
                }
              />
              {hasFieldError('name') && (
                <span className="text-xs text-red-500">This field is required.</span>
              )}
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Default Input
              <Input
                aria-label="Default Input"
                placeholder="What time is it?"
                value={values.defaultInput}
                onChange={(event) => setValues({ ...values, defaultInput: event.target.value })}
              />
            </label>
          </section>

          <Separator />

          <section className="grid gap-2">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-slate-950">Purpose</h3>
              <p className="text-sm text-slate-500">
                Capture what the agent is for and what it should optimize for.
              </p>
            </div>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Description
              <Textarea
                aria-label="Description"
                className="min-h-[96px]"
                value={values.description}
                onChange={(event) => setValues({ ...values, description: event.target.value })}
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              <span>
                Goal <span className="text-red-500">*</span>
              </span>
              <Textarea
                aria-label="Goal"
                className={cn(
                  'min-h-[120px]',
                  hasFieldError('goal') && 'border-red-400 focus-visible:ring-red-400/40',
                )}
                value={values.goal}
                onChange={(event) => setValues({ ...values, goal: event.target.value })}
                onBlur={() => markTouched('goal')}
              />
              {hasFieldError('goal') && (
                <span className="text-xs text-red-500">This field is required.</span>
              )}
            </label>
          </section>

          <Separator />

          <section className="grid gap-2">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-slate-950">System Prompt</h3>
              <p className="text-sm text-slate-500">
                This instruction set frames how the agent reasons and when it should use tools.
              </p>
            </div>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              <span>
                System Prompt <span className="text-red-500">*</span>
              </span>
              <Textarea
                aria-label="System Prompt"
                className={cn(
                  'min-h-[200px]',
                  hasFieldError('systemPrompt') && 'border-red-400 focus-visible:ring-red-400/40',
                )}
                value={values.systemPrompt}
                onChange={(event) => setValues({ ...values, systemPrompt: event.target.value })}
                onBlur={() => markTouched('systemPrompt')}
              />
              {hasFieldError('systemPrompt') && (
                <span className="text-xs text-red-500">This field is required.</span>
              )}
            </label>
          </section>

          <Separator />

          <fieldset className="grid gap-3">
            <legend className="text-sm font-semibold text-slate-950">Enabled Tools</legend>
            <p className="text-sm text-slate-500">
              Allow only the functions this agent should be able to execute at runtime.
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              {TOOL_OPTIONS.map((tool) => (
                <label
                  key={tool.id}
                  className={cn(
                    'flex cursor-pointer items-start gap-3 rounded-2xl border p-3 transition',
                    values.enabledTools.includes(tool.id)
                      ? 'border-sky-200 bg-sky-50'
                      : 'border-slate-200 bg-white hover:border-slate-300',
                  )}
                >
                  <input
                    checked={values.enabledTools.includes(tool.id)}
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-sky-600"
                    onChange={() =>
                      setValues((current) => ({
                        ...current,
                        enabledTools: current.enabledTools.includes(tool.id)
                          ? current.enabledTools.filter((item) => item !== tool.id)
                          : [...current.enabledTools, tool.id],
                      }))
                    }
                  />
                  <div className="grid gap-1">
                    <span className="text-sm font-medium text-slate-900">{tool.id}</span>
                    <span className="text-xs leading-5 text-slate-500">{tool.description}</span>
                  </div>
                </label>
              ))}
            </div>
          </fieldset>
        </CardContent>
      </Card>
    </form>
  );
}
