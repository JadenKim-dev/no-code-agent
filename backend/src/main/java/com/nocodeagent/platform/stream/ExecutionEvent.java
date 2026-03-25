package com.nocodeagent.platform.stream;

import java.time.Instant;

public record ExecutionEvent(String type, String content, Instant timestamp) {

  public static ExecutionEvent messageToken(String content) {
    return new ExecutionEvent("message-token", content, Instant.now());
  }

  public static ExecutionEvent toolCallStart(String toolName, String input) {
    return new ExecutionEvent("tool-call-start", toolName + "::" + input, Instant.now());
  }

  public static ExecutionEvent toolCallResult(String toolName, String result) {
    return new ExecutionEvent("tool-call-result", toolName + "::" + result, Instant.now());
  }

  public static ExecutionEvent completed(String content) {
    return new ExecutionEvent("completed", content, Instant.now());
  }

  public static ExecutionEvent error(String content) {
    return new ExecutionEvent("error", content, Instant.now());
  }
}
