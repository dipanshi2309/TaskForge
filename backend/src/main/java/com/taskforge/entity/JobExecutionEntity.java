package com.taskforge.entity;

import com.taskforge.enums.ExecutionStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "job_executions", indexes = {
    @Index(name = "idx_exec_job_id", columnList = "job_id"),
    @Index(name = "idx_exec_status", columnList = "status"),
    @Index(name = "idx_exec_started_at", columnList = "started_at"),
    @Index(name = "idx_exec_worker_id", columnList = "worker_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobExecutionEntity {

    @Id
    private String id;

    @Column(name = "job_id", nullable = false)
    private String jobId;

    @Column(nullable = false, length = 120)
    private String jobName;

    @Column(nullable = false)
    private Integer attemptNumber;

    @Column(name = "worker_id", length = 100)
    private String workerId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ExecutionStatus status;

    @Column(name = "started_at", nullable = false)
    private Instant startedAt;

    private Instant completedAt;

    private Long durationMs;

    @Column(length = 1000)
    private String resultSummary;

    @Column(length = 2000)
    private String errorMessage;

    @Column(columnDefinition = "TEXT")
    private String stackTrace;

    @Column(nullable = false, length = 100)
    private String correlationId;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "execution_logs", joinColumns = @JoinColumn(name = "execution_id"))
    @Column(name = "log_line", columnDefinition = "TEXT")
    @Builder.Default
    private List<String> logs = new ArrayList<>();

    @CreationTimestamp
    @Column(updatable = false)
    private Instant createdAt;
}
