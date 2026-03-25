import '@testing-library/jest-dom/vitest';

globalThis.fetch = vi.fn(async (input: RequestInfo | URL) => {
  const url = String(input);

  if (url.includes('/api/templates')) {
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (url.includes('/api/agents') && !url.includes('/runs/stream')) {
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({}), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}) as typeof fetch;
