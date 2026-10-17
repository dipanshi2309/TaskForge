package com.taskforge.entity;

import com.taskforge.enums.WorkerStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;

@Entity
@Table(name = "worker_instances", indexes = {
    @Index(name = "idx_workers_heartbeat", columnList = "last_heartbeat"),
    @Index(name = "idx_workers_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkerInstanceEntity {

    @Id
    @Column(length = 100)
    private String workerId;

    @Column(nullable = false, length = 120)
    private String hostname;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private WorkerStatus status = WorkerStatus.ONLINE;

    @Column(nullable = false)
    private Instant lastHeartbeat;

    @Column(length = 150)
    private String currentTask;

    @Column(nullable = false)
    @Builder.Default
    private Integer activeExecutions = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer maxConcurrency = 5;

    @Column(nullable = false)
    @Builder.Default
    private Long totalProcessed = 0L;

    @Column(nullable = false)
    @Builder.Default
    private Long totalSuccess = 0L;

    @Column(nullable = false)
    @Builder.Default
    private Long totalFailed = 0L;

    @Column(length = 30)
    @Builder.Default
    private String version = "1.0.0";

    @CreationTimestamp
    @Column(updatable = false)
    private Instant startedAt;

    @UpdateTimestamp
    private Instant updatedAt;
}
