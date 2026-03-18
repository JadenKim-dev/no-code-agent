package com.nocodeagent.platform.stream;

import com.nocodeagent.platform.agent.AgentExecutionService;
import com.nocodeagent.platform.agent.AgentRunRequest;
import jakarta.validation.Valid;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/agents")
@RequiredArgsConstructor
public class ExecutionStreamController {

    private final AgentExecutionService executionService;

    @PostMapping(path = "/{id}/runs/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter run(@PathVariable String id, @Valid @RequestBody AgentRunRequest request) {
        SseEmitter emitter = new SseEmitter(0L);
        executionService.run(id, request.input())
            .doOnComplete(emitter::complete)
            .subscribe(event -> send(emitter, event), emitter::completeWithError);
        return emitter;
    }

    private void send(SseEmitter emitter, ExecutionEvent event) {
        try {
            emitter.send(SseEmitter.event().name(event.type()).data(event));
        }
        catch (IOException exception) {
            emitter.completeWithError(exception);
        }
    }
}
