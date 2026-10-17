package com.taskforge;

import com.taskforge.entity.JobEntity;
import com.taskforge.entity.UserEntity;
import com.taskforge.entity.WorkerInstanceEntity;
import com.taskforge.enums.JobPriority;
import com.taskforge.enums.JobStatus;
import com.taskforge.enums.ScheduleType;
import com.taskforge.enums.WorkerStatus;
import com.taskforge.repository.JobRepository;
import com.taskforge.repository.UserRepository;
import com.taskforge.repository.WorkerInstanceRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.List;

@Slf4j
@SpringBootApplication
@EnableScheduling
public class TaskForgeApplication {

    public static void main(String[] args) {
        SpringApplication.run(TaskForgeApplication.class, args);
    }

    @Bean
    public CommandLineRunner initData(JobRepository jobRepository,
                                     UserRepository userRepository,
                                     WorkerInstanceRepository workerRepository,
                                     PasswordEncoder passwordEncoder) {
        return args -> {
            // Seed Admin User
            if (!userRepository.existsByUsername("admin")) {
                userRepository.save(UserEntity.builder()
                        .username("admin")
                        .password(passwordEncoder.encode("admin123"))
                        .role("ROLE_ADMIN")
                        .build());
                log.info("Default admin user created: admin / admin123");
            }

            // Seed sample jobs if empty
            if (jobRepository.count() == 0) {
                JobEntity job1 = JobEntity.builder()
                        .name("Hourly Metrics Aggregator")
                        .description("Processes metrics snapshots across active worker nodes")
                        .taskType("BATCH_DATA_PROCESS")
                        .payload("{\"batchSize\":500,\"metricsType\":\"CPU_MEM\"}")
                        .scheduleType(ScheduleType.FIXED_INTERVAL)
                        .fixedIntervalSeconds(120L)
                        .priority(JobPriority.HIGH)
                        .status(JobStatus.SCHEDULED)
                        .nextRunAt(Instant.now().plusSeconds(10))
                        .timeZone("UTC")
                        .build();

                JobEntity job2 = JobEntity.builder()
                        .name("Daily Executive Digest")
                        .description("Generates PDF summary and delivery dispatch")
                        .taskType("REPORT_GENERATION")
                        .payload("{\"department\":\"engineering\",\"format\":\"pdf\"}")
                        .scheduleType(ScheduleType.CRON)
                        .cronExpression("0 0 8 * * *")
                        .priority(JobPriority.NORMAL)
                        .status(JobStatus.SCHEDULED)
                        .nextRunAt(Instant.now().plusSeconds(30))
                        .timeZone("UTC")
                        .build();

                JobEntity job3 = JobEntity.builder()
                        .name("System Health Sentinel")
                        .description("Verifies runtime JVM memory, thread contention and resource usage")
                        .taskType("SYSTEM_HEALTH_CHECK")
                        .payload("{}")
                        .scheduleType(ScheduleType.FIXED_INTERVAL)
                        .fixedIntervalSeconds(60L)
                        .priority(JobPriority.CRITICAL)
                        .status(JobStatus.SCHEDULED)
                        .nextRunAt(Instant.now().plusSeconds(5))
                        .timeZone("UTC")
                        .build();

                JobEntity job4 = JobEntity.builder()
                        .name("Incident Notification Dispatcher")
                        .description("Dispatches incident alerts to on-call Slack channels")
                        .taskType("SEND_NOTIFICATION")
                        .payload("{\"channel\":\"#devops-alerts\",\"level\":\"WARNING\"}")
                        .scheduleType(ScheduleType.ONE_TIME)
                        .priority(JobPriority.HIGH)
                        .status(JobStatus.SCHEDULED)
                        .nextRunAt(Instant.now().plusSeconds(20))
                        .timeZone("UTC")
                        .build();

                jobRepository.saveAll(List.of(job1, job2, job3, job4));
                log.info("Initialized 4 sample registered jobs");
            }

            // Seed Worker Nodes
            if (workerRepository.count() == 0) {
                WorkerInstanceEntity w1 = WorkerInstanceEntity.builder()
                        .workerId("worker-alpha-1")
                        .hostname("cluster-node-01.taskforge.net")
                        .status(WorkerStatus.ONLINE)
                        .lastHeartbeat(Instant.now())
                        .activeExecutions(0)
                        .maxConcurrency(8)
                        .totalProcessed(0L)
                        .totalSuccess(0L)
                        .totalFailed(0L)
                        .currentTask("IDLE")
                        .version("1.0.0")
                        .startedAt(Instant.now().minusSeconds(86400))
                        .build();

                WorkerInstanceEntity w2 = WorkerInstanceEntity.builder()
                        .workerId("worker-bravo-2")
                        .hostname("cluster-node-02.taskforge.net")
                        .status(WorkerStatus.ONLINE)
                        .lastHeartbeat(Instant.now())
                        .activeExecutions(0)
                        .maxConcurrency(8)
                        .totalProcessed(1930L)
                        .totalSuccess(1915L)
                        .totalFailed(15L)
                        .currentTask("IDLE")
                        .version("1.0.0")
                        .startedAt(Instant.now().minusSeconds(72000))
                        .build();

                workerRepository.saveAll(List.of(w1, w2));
                log.info("Initialized default cluster worker instances");
            }
        };
    }
}
