import { parseSseEvent, streamAgentRun } from '../lib/api';

it('parses streamed execution events', async () => {
  const event = parseSseEvent(
    'event: message-token\ndata: {"type":"message-token","content":"Hello"}',
  );

  expect(event?.type).toBe('message-token');
  expect(event?.content).toBe('Hello');
});

it('returns null when event line is missing', () => {
  const event = parseSseEvent('data: {"type":"message-token","content":"Hello"}');
  expect(event).toBeNull();
});

it('returns null when data line is missing', () => {
  const event = parseSseEvent('event: message-token');
  expect(event).toBeNull();
});

it('returns null for empty string', () => {
  const event = parseSseEvent('');
  expect(event).toBeNull();
});

it('streamAgentRun calls onEvent for each SSE event in the stream', async () => {
  const chunk1 = 'event: message-token\ndata: {"type":"message-token","content":"Hi"}\n\n';
  const chunk2 = 'event: completed\ndata: {"type":"completed","content":""}\n\n';
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(chunk1 + chunk2));
      controller.close();
    },
  });

  vi.mocked(fetch).mockResolvedValueOnce(new Response(stream, { status: 200 }));

  const onEvent = vi.fn();
  await streamAgentRun('agent-1', 'hello', onEvent);

  expect(onEvent).toHaveBeenCalledTimes(2);
  expect(onEvent).toHaveBeenNthCalledWith(
    1,
    expect.objectContaining({ type: 'message-token', content: 'Hi' }),
  );
  expect(onEvent).toHaveBeenNthCalledWith(2, expect.objectContaining({ type: 'completed' }));
});

it('streamAgentRun does nothing when response has no body', async () => {
  vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 200 }));

  const onEvent = vi.fn();
  await streamAgentRun('agent-1', 'hello', onEvent);

  expect(onEvent).not.toHaveBeenCalled();
});
