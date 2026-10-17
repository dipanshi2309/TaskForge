package com.taskforge.controller;

import com.taskforge.dto.WorkerInstanceResponse;
import com.taskforge.entity.WorkerInstanceEntity;
import com.taskforge.repository.WorkerInstanceRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/workers")
@RequiredArgsConstructor
@Tag(name = "Worker Management", description = "Endpoints for inspecting worker nodes and heartbeats")
@CrossOrigin(origins = "*")
public class WorkerController {

    private final WorkerInstanceRepository workerRepository;

    @GetMapping
    @Operation(summary = "List all active and offline worker instances")
    public List<WorkerInstanceResponse> getWorkers() {
        return workerRepository.findAll().stream()
                .map(w -> WorkerInstanceResponse.builder()
                        .workerId(w.getWorkerId())
                        .hostname(w.getHostname())
                        .status(w.getStatus())
                        .lastHeartbeat(w.getLastHeartbeat())
                        .currentTask(w.getCurrentTask())
                        .activeExecutions(w.getActiveExecutions())
                        .maxConcurrency(w.getMaxConcurrency())
                        .totalProcessed(w.getTotalProcessed())
                        .totalSuccess(w.getTotalSuccess())
                        .totalFailed(w.getTotalFailed())
                        .version(w.getVersion())
                        .startedAt(w.getStartedAt())
                        .build())
                .collect(Collectors.toList());
    }
}
