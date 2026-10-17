package com.taskforge.scheduler;

import com.taskforge.entity.JobEntity;
import com.taskforge.entity.JobExecutionEntity;
import com.taskforge.enums.ExecutionStatus;
import com.taskforge.enums.JobPriority;
import com.taskforge.enums.JobStatus;
import com.taskforge.enums.ScheduleType;
import com.taskforge.messaging.JobDispatcher;
import com.taskforge.messaging.JobTaskMessage;
import com.taskforge.messaging.RabbitConfig;
import com.taskforge.repository.JobExecutionRepository;
import com.taskforge.repository.JobRepository;
import com.taskforge.repository.WorkerInstanceRepository;
import com.taskforge.worker.WorkerEngineService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@EnableScheduling
@RequiredArgsConstructor
public class DistributedJobScheduler {

    private final JobRepository jobRepository;
    private final JobExecutionRepository executionRepository;
    private final WorkerInstanceRepository workerRepository;
    private final ScheduleCalculator scheduleCalculator;
    private final JobDispatcher jobDispatcher;
    private final WorkerEngineService workerEngineService;

    /**
     * Polls due jobs every 2 seconds, enforces dependencies, claims safe execution,
     * updates nextRunAt, and dispatches to workers.
     */
    @Scheduled(fixedDelay = 2000)
    public void scheduleDueJobs() {
        Instant now = Instant.now();
        List<JobEntity> dueJobs = jobRepository.findEligibleJobsToSchedule(now, PageRequest.of(0, 50));

        if (!dueJobs.isEmpty()) {
            log.info("Found {} due jobs for execution at {}", dueJobs.size(), now);
        }

        for (JobEntity job : dueJobs) {
            try {
                processSingleDueJob(job.getId());
            } catch (Exception e) {
                log.error("Failed to schedule job {}: {}", job.getId(), e.getMessage());
            }
        }
    }

    /**
     * Stale worker reaper: cleans up workers whose heartbeats are older than 30 seconds.
     */
    @Scheduled(fixedRate = 15000)
    @Transactional
    public void cleanupStaleWorkers() {
        Instant cutoff = Instant.now().minusSeconds(30);
        int updated = workerRepository.markStaleWorkersOffline(cutoff);
        if (updated > 0) {
            log.info("Marked {} stale workers as OFFLINE", updated);
        }

        // Worker crash / Abandoned Execution Recovery:
        // If an execution has been RUNNING for > 5 minutes without completion, mark it FAILED/ABANDONED for retry
        Instant abandonedCutoff = Instant.now().minusSeconds(300);
        List<JobExecutionEntity> abandoned = executionRepository.findByStatusAndStartedAtBefore(ExecutionStatus.RUNNING, abandonedCutoff);
        for (JobExecutionEntity exec : abandoned) {
            log.warn("Recovering abandoned execution {} for job {} (worker heartbeat lapsed or node crashed)",
                    exec.getId(), exec.getJobName());
            exec.setStatus(ExecutionStatus.FAILED);
            exec.setErrorMessage("Execution timed out or abandoned by worker instance");
            exec.getLogs().add("[" + Instant.now() + "] Automatically recovered: marked FAILED after heartbeat timeout");
            executionRepository.save(exec);
        }
    }

    @Transactional
    public void processSingleDueJob(String jobId) {
        JobEntity job = jobRepository.findById(jobId).orElse(null);
        if (job == null || job.getStatus() != JobStatus.SCHEDULED) {
            return;
        }

        // Verify Job Dependencies (Workflow chaining)
        if (job.getDependencyJobIds() != null && !job.getDependencyJobIds().isEmpty()) {
            boolean allPrerequisitesMet = true;
            for (String depId : job.getDependencyJobIds()) {
                JobEntity dep = jobRepository.findById(depId).orElse(null);
                if (dep == null || dep.getStatus() != JobStatus.SUCCEEDED) {
                    allPrerequisitesMet = false;
                    break;
                }
            }
            if (!allPrerequisitesMet) {
                log.debug("Job {} dependency prerequisites not yet fulfilled; deferring", job.getName());
                return;
            }
        }

        // Claim job safely
        job.setStatus(JobStatus.QUEUED);
        Instant executedAt = Instant.now();

        // Calculate next scheduled run time
        if (job.getScheduleType() != ScheduleType.ONE_TIME) {
            Instant nextRun = scheduleCalculator.calculateNextRun(job, executedAt);
            job.setNextRunAt(nextRun);
            // Non-one-time jobs return to SCHEDULED status for future ticks
            job.setStatus(JobStatus.SCHEDULED);
        } else {
            job.setNextRunAt(null);
        }
        jobRepository.save(job);

        // Create Execution Record
        String executionId = UUID.randomUUID().toString();
        String correlationId = "tf-" + UUID.randomUUID().toString().substring(0, 8);

        JobExecutionEntity execution = JobExecutionEntity.builder()
                .id(executionId)
                .jobId(job.getId())
                .jobName(job.getName())
                .attemptNumber(1)
                .status(ExecutionStatus.RUNNING)
                .startedAt(executedAt)
                .correlationId(correlationId)
                .build();
        execution.getLogs().add("[" + executedAt + "] Job enqueued into queue: " + job.getTargetQueue());
        executionRepository.save(execution);

        // Build Task Message
        JobTaskMessage message = JobTaskMessage.builder()
                .executionId(executionId)
                .jobId(job.getId())
                .jobName(job.getName())
                .taskType(job.getTaskType())
                .payload(job.getPayload())
                .attemptNumber(1)
                .maxRetries(job.getMaxRetries())
                .retryBackoffSeconds(job.getRetryBackoffSeconds())
                .retryExponential(job.getRetryExponential())
                .timeoutSeconds(job.getTimeoutSeconds())
                .correlationId(correlationId)
                .enqueuedAt(executedAt)
                .build();

        String routingKey = job.getPriority() == JobPriority.CRITICAL || job.getPriority() == JobPriority.HIGH
                ? RabbitConfig.HIGH_ROUTING_KEY
                : RabbitConfig.DEFAULT_ROUTING_KEY;

        // Dispatch to RabbitMQ broker and worker pool
        jobDispatcher.dispatch(message, routingKey);
        workerEngineService.submitTask(message);
    }
}
