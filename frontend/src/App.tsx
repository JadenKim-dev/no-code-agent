import { AgentSidebar } from './features/agents/AgentSidebar';
import { BuildTab } from './features/agents/BuildTab';
import { useAgentWorkspace } from './features/agents/useAgentWorkspace';
import { RunTab } from './features/run-console/RunTab';
import { cn } from './lib/utils';

export default function App() {
  const {
    templates,
    agents,
    selectedAgent,
    formValues,
    events,
    runInput,
    setRunInput,
    isPending,
    activeTab,
    setActiveTab,
    handleSelectTemplate,
    handleSelectAgent,
    handleNewAgent,
    handleSave,
    handleRun,
  } = useAgentWorkspace();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Left panel */}
      <AgentSidebar
        agents={agents}
        selectedAgentId={selectedAgent?.id ?? null}
        onSelect={handleSelectAgent}
        onNew={handleNewAgent}
      />

      {/* Right panel */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Tab bar */}
        <div className="flex items-center bg-white border-b border-slate-200 px-6 h-12 flex-shrink-0">
          <button
            role="tab"
            aria-selected={activeTab === 'build'}
            type="button"
            className={cn(
              'px-4 h-12 text-sm transition border-b-2',
              activeTab === 'build'
                ? 'border-slate-900 font-semibold text-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-600',
            )}
            onClick={() => setActiveTab('build')}
          >
            Build
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'run'}
            type="button"
            className={cn(
              'px-4 h-12 text-sm transition border-b-2',
              activeTab === 'run'
                ? 'border-slate-900 font-semibold text-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-600',
            )}
            onClick={() => setActiveTab('run')}
          >
            Run
          </button>
          <div className="ml-auto text-xs text-slate-400">
            {selectedAgent ? (
              <span>
                Editing: <strong className="text-slate-700">{selectedAgent.name}</strong>
              </span>
            ) : (
              <span>New agent</span>
            )}
          </div>
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'build' ? (
            <BuildTab
              templates={templates}
              formValues={formValues}
              onSelectTemplate={handleSelectTemplate}
              onSave={handleSave}
            />
          ) : (
            <RunTab
              selectedAgent={selectedAgent}
              runInput={runInput}
              onRunInputChange={setRunInput}
              events={events}
              isPending={isPending}
              onRun={() => void handleRun()}
            />
          )}
        </div>
      </div>
    </div>
  );
}
