package com.taskforge.service;

import com.taskforge.dto.JobExecutionResponse;
import com.taskforge.entity.JobExecutionEntity;
import com.taskforge.enums.ExecutionStatus;
import com.taskforge.exception.ResourceNotFoundException;
import com.taskforge.messaging.JobTaskMessage;
import com.taskforge.repository.JobExecutionRepository;
import com.taskforge.repository.JobRepository;
import com.taskforge.worker.WorkerEngineService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExecutionService {

    private final JobExecutionRepository executionRepository;
    private final JobRepository jobRepository;
    private final WorkerEngineService workerEngineService;

    public Page<JobExecutionResponse> getExecutions(String jobId, ExecutionStatus status, String workerId, Pageable pageable) {
        return executionRepository.searchExecutions(jobId, status, workerId, pageable)
                .map(this::mapToResponse);
    }

    public JobExecutionResponse getExecutionById(String id) {
        JobExecutionEntity entity = executionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Execution not found: " + id));
        return mapToResponse(entity);
    }

    public JobExecutionResponse retryExecution(String executionId) {
        JobExecutionEntity oldExec = executionRepository.findById(executionId)
                .orElseThrow(() -> new ResourceNotFoundException("Execution not found: " + executionId));

        var job = jobRepository.findById(oldExec.getJobId())
                .orElseThrow(() -> new ResourceNotFoundException("Associated job no longer exists"));

        String newExecId = UUID.randomUUID().toString();
        String corrId = "tf-retry-" + UUID.randomUUID().toString().substring(0, 8);

        JobExecutionEntity newExec = JobExecutionEntity.builder()
                .id(newExecId)
                .jobId(job.getId())
                .jobName(job.getName())
                .attemptNumber(oldExec.getAttemptNumber() + 1)
                .status(ExecutionStatus.RUNNING)
                .startedAt(Instant.now())
                .correlationId(corrId)
                .build();
        newExec.getLogs().add("[" + Instant.now() + "] Manual retry initiated from execution: " + executionId);
        executionRepository.save(newExec);

        JobTaskMessage message = JobTaskMessage.builder()
                .executionId(newExecId)
                .jobId(job.getId())
                .jobName(job.getName())
                .taskType(job.getTaskType())
                .payload(job.getPayload())
                .attemptNumber(1)
                .maxRetries(job.getMaxRetries())
                .retryBackoffSeconds(job.getRetryBackoffSeconds())
                .retryExponential(job.getRetryExponential())
                .timeoutSeconds(job.getTimeoutSeconds())
                .correlationId(corrId)
                .enqueuedAt(Instant.now())
                .build();

        workerEngineService.submitTask(message);
        return mapToResponse(newExec);
    }

    public JobExecutionResponse mapToResponse(JobExecutionEntity e) {
        return JobExecutionResponse.builder()
                .id(e.getId())
                .jobId(e.getJobId())
                .jobName(e.getJobName())
                .attemptNumber(e.getAttemptNumber())
                .workerId(e.getWorkerId())
                .status(e.getStatus())
                .startedAt(e.getStartedAt())
                .completedAt(e.getCompletedAt())
                .durationMs(e.getDurationMs())
                .resultSummary(e.getResultSummary())
                .errorMessage(e.getErrorMessage())
                .stackTrace(e.getStackTrace())
                .correlationId(e.getCorrelationId())
                .logs(e.getLogs())
                .build();
    }
}
