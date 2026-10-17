package com.taskforge.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "benchmark_runs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BenchmarkRunEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private Integer jobCount;

    @Column(nullable = false)
    private Integer workerCount;

    @Column(nullable = false)
    private Integer concurrencyPerWorker;

    @Column(nullable = false)
    private Integer simulatedDurationMs;

    @Column(nullable = false)
    private Integer failureRatePercent;

    @Column(nullable = false)
    private Integer maxRetries;

    @Column(nullable = false, length = 30)
    private String status;

    private Long totalDurationMs;

    private Double throughputJobsPerSec;

    private Double averageLatencyMs;

    private Double medianLatencyMs;

    private Double p95LatencyMs;

    private Double queueWaitTimeMs;

    private Double successRate;

    private Double failureRate;

    private Integer totalRetries;

    @Column(columnDefinition = "TEXT")
    private String latencyPercentilesJson;

    @Column(columnDefinition = "TEXT")
    private String throughputOverTimeJson;

    @CreationTimestamp
    @Column(updatable = false)
    private Instant runAt;
}
