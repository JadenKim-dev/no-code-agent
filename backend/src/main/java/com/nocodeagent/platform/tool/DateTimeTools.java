package com.nocodeagent.platform.tool;

import java.time.OffsetDateTime;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.stereotype.Component;

@Component
public class DateTimeTools {

  @Tool(description = "Get the current date and time in ISO-8601 format")
  public String currentTime() {
    return OffsetDateTime.now().toString();
  }
}
