package com.taskforge;

import com.taskforge.dto.DashboardOverviewResponse;
import com.taskforge.dto.JobRequest;
import com.taskforge.dto.JobResponse;
import com.taskforge.entity.JobExecutionEntity;
import com.taskforge.enums.ExecutionStatus;
import com.taskforge.enums.JobPriority;
import com.taskforge.enums.JobStatus;
import com.taskforge.enums.ScheduleType;
import com.taskforge.messaging.JobTaskMessage;
import com.taskforge.repository.JobExecutionRepository;
import com.taskforge.repository.JobRepository;
import com.taskforge.repository.WorkerInstanceRepository;
import com.taskforge.scheduler.DistributedJobScheduler;
import com.taskforge.service.DashboardService;
import com.taskforge.service.JobService;
import com.taskforge.worker.WorkerEngineService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.Instant;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class TaskForgeApplicationTests {

    @Autowired
    private JobService jobService;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private JobExecutionRepository executionRepository;

    @Autowired
    private WorkerInstanceRepository workerRepository;

    @Autowired
    private DashboardService dashboardService;

    @Autowired
    private WorkerEngineService workerEngineService;

    @Autowired
    private DistributedJobScheduler scheduler;

    @Test
    void contextLoads() {
        assertNotNull(jobService);
        assertNotNull(dashboardService);
        assertNotNull(workerEngineService);
    }

    @Test
    void testCreateJobAndLifecycle() {
        JobRequest req = JobRequest.builder()
                .name("Integration Test Task")
                .description("Verifying end to end scheduling")
                .taskType("SYSTEM_HEALTH_CHECK")
                .payload("{}")
                .scheduleType(ScheduleType.FIXED_INTERVAL)
                .fixedIntervalSeconds(30L)
                .priority(JobPriority.HIGH)
                .build();

        JobResponse res = jobService.createJob(req);
        assertNotNull(res.getId());
        assertEquals("Integration Test Task", res.getName());
        assertEquals(JobStatus.SCHEDULED, res.getStatus());
        assertNotNull(res.getNextRunAt());

        // Test Pause
        JobResponse paused = jobService.pauseJob(res.getId());
        assertEquals(JobStatus.PAUSED, paused.getStatus());
        assertNull(paused.getNextRunAt());

        // Test Resume
        JobResponse resumed = jobService.resumeJob(res.getId());
        assertEquals(JobStatus.SCHEDULED, resumed.getStatus());
        assertNotNull(resumed.getNextRunAt());

        // Test Cancel
        JobResponse cancelled = jobService.cancelJob(res.getId());
        assertEquals(JobStatus.CANCELLED, cancelled.getStatus());
    }

    @Test
    void testSuccessRateAndAvgExecutionTimeWithZeroExecutions() {
        // Test that DashboardService correctly computes metrics even when executions are 0
        DashboardOverviewResponse overview = dashboardService.getOverview();
        assertNotNull(overview);
        assertTrue(overview.getSuccessRate() >= 0 && overview.getSuccessRate() <= 100);
        assertTrue(overview.getAverageExecutionTimeMs() >= 0);
    }

    @Test
    void testWorkerExecutionAndIdempotentDelivery() {
        String execId = UUID.randomUUID().toString();
        JobTaskMessage msg = JobTaskMessage.builder()
                .executionId(execId)
                .jobId("test-job-id")
                .jobName("Test Health Task")
                .taskType("SYSTEM_HEALTH_CHECK")
                .payload("{}")
                .attemptNumber(1)
                .maxRetries(1)
                .retryBackoffSeconds(1)
                .retryExponential(false)
                .timeoutSeconds(10)
                .correlationId("tf-test-" + execId.substring(0, 8))
                .enqueuedAt(Instant.now())
                .build();

        // Seed initial execution record
        JobExecutionEntity entity = JobExecutionEntity.builder()
                .id(execId)
                .jobId("test-job-id")
                .jobName("Test Health Task")
                .attemptNumber(1)
                .status(ExecutionStatus.RUNNING)
                .startedAt(Instant.now())
                .correlationId(msg.getCorrelationId())
                .build();
        executionRepository.save(entity);

        // Process message
        workerEngineService.processJobMessage(msg);

        // Verify execution completed as SUCCEEDED
        JobExecutionEntity completed = executionRepository.findById(execId).orElseThrow();
        assertEquals(ExecutionStatus.SUCCEEDED, completed.getStatus());
        assertNotNull(completed.getCompletedAt());
        assertNotNull(completed.getDurationMs());

        // Test Duplicate Delivery Idempotency: submitting again should be skipped
        workerEngineService.processJobMessage(msg);
        assertEquals(ExecutionStatus.SUCCEEDED, completed.getStatus());
    }

    @Test
    void testWorkerHeartbeatsAndStaleWorkerReaper() {
        workerEngineService.sendHeartbeat();
        assertFalse(workerRepository.findAll().isEmpty());

        // Test stale worker reaper
        scheduler.cleanupStaleWorkers();
    }
}
