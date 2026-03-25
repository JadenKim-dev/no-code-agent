package com.nocodeagent.platform;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(
    properties = {
      "spring.ai.openai.api-key=test-key",
      "spring.datasource.url=jdbc:sqlite::memory:"
    })
class ApplicationContextTest {

  @Test
  void contextLoads() {}
}
