package com.taskforge.controller;

import com.taskforge.dto.JobExecutionResponse;
import com.taskforge.enums.ExecutionStatus;
import com.taskforge.service.ExecutionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/executions")
@RequiredArgsConstructor
@Tag(name = "Execution History", description = "Endpoints for inspecting execution logs and retrying failed jobs")
@CrossOrigin(origins = "*")
public class ExecutionController {

    private final ExecutionService executionService;

    @GetMapping
    @Operation(summary = "List execution history with status and worker filters")
    public Page<JobExecutionResponse> getExecutions(
            @RequestParam(required = false) String jobId,
            @RequestParam(required = false) ExecutionStatus status,
            @RequestParam(required = false) String workerId,
            @PageableDefault(size = 20) Pageable pageable) {
        return executionService.getExecutions(jobId, status, workerId, pageable);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get execution details and logs")
    public JobExecutionResponse getExecutionById(@PathVariable String id) {
        return executionService.getExecutionById(id);
    }

    @PostMapping("/{id}/retry")
    @Operation(summary = "Manually retry an execution")
    public JobExecutionResponse retryExecution(@PathVariable String id) {
        return executionService.retryExecution(id);
    }
}
