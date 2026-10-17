package com.taskforge.dto;

import lombok.*;

import java.time.Instant;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BenchmarkResponse {
    private String id;
    private Instant runAt;
    private BenchmarkRequest config;
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
    private List<PercentilePoint> latencyPercentiles;
    private List<ThroughputPoint> throughputOverTime;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PercentilePoint {
        private String percentile;
        private double latencyMs;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ThroughputPoint {
        private int second;
        private int throughput;
    }
}
