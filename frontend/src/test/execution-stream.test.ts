import { parseSseEvent } from "../lib/api";

it("parses streamed execution events", async () => {
  const event = parseSseEvent(
    'event: message-token\ndata: {"type":"message-token","content":"Hello"}'
  );

  expect(event?.type).toBe("message-token");
  expect(event?.content).toBe("Hello");
});
