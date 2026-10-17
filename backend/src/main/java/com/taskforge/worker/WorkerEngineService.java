package com.taskforge.worker;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskforge.entity.JobEntity;
import com.taskforge.entity.JobExecutionEntity;
import com.taskforge.entity.WorkerInstanceEntity;
import com.taskforge.enums.ExecutionStatus;
import com.taskforge.enums.JobStatus;
import com.taskforge.enums.WorkerStatus;
import com.taskforge.messaging.JobDispatcher;
import com.taskforge.messaging.JobTaskMessage;
import com.taskforge.messaging.RabbitConfig;
import com.taskforge.repository.JobExecutionRepository;
import com.taskforge.repository.JobRepository;
import com.taskforge.repository.WorkerInstanceRepository;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.lang.management.ManagementFactory;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

@Slf4j
@Service
@RequiredArgsConstructor
public class WorkerEngineService {

    private final TaskHandlerRegistry taskHandlerRegistry;
    private final JobRepository jobRepository;
    private final JobExecutionRepository executionRepository;
    private final WorkerInstanceRepository workerRepository;
    private final JobDispatcher jobDispatcher;
    private final ObjectMapper objectMapper;

    @Value("${taskforge.worker.id:worker-alpha-1}")
    private String workerId;

    @Value("${taskforge.worker.max-concurrency:5}")
    private int maxConcurrency;

    private ThreadPoolExecutor workerExecutor;
    private final AtomicInteger activeTaskCount = new AtomicInteger(0);
    private final AtomicLong totalProcessedCount = new AtomicLong(0);
    private final AtomicLong totalSuccessCount = new AtomicLong(0);
    private final AtomicLong totalFailedCount = new AtomicLong(0);
    private volatile String currentTask = "IDLE";

    @PostConstruct
    public void init() {
        log.info("Initializing TaskForge Worker Engine [{}] with maxConcurrency: {}", workerId, maxConcurrency);
        workerExecutor = new ThreadPoolExecutor(
                Math.max(2, maxConcurrency / 2),
                maxConcurrency,
                60L, TimeUnit.SECONDS,
                new LinkedBlockingQueue<>(1000),
                new ThreadFactory() {
                    private final AtomicInteger count = new AtomicInteger(1);
                    @Override
                    public Thread newThread(Runnable r) {
                        return new Thread(r, "taskforge-worker-" + workerId + "-" + count.getAndIncrement());
                    }
                },
                new ThreadPoolExecutor.CallerRunsPolicy()
        );

        sendHeartbeat();
    }

    @PreDestroy
    public void shutdown() {
        log.info("Shutting down worker engine [{}]", workerId);
        if (workerExecutor != null) {
            workerExecutor.shutdown();
            try {
                if (!workerExecutor.awaitTermination(5, TimeUnit.SECONDS)) {
                    workerExecutor.shutdownNow();
                }
            } catch (InterruptedException e) {
                workerExecutor.shutdownNow();
                Thread.currentThread().interrupt();
            }
        }
        try {
            workerRepository.findById(workerId).ifPresent(w -> {
                w.setStatus(WorkerStatus.OFFLINE);
                w.setUpdatedAt(Instant.now());
                workerRepository.save(w);
            });
        } catch (Exception ignored) {}
    }

    @Scheduled(fixedRate = 10000)
    public void sendHeartbeat() {
        try {
            String hostname = "localhost";
            try {
                hostname = java.net.InetAddress.getLocalHost().getHostName();
            } catch (Exception ignored) {}

            WorkerStatus status = activeTaskCount.get() >= maxConcurrency ? WorkerStatus.BUSY : WorkerStatus.ONLINE;

            WorkerInstanceEntity worker = workerRepository.findById(workerId)
                    .orElse(WorkerInstanceEntity.builder()
                            .workerId(workerId)
                            .hostname(hostname)
                            .startedAt(Instant.now())
                            .build());

            worker.setHostname(hostname);
            worker.setLastHeartbeat(Instant.now());
            worker.setStatus(status);
            worker.setActiveExecutions(activeTaskCount.get());
            worker.setMaxConcurrency(maxConcurrency);
            worker.setCurrentTask(currentTask);
            worker.setTotalProcessed(totalProcessedCount.get());
            worker.setTotalSuccess(totalSuccessCount.get());
            worker.setTotalFailed(totalFailedCount.get());
            worker.setVersion("1.0.0");
            workerRepository.save(worker);
        } catch (Exception e) {
            log.warn("Failed to update heartbeat for worker {}: {}", workerId, e.getMessage());
        }
    }

    public void submitTask(JobTaskMessage message) {
        workerExecutor.submit(() -> processJobMessage(message));
    }

    public void processJobMessage(JobTaskMessage message) {
        String executionId = message.getExecutionId();
        String jobId = message.getJobId();

        // Idempotency check: Guard against duplicate message deliveries
        Optional<JobExecutionEntity> existingOpt = executionRepository.findById(executionId);
        if (existingOpt.isPresent()) {
            JobExecutionEntity existing = existingOpt.get();
            if (existing.getStatus() == ExecutionStatus.SUCCEEDED ||
                existing.getStatus() == ExecutionStatus.FAILED ||
                existing.getStatus() == ExecutionStatus.CANCELLED) {
                log.warn("Ignoring duplicate delivery for already completed execution: {}", executionId);
                return;
            }
        }

        activeTaskCount.incrementAndGet();
        currentTask = message.getJobName() + " (" + message.getTaskType() + ")";
        Instant start = Instant.now();
        List<String> logsList = new ArrayList<>();
        logsList.add("[" + Instant.now() + "] Task accepted by worker " + workerId + " (attempt " + message.getAttemptNumber() + ")");

        log.info("Worker [{}] starting execution {} for job {} [{}]",
                workerId, executionId, jobId, message.getJobName());

        // Update execution entity to RUNNING and worker assignment
        updateExecutionStatus(executionId, ExecutionStatus.RUNNING, workerId, start, null, null, null, null, logsList);

        try {
            TaskHandler handler = taskHandlerRegistry.getHandler(message.getTaskType());
            if (handler == null) {
                throw new IllegalStateException("No registered TaskHandler found for type: " + message.getTaskType());
            }

            logsList.add("[" + Instant.now() + "] Executing handler: " + handler.getClass().getSimpleName());

            // Run task with configured execution timeout
            int timeoutSec = message.getTimeoutSeconds() > 0 ? message.getTimeoutSeconds() : 60;
            Future<String> future = CompletableFuture.supplyAsync(() -> {
                try {
                    return handler.execute(jobId, message.getPayload(), message.getExtraContext());
                } catch (Exception ex) {
                    throw new CompletionException(ex);
                }
            });

            String resultSummary;
            try {
                resultSummary = future.get(timeoutSec, TimeUnit.SECONDS);
            } catch (TimeoutException te) {
                future.cancel(true);
                throw new TimeoutException("Job execution timed out after " + timeoutSec + "s");
            } catch (ExecutionException ee) {
                throw (Exception) ee.getCause();
            }

            Instant finish = Instant.now();
            long duration = finish.toEpochMilli() - start.toEpochMilli();
            logsList.add("[" + finish + "] Execution succeeded in " + duration + "ms: " + resultSummary);

            totalProcessedCount.incrementAndGet();
            totalSuccessCount.incrementAndGet();

            updateExecutionStatus(executionId, ExecutionStatus.SUCCEEDED, workerId, start, finish, duration, resultSummary, null, logsList);
            markJobStatus(jobId, JobStatus.SUCCEEDED, finish);

        } catch (Exception ex) {
            Instant finish = Instant.now();
            long duration = finish.toEpochMilli() - start.toEpochMilli();
            String err = ex.getMessage() != null ? ex.getMessage() : ex.getClass().getSimpleName();
            logsList.add("[" + finish + "] Execution failed: " + err);
            totalProcessedCount.incrementAndGet();
            totalFailedCount.incrementAndGet();

            log.error("Execution failed for job {} (attempt {}): {}", jobId, message.getAttemptNumber(), err);

            // Handle Retry Logic with Exponential Backoff
            boolean canRetry = message.getAttemptNumber() < message.getMaxRetries();
            if (canRetry) {
                int nextAttempt = message.getAttemptNumber() + 1;
                long backoffSec = message.getRetryBackoffSeconds();
                if (message.isRetryExponential()) {
                    backoffSec = (long) (backoffSec * Math.pow(2, message.getAttemptNumber() - 1));
                }
                logsList.add("[" + Instant.now() + "] Scheduling retry attempt " + nextAttempt + "/" + message.getMaxRetries() + " in " + backoffSec + "s");
                updateExecutionStatus(executionId, ExecutionStatus.FAILED, workerId, start, finish, duration, null, err, logsList);

                scheduleRetry(message, nextAttempt, backoffSec);
            } else {
                logsList.add("[" + Instant.now() + "] Retry limit reached (" + message.getMaxRetries() + "). Moving to Dead Letter / Permanent Failure.");
                updateExecutionStatus(executionId, ExecutionStatus.FAILED, workerId, start, finish, duration, null, err, logsList);
                markJobStatus(jobId, JobStatus.FAILED, finish);
            }
        } finally {
            int remaining = activeTaskCount.decrementAndGet();
            if (remaining == 0) {
                currentTask = "IDLE";
            }
        }
    }

    private void scheduleRetry(JobTaskMessage oldMsg, int nextAttempt, long delaySec) {
        JobTaskMessage retryMsg = JobTaskMessage.builder()
                .executionId(UUID.randomUUID().toString())
                .jobId(oldMsg.getJobId())
                .jobName(oldMsg.getJobName())
                .taskType(oldMsg.getTaskType())
                .payload(oldMsg.getPayload())
                .attemptNumber(nextAttempt)
                .maxRetries(oldMsg.getMaxRetries())
                .retryBackoffSeconds(oldMsg.getRetryBackoffSeconds())
                .retryExponential(oldMsg.isRetryExponential())
                .timeoutSeconds(oldMsg.getTimeoutSeconds())
                .correlationId(oldMsg.getCorrelationId())
                .enqueuedAt(Instant.now())
                .extraContext(oldMsg.getExtraContext())
                .build();

        // Create initial execution record for the retry
        JobExecutionEntity newExec = JobExecutionEntity.builder()
                .id(retryMsg.getExecutionId())
                .jobId(retryMsg.getJobId())
                .jobName(retryMsg.getJobName())
                .attemptNumber(nextAttempt)
                .status(ExecutionStatus.RUNNING)
                .startedAt(Instant.now())
                .correlationId(retryMsg.getCorrelationId())
                .build();
        executionRepository.save(newExec);

        CompletableFuture.delayedExecutor(delaySec, TimeUnit.SECONDS).execute(() -> {
            submitTask(retryMsg);
        });
    }

    @Transactional
    public void updateExecutionStatus(String executionId, ExecutionStatus status, String worker,
                                      Instant startedAt, Instant completedAt, Long durationMs,
                                      String resultSummary, String errorMessage, List<String> logs) {
        try {
            executionRepository.findById(executionId).ifPresent(exec -> {
                exec.setStatus(status);
                exec.setWorkerId(worker);
                if (startedAt != null) exec.setStartedAt(startedAt);
                if (completedAt != null) exec.setCompletedAt(completedAt);
                if (durationMs != null) exec.setDurationMs(durationMs);
                if (resultSummary != null) exec.setResultSummary(resultSummary);
                if (errorMessage != null) exec.setErrorMessage(errorMessage);
                if (logs != null) exec.getLogs().addAll(logs);
                executionRepository.save(exec);
            });
        } catch (Exception e) {
            log.error("Failed to update execution {}: {}", executionId, e.getMessage());
        }
    }

    @Transactional
    public void markJobStatus(String jobId, JobStatus status, Instant finishTime) {
        try {
            jobRepository.findById(jobId).ifPresent(job -> {
                job.setStatus(status);
                job.setLastRunAt(finishTime);
                jobRepository.save(job);
            });
        } catch (Exception e) {
            log.error("Failed to update job status for {}: {}", jobId, e.getMessage());
        }
    }
}
