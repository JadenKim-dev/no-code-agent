package com.nocodeagent.platform;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = "spring.ai.openai.api-key=test-key")
class ApplicationContextTest {

    @Test
    void contextLoads() {
    }
}
