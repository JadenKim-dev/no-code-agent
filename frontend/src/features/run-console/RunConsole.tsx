import type { RunEvent } from "./types";

type RunConsoleProps = {
  events: RunEvent[];
};

export function RunConsole({ events }: RunConsoleProps) {
  return (
    <section className="panel">
      <div className="section-heading">
        <p className="eyebrow">Execution Stream</p>
        <h2>Observe Model And Tool Activity</h2>
      </div>
      <div className="console">
        {events.length === 0 ? <p>No run started.</p> : null}
        {events.map((event, index) => (
          <article key={`${event.type}-${index}`} className={`console-line ${event.type}`}>
            <span className="console-tag">{event.type}</span>
            <pre>{event.content}</pre>
          </article>
        ))}
      </div>
    </section>
  );
}
