package com.taskforge.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskforge.dto.JobRequest;
import com.taskforge.dto.JobResponse;
import com.taskforge.entity.JobEntity;
import com.taskforge.enums.JobStatus;
import com.taskforge.enums.ScheduleType;
import com.taskforge.exception.ResourceNotFoundException;
import com.taskforge.messaging.JobDispatcher;
import com.taskforge.messaging.JobTaskMessage;
import com.taskforge.messaging.RabbitConfig;
import com.taskforge.repository.JobExecutionRepository;
import com.taskforge.repository.JobRepository;
import com.taskforge.scheduler.DistributedJobScheduler;
import com.taskforge.scheduler.ScheduleCalculator;
import com.taskforge.worker.TaskHandlerRegistry;
import com.taskforge.worker.WorkerEngineService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class JobService {

    private final JobRepository jobRepository;
    private final JobExecutionRepository executionRepository;
    private final ScheduleCalculator scheduleCalculator;
    private final TaskHandlerRegistry taskHandlerRegistry;
    private final DistributedJobScheduler distributedJobScheduler;
    private final WorkerEngineService workerEngineService;

    @Transactional
    public JobResponse createJob(JobRequest req) {
        if (!taskHandlerRegistry.hasHandler(req.getTaskType())) {
            throw new IllegalArgumentException("Unknown or disallowed task type: " + req.getTaskType() +
                    ". Available types: " + taskHandlerRegistry.getAvailableTaskTypes());
        }

        // Validate dependencies exist and do not introduce immediate cycles
        if (req.getDependencyJobIds() != null && !req.getDependencyJobIds().isEmpty()) {
            for (String depId : req.getDependencyJobIds()) {
                if (!jobRepository.existsById(depId)) {
                    throw new IllegalArgumentException("Dependent job ID not found: " + depId);
                }
            }
        }

        JobEntity entity = JobEntity.builder()
                .name(req.getName())
                .description(req.getDescription())
                .taskType(req.getTaskType().toUpperCase())
                .payload(req.getPayload())
                .scheduleType(req.getScheduleType())
                .cronExpression(req.getCronExpression())
                .fixedIntervalSeconds(req.getFixedIntervalSeconds())
                .startTime(req.getStartTime())
                .endTime(req.getEndTime())
                .timeZone(req.getTimeZone() != null ? req.getTimeZone() : "UTC")
                .priority(req.getPriority())
                .status(JobStatus.SCHEDULED)
                .maxRetries(req.getMaxRetries() != null ? req.getMaxRetries() : 3)
                .retryBackoffSeconds(req.getRetryBackoffSeconds() != null ? req.getRetryBackoffSeconds() : 5)
                .retryExponential(req.getRetryExponential() != null ? req.getRetryExponential() : true)
                .timeoutSeconds(req.getTimeoutSeconds() != null ? req.getTimeoutSeconds() : 60)
                .targetQueue(req.getTargetQueue() != null ? req.getTargetQueue() : "taskforge.jobs.default")
                .dependencyJobIds(req.getDependencyJobIds())
                .build();

        Instant nextRun = scheduleCalculator.calculateNextRun(entity, Instant.now());
        entity.setNextRunAt(nextRun);

        JobEntity saved = jobRepository.save(entity);
        log.info("Created job: {} [{}], next run at: {}", saved.getName(), saved.getId(), saved.getNextRunAt());
        return mapToResponse(saved);
    }

    public Page<JobResponse> getJobs(JobStatus status, String search, Pageable pageable) {
        return jobRepository.searchJobs(status, search, pageable).map(this::mapToResponse);
    }

    public JobResponse getJobById(String id) {
        JobEntity entity = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + id));
        return mapToResponse(entity);
    }

    @Transactional
    public JobResponse updateJob(String id, JobRequest req) {
        JobEntity job = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + id));

        job.setName(req.getName());
        job.setDescription(req.getDescription());
        job.setTaskType(req.getTaskType().toUpperCase());
        job.setPayload(req.getPayload());
        job.setScheduleType(req.getScheduleType());
        job.setCronExpression(req.getCronExpression());
        job.setFixedIntervalSeconds(req.getFixedIntervalSeconds());
        job.setPriority(req.getPriority());
        job.setMaxRetries(req.getMaxRetries());
        job.setRetryBackoffSeconds(req.getRetryBackoffSeconds());
        job.setTimeoutSeconds(req.getTimeoutSeconds());

        if (job.getStatus() == JobStatus.SCHEDULED) {
            job.setNextRunAt(scheduleCalculator.calculateNextRun(job, Instant.now()));
        }

        return mapToResponse(jobRepository.save(job));
    }

    @Transactional
    public JobResponse pauseJob(String id) {
        JobEntity job = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found: " + id));
        job.setStatus(JobStatus.PAUSED);
        job.setNextRunAt(null);
        return mapToResponse(jobRepository.save(job));
    }

    @Transactional
    public JobResponse resumeJob(String id) {
        JobEntity job = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found: " + id));
        job.setStatus(JobStatus.SCHEDULED);
        job.setNextRunAt(scheduleCalculator.calculateNextRun(job, Instant.now()));
        return mapToResponse(jobRepository.save(job));
    }

    @Transactional
    public JobResponse cancelJob(String id) {
        JobEntity job = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found: " + id));
        job.setStatus(JobStatus.CANCELLED);
        job.setNextRunAt(null);
        return mapToResponse(jobRepository.save(job));
    }

    public void triggerNow(String id) {
        JobEntity job = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found: " + id));
        distributedJobScheduler.processSingleDueJob(job.getId());
    }

    public JobResponse mapToResponse(JobEntity j) {
        return JobResponse.builder()
                .id(j.getId())
                .name(j.getName())
                .description(j.getDescription())
                .taskType(j.getTaskType())
                .payload(j.getPayload())
                .scheduleType(j.getScheduleType())
                .cronExpression(j.getCronExpression())
                .fixedIntervalSeconds(j.getFixedIntervalSeconds())
                .startTime(j.getStartTime())
                .endTime(j.getEndTime())
                .timeZone(j.getTimeZone())
                .priority(j.getPriority())
                .status(j.getStatus())
                .maxRetries(j.getMaxRetries())
                .retryBackoffSeconds(j.getRetryBackoffSeconds())
                .retryExponential(j.getRetryExponential())
                .timeoutSeconds(j.getTimeoutSeconds())
                .targetQueue(j.getTargetQueue())
                .nextRunAt(j.getNextRunAt())
                .lastRunAt(j.getLastRunAt())
                .dependencyJobIds(j.getDependencyJobIds())
                .createdAt(j.getCreatedAt())
                .updatedAt(j.getUpdatedAt())
                .build();
    }
}
